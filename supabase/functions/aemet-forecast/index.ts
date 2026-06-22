import { corsHeaders } from "../_shared/cors.ts";
import { getSpotByPlayaId, fetchStormglassHours } from "../_shared/stormglass.ts";

// AEMET beach forecasts provide data in periods per day:
// Periods: "00-06", "06-12", "12-18", "18-24" (or "00-24" for full day)
// Days: typically 3 days of forecast

interface PeriodData {
  periodo: string;
  oleaje?: string;
  viento?: string;
  estadoCielo?: string;
}

interface DayForecast {
  fecha: string;
  periodos: PeriodData[];
  tAgua?: string;
  tMaxima?: string;
  uvMax?: string;
}

function safeString(val: unknown): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (Array.isArray(val)) {
    for (const item of val) {
      const s = safeString(item);
      if (s) return s;
    }
    return "";
  }
  if (typeof val === "object") {
    const o = val as Record<string, unknown>;
    for (const key of ["descripcion1", "descripcion", "valor1", "valor", "value"]) {
      if (o[key] !== undefined && o[key] !== null) return String(o[key]);
    }
    return JSON.stringify(val);
  }
  return String(val);
}

// Map AEMET wave descriptions to approximate heights in meters
const waveMap: Record<string, number> = {
  "en calma": 0.2, "calma": 0.2, "rizada": 0.3,
  "débil": 0.5, "debil": 0.5, "marejadilla": 1.0,
  "moderado": 1.2, "moderada": 1.2, "marejada": 2.0,
  "fuerte": 2.5, "mar gruesa": 3.5, "muy fuerte": 4.0,
  "arbolada": 5.0, "montañosa": 7.0, "enorme": 10.0,
};

// Map AEMET wind descriptions to approximate speeds in km/h
const windMap: Record<string, number> = {
  "en calma": 3, "calma": 3, "flojo": 12, "floja": 12,
  "moderado": 22, "moderada": 22,
  "fuerte": 38, "muy fuerte": 55,
};

function parseWaveHeight(desc: string): number {
  const lower = desc.toLowerCase().trim();
  return waveMap[lower] ?? 1.0;
}

function parseWindSpeed(desc: string): number {
  const lower = desc.toLowerCase().trim();
  return windMap[lower] ?? 15;
}

// Convert AEMET period data into chart-friendly hourly-ish points
function periodToHours(periodo: string): number[] {
  const match = periodo.match(/(\d{2})-(\d{2})/);
  if (!match) return [12];
  const start = parseInt(match[1]);
  const end = parseInt(match[2]);
  // Return midpoint of period
  const mid = start + (end - start) / 2;
  return [mid];
}

