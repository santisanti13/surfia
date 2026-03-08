import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Search AEMET website for a beach name and extract the beach ID from results
async function searchAemetBeach(query: string): Promise<{ name: string; id: string } | null> {
  try {
    const url = `https://www.aemet.es/es/eltiempo/prediccion/playas?modo=and&orden=n&str=${encodeURIComponent(query)}&tipo=sta`;
    const res = await fetch(url);
    const html = await res.text();
    
    // Look for beach links like: /playas/nombre-XXXXXXX
    const regex = /\/playas\/([\w-]+)-(\d{7})/g;
    const matches: Array<{ name: string; id: string }> = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      matches.push({ name: match[1].replace(/-/g, ' '), id: match[2] });
    }
    
    if (matches.length > 0) {
      // Return first unique match
      return matches[0];
    }
    return null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const searchQuery = body.query; // Optional: search a specific name
    
    if (searchQuery) {
      // Single search mode
      const result = await searchAemetBeach(searchQuery);
      return new Response(JSON.stringify({ query: searchQuery, result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Batch mode: search for all surf spots
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const batchSize = body.batch_size || 5;
    const offset = body.offset || 0;

    const { data: spots, error } = await supabase
      .from("surf_spots")
      .select("id, name, location, playa_id_aemet")
      .order("name")
      .range(offset, offset + batchSize - 1);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Array<{
      spot_name: string;
      current_id: string | null;
      found: { name: string; id: string } | null;
    }> = [];

    for (const spot of spots || []) {
      if (results.length > 0) {
        await new Promise((r) => setTimeout(r, 1000));
      }

      // Try searching by spot name
      const found = await searchAemetBeach(spot.name);
      results.push({
        spot_name: spot.name,
        current_id: spot.playa_id_aemet,
        found,
      });
    }

    return new Response(JSON.stringify({
      batch: { offset, size: batchSize, returned: results.length },
      results,
      next_offset: results.length === batchSize ? offset + batchSize : null,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
