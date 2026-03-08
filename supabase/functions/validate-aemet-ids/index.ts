import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const batchSize = body.batch_size || 10;
    const offset = body.offset || 0;

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

    const { data: spots, error } = await supabase
      .from("surf_spots")
      .select("id, name, playa_id_aemet")
      .not("playa_id_aemet", "is", null)
      .order("name")
      .range(offset, offset + batchSize - 1);

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
      error?: string;
    }> = [];

    for (const spot of spots || []) {
      if (!spot.playa_id_aemet) continue;

      if (results.length > 0) {
        await new Promise((r) => setTimeout(r, 700));
      }

      try {
        const url = `https://opendata.aemet.es/opendata/api/prediccion/especifica/playa/${spot.playa_id_aemet}`;
        const metaRes = await fetch(url, { headers: { api_key: apiKey } });

        if (!metaRes.ok) {
          results.push({ id: spot.id, name: spot.name, playa_id_aemet: spot.playa_id_aemet, valid: false, error: `HTTP ${metaRes.status}` });
          continue;
        }

        const meta = await metaRes.json();
        if (!meta.datos) {
          results.push({ id: spot.id, name: spot.name, playa_id_aemet: spot.playa_id_aemet, valid: false, error: "No datos URL" });
          continue;
        }

        const dataRes = await fetch(meta.datos);
        const rawText = await dataRes.text();
        try {
          const data = JSON.parse(rawText);
          const isValid = Array.isArray(data) && data.length > 0;
          results.push({ id: spot.id, name: spot.name, playa_id_aemet: spot.playa_id_aemet, valid: isValid, error: isValid ? undefined : "Empty data" });
        } catch {
          results.push({ id: spot.id, name: spot.name, playa_id_aemet: spot.playa_id_aemet, valid: false, error: "Invalid JSON" });
        }
      } catch (e) {
        results.push({ id: spot.id, name: spot.name, playa_id_aemet: spot.playa_id_aemet, valid: false, error: e.message });
      }
    }

    const valid = results.filter((r) => r.valid);
    const invalid = results.filter((r) => !r.valid);

    return new Response(
      JSON.stringify({
        batch: { offset, size: batchSize, returned: results.length },
        valid_count: valid.length,
        invalid_count: invalid.length,
        valid: valid.map((r) => `${r.name} (${r.playa_id_aemet})`),
        invalid,
        next_offset: results.length === batchSize ? offset + batchSize : null,
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
