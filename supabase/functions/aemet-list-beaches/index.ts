import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("AEMET_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "No API key" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the master list of beaches
    const metaRes = await fetch(
      "https://opendata.aemet.es/opendata/api/maestro/municipio/playas",
      { headers: { "api_key": apiKey } }
    );
    const meta = await metaRes.json();
    
    if (!meta.datos) {
      return new Response(JSON.stringify({ error: "No data URL", meta }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const dataRes = await fetch(meta.datos);
    const beaches = await dataRes.json();

    // Return simplified list: id and nombre
    const simplified = beaches.map((b: any) => ({
      id: b.ID_PLAYA || b.id,
      nombre: b.NOMBRE_PLAYA || b.nombre,
      municipio: b.NOMBRE_MUNICIPIO || b.municipio,
      provincia: b.NOMBRE_PROVINCIA || b.provincia,
    }));

    return new Response(JSON.stringify({ count: simplified.length, beaches: simplified }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
