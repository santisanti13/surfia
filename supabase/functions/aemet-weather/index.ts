import { corsHeaders } from "../_shared/cors.ts";
import {
  getSpotByPlayaId,
  fetchStormglassHours,
  degToCompass,
  surfScore,
} from "../_shared/stormglass.ts";

function extractValue(obj: unknown): string {
  if (obj === null || obj === undefined) return "N/D";
  if (typeof obj === "string") return obj;
  if (typeof obj === "number") return String(obj);
  if (Array.isArray(obj)) {
    // Take first element with a value
    for (const item of obj) {
      const v = extractValue(item);
      if (v !== "N/D") return v;
    }
    return "N/D";
  }
  if (typeof obj === "object") {
    const o = obj as Record<string, unknown>;
    // Try common AEMET field names
    for (const key of ["valor1", "valor", "f1", "descripcion1", "descripcion", "value"]) {
      if (o[key] !== undefined && o[key] !== null) return String(o[key]);
    }
    // If it has periodo/valor structure, return valor
    if (o["valor1"]) return String(o["valor1"]);
    // Last resort: stringify
    return JSON.stringify(obj);
  }
  return String(obj);
}

function extractField(obj: unknown, ...keys: string[]): string {
  if (!obj || typeof obj !== "object") return "N/D";
  const o = obj as Record<string, unknown>;
  
  // If it's an array, take first element
  const target = Array.isArray(o) ? (o.length > 0 ? o[0] : null) : o;
  if (!target || typeof target !== "object") return extractValue(obj);
  
  const t = target as Record<string, unknown>;
  for (const key of keys) {
    if (t[key] !== undefined && t[key] !== null) {
      return extractValue(t[key]);
    }
  }
  return extractValue(target);
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
      const hours = await fetchStormglassHours(spot.lat, spot.lng, 6);
      if (hours && hours.length > 0) {
        const h = hours[0];
        const waveHeight = h.waveHeight ?? 0;
        const windSpeedKmh = (h.windSpeed ?? 0) * 3.6; // m/s -> km/h
        const result = {
          source: "stormglass",
          oleaje: {
            altura: `${waveHeight.toFixed(1)}m`,
            periodo: h.wavePeriod != null ? `${h.wavePeriod.toFixed(0)}s` : "N/D",
            direccion: degToCompass(h.waveDirection),
          },
          viento: {
            velocidad: `${Math.round(windSpeedKmh)} km/h`,
            direccion: degToCompass(h.windDirection),
          },
          temperatura: {
            agua: h.waterTemperature != null ? `${h.waterTemperature.toFixed(1)}°C` : "N/D",
            max: h.airTemperature != null ? `${h.airTemperature.toFixed(1)}°C` : "N/D",
            min: "N/D",
          },
          uv: "N/D",
          estado_cielo: "N/D",
          sensacion_termica: "N/D",
          score: surfScore(waveHeight, windSpeedKmh),
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
    const metaText = await metaRes.text();

    if (!metaRes.ok) {
      return new Response(JSON.stringify({ error: "AEMET API error", status: metaRes.status }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const meta = JSON.parse(metaText);
    if (!meta.datos) {
      return new Response(JSON.stringify({ error: "No data URL from AEMET", meta }), {
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
    const today = forecast.prediccion?.dia?.[0];

    if (!today) {
      return new Response(JSON.stringify({ error: "No today forecast" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // AEMET beach forecasts use descriptive terms:
    // oleaje: "en calma", "débil", "moderado", "fuerte", "muy fuerte"  
    // viento: "en calma", "flojo", "moderado", "fuerte"
    // estadoCielo: "despejado", "poco nublado", "nublado", etc.
    // tAgua, tMaxima: can be objects with valor/value or direct numbers

    const oleajeDesc = extractField(today.oleaje, "descripcion1", "descripcion", "valor1", "valor");
    const vientoDesc = extractField(today.viento, "descripcion1", "descripcion", "valor1", "valor");
    const cieloDesc = extractField(today.estadoCielo, "descripcion1", "descripcion", "valor1", "valor");
    
    const tAgua = extractField(today.tAgua, "valor1", "valor", "descripcion1");
    const tMax = extractField(today.tMaxima || today.tmaxima, "valor1", "valor", "descripcion1");
    const sTermica = extractField(today.sTermica || today.stermica, "descripcion1", "descripcion", "valor1");
    const uvMax = extractField(today.uvMax, "valor1", "valor", "descripcion1");

    // Map AEMET wave descriptions to approximate heights
    const waveMap: Record<string, number> = {
      "en calma": 0.2, "calma": 0.2, "débil": 0.5, "debil": 0.5,
      "moderado": 1.2, "moderada": 1.2, "fuerte": 2.5, "muy fuerte": 4.0,
      "marejada": 2.0, "marejadilla": 1.0, "mar gruesa": 3.5,
    };
    const waveHeight = waveMap[oleajeDesc.toLowerCase()] || 1.0;

    // Map wind descriptions  
    const windMap: Record<string, number> = {
      "en calma": 0, "calma": 0, "flojo": 10, "moderado": 20, "moderada": 20,
      "fuerte": 35, "muy fuerte": 50, "light": 10, "moderate": 20,
    };
    const windSpeed = windMap[vientoDesc.toLowerCase()] || 15;

    // Calculate surf score
    let score = 5;
    if (waveHeight >= 1.0) score += 1;
    if (waveHeight >= 1.5) score += 1;
    if (waveHeight >= 2.5) score += 1;
    if (waveHeight < 0.5) score -= 2;
    if (windSpeed < 15) score += 1;
    if (windSpeed > 30) score -= 2;
    score = Math.max(1, Math.min(10, score));

    const result = {
      oleaje: {
        altura: `${waveHeight}m`,
        periodo: "N/D",
        direccion: oleajeDesc,
      },
      viento: {
        velocidad: `${windSpeed} km/h`,
        direccion: vientoDesc,
      },
      temperatura: {
        agua: tAgua !== "N/D" ? (tAgua.includes("°") ? tAgua : `${tAgua}°C`) : "N/D",
        max: tMax !== "N/D" ? (tMax.includes("°") ? tMax : `${tMax}°C`) : "N/D",
        min: "N/D",
      },
      uv: uvMax,
      estado_cielo: cieloDesc,
      sensacion_termica: sTermica,
      score,
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
