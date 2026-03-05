import { corsHeaders } from "../_shared/cors.ts";

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

    const apiKey = Deno.env.get("AEMET_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AEMET API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 1: Get data URL from AEMET
    const aemetUrl = `https://opendata.aemet.es/opendata/api/prediccion/especifica/playa/${playa_id}`;
    const metaRes = await fetch(aemetUrl, {
      headers: { "api_key": apiKey },
    });

    if (!metaRes.ok) {
      return new Response(JSON.stringify({ error: "AEMET API error", status: metaRes.status }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const meta = await metaRes.json();

    if (!meta.datos) {
      return new Response(JSON.stringify({ error: "No data URL from AEMET" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 2: Fetch actual data
    const dataRes = await fetch(meta.datos);
    const rawData = await dataRes.json();

    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      return new Response(JSON.stringify({ error: "No forecast data" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const forecast = rawData[0];
    const today = forecast.prediccion?.dia?.[0];

    if (!today) {
      return new Response(JSON.stringify({ error: "No today forecast" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse AEMET data into clean format
    const oleaje = today.oleaje;
    const viento = today.viento;
    const tAgua = today.tAgua;
    const tMax = today.tMaxima;
    const tMin = today.tMinima;
    const uv = today.uvMax;
    const cielo = today.estadoCielo;

    // Calculate surf score (1-10)
    let score = 5;
    if (oleaje) {
      const altura = parseFloat(oleaje.valor1 || oleaje.f1 || "1");
      if (altura >= 1.5) score += 2;
      if (altura >= 2.5) score += 1;
      if (altura < 0.5) score -= 2;
    }
    if (viento) {
      const vel = parseInt(viento.velocidad || "15");
      if (vel < 15) score += 1;
      if (vel > 30) score -= 2;
    }
    score = Math.max(1, Math.min(10, score));

    const result = {
      oleaje: oleaje
        ? {
            altura: `${oleaje.valor1 || oleaje.f1 || "?"}m`,
            periodo: `${oleaje.periodo1 || "?"}s`,
            direccion: oleaje.direccion1 || "?",
          }
        : { altura: "N/D", periodo: "N/D", direccion: "N/D" },
      viento: viento
        ? {
            velocidad: `${viento.velocidad || "?"} km/h`,
            direccion: viento.direccion || "?",
          }
        : { velocidad: "N/D", direccion: "N/D" },
      temperatura: {
        agua: tAgua ? `${tAgua}°C` : "N/D",
        max: tMax ? `${tMax}°C` : "N/D",
        min: tMin ? `${tMin}°C` : "N/D",
      },
      uv: uv ? `${uv}` : "N/D",
      estado_cielo: cielo?.descripcion1 || "N/D",
      score,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
