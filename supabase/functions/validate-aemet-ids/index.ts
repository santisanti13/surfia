import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("AEMET_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AEMET API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get all spots with playa_id_aemet
    const { data: spots, error } = await supabase
      .from("surf_spots")
      .select("id, name, playa_id_aemet")
      .not("playa_id_aemet", "is", null);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Array<{
      id: string;
      name: string;
      playa_id_aemet: string;
      valid: boolean;
      status: number;
      error?: string;
    }> = [];

    for (const spot of spots || []) {
      if (!spot.playa_id_aemet) continue;

      // Add delay between requests to respect rate limits
      if (results.length > 0) {
        await new Promise((r) => setTimeout(r, 1200));
      }

      try {
        const url = `https://opendata.aemet.es/opendata/api/prediccion/especifica/playa/${spot.playa_id_aemet}`;
        const metaRes = await fetch(url, { headers: { api_key: apiKey } });

        if (!metaRes.ok) {
          results.push({
            id: spot.id,
            name: spot.name,
            playa_id_aemet: spot.playa_id_aemet,
            valid: false,
            status: metaRes.status,
            error: `AEMET returned ${metaRes.status}`,
          });
          continue;
        }

        const meta = await metaRes.json();
        if (!meta.datos) {
          results.push({
            id: spot.id,
            name: spot.name,
            playa_id_aemet: spot.playa_id_aemet,
            valid: false,
            status: 200,
            error: "No datos URL in response",
          });
          continue;
        }

        // Try fetching actual data
        const dataRes = await fetch(meta.datos);
        if (!dataRes.ok) {
          results.push({
            id: spot.id,
            name: spot.name,
            playa_id_aemet: spot.playa_id_aemet,
            valid: false,
            status: dataRes.status,
            error: "Data URL returned error",
          });
          continue;
        }

        const rawText = await dataRes.text();
        try {
          const data = JSON.parse(rawText);
          if (Array.isArray(data) && data.length > 0) {
            results.push({
              id: spot.id,
              name: spot.name,
              playa_id_aemet: spot.playa_id_aemet,
              valid: true,
              status: 200,
            });
          } else {
            results.push({
              id: spot.id,
              name: spot.name,
              playa_id_aemet: spot.playa_id_aemet,
              valid: false,
              status: 200,
              error: "Empty data array",
            });
          }
        } catch {
          results.push({
            id: spot.id,
            name: spot.name,
            playa_id_aemet: spot.playa_id_aemet,
            valid: false,
            status: 200,
            error: "Invalid JSON in data response",
          });
        }
      } catch (e) {
        results.push({
          id: spot.id,
          name: spot.name,
          playa_id_aemet: spot.playa_id_aemet,
          valid: false,
          status: 0,
          error: e.message,
        });
      }
    }

    const valid = results.filter((r) => r.valid);
    const invalid = results.filter((r) => !r.valid);

    return new Response(
      JSON.stringify({
        total: results.length,
        valid_count: valid.length,
        invalid_count: invalid.length,
        valid,
        invalid,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
