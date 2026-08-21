import { corsHeaders } from "../_shared/cors.ts";

// Extract lat/lng from a Google Maps URL
function extractCoords(url: string): { lat: number; lng: number } | null {
  const patterns = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/, // /@lat,lng,zoom
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // place data
    /[?&](?:q|query|ll|center|destination)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/,
    /\/(-?\d+\.\d+),(-?\d+\.\d+)/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) {
      const lat = parseFloat(m[1]);
      const lng = parseFloat(m[2]);
      if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
        return { lat, lng };
      }
    }
  }
  return null;
}

function extractName(url: string): string | null {
  const m = url.match(/\/maps\/place\/([^/@?]+)/);
  if (!m) return null;
  try {
    return decodeURIComponent(m[1].replace(/\+/g, " ")).trim();
  } catch {
    return null;
  }
}

const ALLOWED_HOSTS = [
  "google.com",
  "www.google.com",
  "maps.google.com",
  "goo.gl",
  "maps.app.goo.gl",
  "g.co",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (typeof url !== "string" || url.length > 2000) {
      return new Response(JSON.stringify({ error: "URL inválida" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed: URL;
    try {
      parsed = new URL(url.trim());
    } catch {
      return new Response(JSON.stringify({ error: "URL inválida" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const host = parsed.hostname.replace(/^www\./, "");
    if (!ALLOWED_HOSTS.includes(parsed.hostname) && !ALLOWED_HOSTS.includes(host)) {
      return new Response(JSON.stringify({ error: "Solo se admiten enlaces de Google Maps" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Direct parse first
    let finalUrl = parsed.toString();
    let coords = extractCoords(finalUrl);

    // Follow redirects for short links (maps.app.goo.gl / goo.gl)
    if (!coords) {
      let current = finalUrl;
      for (let i = 0; i < 5 && !coords; i++) {
        const res = await fetch(current, { redirect: "manual" });
        const loc = res.headers.get("location");
        if (loc) {
          current = new URL(loc, current).toString();
          finalUrl = current;
          coords = extractCoords(current);
          continue;
        }
        // No more redirects: try parsing the HTML body
        const html = await res.text();
        coords = extractCoords(html);
        break;
      }
    }

    if (!coords) {
      return new Response(
        JSON.stringify({ error: "No se pudieron extraer coordenadas de ese enlace" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ lat: coords.lat, lng: coords.lng, name: extractName(finalUrl) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
