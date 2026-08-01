// Shared Stormglass helper. Fetches lat/lng from DB for the given playa_id
// (mapped to surf_spots.playa_id_aemet) and queries Stormglass marine data.
// Returns null when the key is missing, on HTTP errors, or quota exhaustion,
// so callers can fall back to AEMET.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export interface SpotCoords {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export async function getSpotByPlayaId(playa_id: string): Promise<SpotCoords | null> {
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return null;
    const sb = createClient(url, key);
    const { data, error } = await sb
      .from("surf_spots")
      .select("id, name, lat, lng")
      .eq("playa_id_aemet", playa_id)
      .maybeSingle();
    if (error || !data || data.lat == null || data.lng == null) return null;
    return data as SpotCoords;
  } catch {
    return null;
  }
}

export interface StormglassHourly {
  time: string;
  waveHeight?: number;
  wavePeriod?: number;
  waveDirection?: number;
  windSpeed?: number;
  windDirection?: number;
  waterTemperature?: number;
  airTemperature?: number;
}

const PARAMS = [
  "waveHeight",
  "wavePeriod",
  "waveDirection",
  "windSpeed",
  "windDirection",
  "waterTemperature",
  "airTemperature",
];

function pickSource(point: Record<string, unknown> | undefined): number | undefined {
  if (!point || typeof point !== "object") return undefined;
  const o = point as Record<string, number>;
  // Prefer sg (Stormglass blended), then noaa, then any other
  if (typeof o.sg === "number") return o.sg;
  if (typeof o.noaa === "number") return o.noaa;
  for (const k of Object.keys(o)) {
    if (typeof o[k] === "number") return o[k];
  }
  return undefined;
}

export async function fetchStormglassHours(
  lat: number,
  lng: number,
  hoursAhead = 72,
): Promise<StormglassHourly[] | null> {
  const apiKey = Deno.env.get("STORMGLASS_API_KEY");
  if (!apiKey) return null;
  try {
    const start = Math.floor(Date.now() / 1000);
    const end = start + hoursAhead * 3600;
    const url = `https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lng}&params=${PARAMS.join(",")}&start=${start}&end=${end}`;
    const res = await fetch(url, { headers: { Authorization: apiKey } });
    if (!res.ok) {
      console.warn("[stormglass] HTTP", res.status, await res.text().catch(() => ""));
      return null;
    }
    const json = await res.json();
    if (!json?.hours || !Array.isArray(json.hours)) return null;
    return json.hours.map((h: Record<string, unknown>) => ({
      time: String(h.time),
      waveHeight: pickSource(h.waveHeight as Record<string, unknown> | undefined),
      wavePeriod: pickSource(h.wavePeriod as Record<string, unknown> | undefined),
      waveDirection: pickSource(h.waveDirection as Record<string, unknown> | undefined),
      windSpeed: pickSource(h.windSpeed as Record<string, unknown> | undefined),
      windDirection: pickSource(h.windDirection as Record<string, unknown> | undefined),
      waterTemperature: pickSource(h.waterTemperature as Record<string, unknown> | undefined),
      airTemperature: pickSource(h.airTemperature as Record<string, unknown> | undefined),
    }));
  } catch (err) {
    console.warn("[stormglass] fetch error", (err as Error).message);
    return null;
  }
}

// ===== Open-Meteo fallback (free, no API key) =====
// Used when Stormglass is unavailable (missing key / quota) and there is no
// AEMET playa_id. Returns the same hourly shape.
export async function fetchOpenMeteoHours(
  lat: number,
  lng: number,
  hoursAhead = 72,
): Promise<StormglassHourly[] | null> {
  try {
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&hourly=wave_height,wave_period,wave_direction,sea_surface_temperature&forecast_days=3&timezone=UTC`;
    const windUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=wind_speed_10m,wind_direction_10m,temperature_2m&forecast_days=3&timezone=UTC&wind_speed_unit=ms`;
    const [mRes, wRes] = await Promise.all([fetch(marineUrl), fetch(windUrl)]);
    if (!mRes.ok && !wRes.ok) return null;
    const marine = mRes.ok ? await mRes.json() : null;
    const wind = wRes.ok ? await wRes.json() : null;

    const times: string[] = marine?.hourly?.time ?? wind?.hourly?.time ?? [];
    if (!times.length) return null;

    const windIndexByTime = new Map<string, number>();
    (wind?.hourly?.time ?? []).forEach((t: string, i: number) => windIndexByTime.set(t, i));

    const nowIso = new Date().toISOString().slice(0, 13);
    const out: StormglassHourly[] = [];
    for (let i = 0; i < times.length && out.length < hoursAhead; i++) {
      const t = times[i];
      if (t.slice(0, 13) < nowIso) continue;
      const wi = windIndexByTime.get(t);
      out.push({
        time: `${t}:00Z`,
        waveHeight: marine?.hourly?.wave_height?.[i] ?? undefined,
        wavePeriod: marine?.hourly?.wave_period?.[i] ?? undefined,
        waveDirection: marine?.hourly?.wave_direction?.[i] ?? undefined,
        windSpeed: wi != null ? wind?.hourly?.wind_speed_10m?.[wi] ?? undefined : undefined,
        windDirection: wi != null ? wind?.hourly?.wind_direction_10m?.[wi] ?? undefined : undefined,
        waterTemperature: marine?.hourly?.sea_surface_temperature?.[i] ?? undefined,
        airTemperature: wi != null ? wind?.hourly?.temperature_2m?.[wi] ?? undefined : undefined,
      });
    }
    return out.length ? out : null;
  } catch (err) {
    console.warn("[open-meteo] fetch error", (err as Error).message);
    return null;
  }
}

export function degToCompass(deg?: number): string {
  if (deg == null || isNaN(deg)) return "N/D";
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

export function surfScore(waveHeight = 0, windSpeed = 0): number {
  let score = 5;
  if (waveHeight >= 1.0) score += 1;
  if (waveHeight >= 1.5) score += 1;
  if (waveHeight >= 2.5) score += 1;
  if (waveHeight < 0.5) score -= 2;
  if (windSpeed < 15) score += 1;
  if (windSpeed > 30) score -= 2;
  return Math.max(1, Math.min(10, score));
}