function extractPeriods(dayData: Record<string, unknown>): PeriodData[] {
  const periods: PeriodData[] = [];

  // AEMET beach forecast structure: oleaje, viento, estadoCielo can be arrays of {periodo, descripcion1/valor1}
  const oleajeArr = Array.isArray(dayData.oleaje) ? dayData.oleaje : dayData.oleaje ? [dayData.oleaje] : [];
  const vientoArr = Array.isArray(dayData.viento) ? dayData.viento : dayData.viento ? [dayData.viento] : [];
  const cieloArr = Array.isArray(dayData.estadoCielo) ? dayData.estadoCielo : dayData.estadoCielo ? [dayData.estadoCielo] : [];

  // Collect all unique periods
  const periodSet = new Set<string>();
  for (const arr of [oleajeArr, vientoArr, cieloArr]) {
    for (const item of arr) {
      if (item && typeof item === "object") {
        const o = item as Record<string, unknown>;
        const p = String(o.periodo || o.periodo1 || "00-24");
        if (p && p !== "undefined") periodSet.add(p);
      }
    }
  }

  if (periodSet.size === 0) periodSet.add("00-24");

  const sortedPeriods = Array.from(periodSet).sort();

  for (const periodo of sortedPeriods) {
    const findForPeriod = (arr: unknown[]): string => {
      for (const item of arr) {
        if (item && typeof item === "object") {
          const o = item as Record<string, unknown>;
          const p = String(o.periodo || o.periodo1 || "00-24");
          if (p === periodo || p === "00-24") {
            return safeString(o.descripcion1 || o.descripcion || o.valor1 || o.valor || o);
          }
        }
      }
      // If no period match, try the first item
      if (arr.length > 0) return safeString(arr[0]);
      return "";
    };

    periods.push({
      periodo,
      oleaje: findForPeriod(oleajeArr),
      viento: findForPeriod(vientoArr),
      estadoCielo: findForPeriod(cieloArr),
    });
  }

  return periods;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { playa_id } = await req.json();

    if (!playa_id) {
      return new Response(JSON.stringify({ error: "playa_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ===== 1) Try Stormglass first =====
    const spot = await getSpotByPlayaId(playa_id);
    if (spot) {
      const hours = await fetchStormglassHours(spot.lat, spot.lng, 72);
      if (hours && hours.length > 0) {
        const dayNames = ["Hoy", "Mañana", "Pasado"];
        const startMs = Date.now();
        const chartData = hours
          .filter((_, i) => i % 3 === 0) // every 3h to keep chart readable
          .map((h) => {
            const t = new Date(h.time);
            const dayIndex = Math.min(
              2,
              Math.floor((t.getTime() - startMs) / (24 * 3600 * 1000)),
            );
            const hour = t.getHours();
            const wave = h.waveHeight ?? 0;
            const wind = (h.windSpeed ?? 0) * 3.6;
            return {
              label: `${dayNames[Math.max(0, dayIndex)] ?? "Día"} ${String(hour).padStart(2, "0")}:00`,
              hour,
              dayIndex: Math.max(0, dayIndex),
              waveHeight: Number(wave.toFixed(2)),
              windSpeed: Math.round(wind),
              waveDesc: `${wave.toFixed(1)}m`,
              windDesc: `${Math.round(wind)} km/h`,
              skyDesc: "",
            };
          });
        const first = hours[0];
        const result = {
          source: "stormglass",
          chartData,
          general: {
            tAgua: first.waterTemperature != null ? `${first.waterTemperature.toFixed(1)}°C` : "N/D",
            tMax: first.airTemperature != null ? `${first.airTemperature.toFixed(1)}°C` : "N/D",
            uvMax: "N/D",
          },
          daysCount: 3,
        };
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ===== 2) Fallback to AEMET =====
    const apiKey = Deno.env.get("AEMET_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AEMET API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aemetUrl = `https://opendata.aemet.es/opendata/api/prediccion/especifica/playa/${playa_id}`;
    const metaRes = await fetch(aemetUrl, { headers: { "api_key": apiKey } });

    if (!metaRes.ok) {
      return new Response(JSON.stringify({ error: "AEMET API error", status: metaRes.status }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const meta = await metaRes.json();
    if (!meta.datos) {
      return new Response(JSON.stringify({ error: "No data URL from AEMET" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const dataRes = await fetch(meta.datos);
    const rawText = await dataRes.text();
    let rawData;
    try { rawData = JSON.parse(rawText); } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON from AEMET" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      return new Response(JSON.stringify({ error: "No forecast data" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const forecast = rawData[0];
    const dias = forecast.prediccion?.dia;

    if (!dias || !Array.isArray(dias) || dias.length === 0) {
      return new Response(JSON.stringify({ error: "No days in forecast" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build chart-friendly data points
    const chartData: Array<{
      label: string;
      hour: number;
      dayIndex: number;
      waveHeight: number;
      windSpeed: number;
      waveDesc: string;
      windDesc: string;
      skyDesc: string;
    }> = [];

    const dayNames = ["Hoy", "Mañana", "Pasado"];

    for (let d = 0; d < Math.min(dias.length, 3); d++) {
      const day = dias[d] as Record<string, unknown>;
      const periods = extractPeriods(day);
      const dayLabel = dayNames[d] || `Día ${d + 1}`;

      for (const period of periods) {
        const hours = periodToHours(period.periodo);
        for (const h of hours) {
          const waveDesc = period.oleaje || "";
          const windDesc = period.viento || "";
          chartData.push({
            label: `${dayLabel} ${String(Math.floor(h)).padStart(2, "0")}:00`,
            hour: h,
            dayIndex: d,
            waveHeight: parseWaveHeight(waveDesc),
            windSpeed: parseWindSpeed(windDesc),
            waveDesc,
            windDesc,
            skyDesc: period.estadoCielo || "",
          });
        }
      }
    }

    // Extract general info
    const today = dias[0] as Record<string, unknown>;
    const tAgua = safeString(today.tAgua);
    const tMax = safeString(today.tMaxima || today.tmaxima);
    const uvMax = safeString(today.uvMax);

    const result = {
      source: "aemet",
      chartData,
      general: {
        tAgua: tAgua || "N/D",
        tMax: tMax || "N/D",
        uvMax: uvMax || "N/D",
      },
      daysCount: Math.min(dias.length, 3),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
