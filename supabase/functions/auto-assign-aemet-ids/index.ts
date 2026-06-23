import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Searches AEMET catalogue for a beach and returns ALL matches.
 * Match format: /playas/{slug}-{7-digit-id}
 */
async function searchAemetBeach(query: string): Promise<Array<{ name: string; id: string }>> {
  try {
    const url = `https://www.aemet.es/es/eltiempo/prediccion/playas?modo=and&orden=n&str=${encodeURIComponent(query)}&tipo=sta`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SurfiaBot/1.0)" },
    });
    if (!res.ok) return [];
    const html = await res.text();
    const regex = /\/playas\/([\w-]+)-(\d{7})/g;
    const seen = new Set<string>();
    const matches: Array<{ name: string; id: string }> = [];
    let m;
    while ((m = regex.exec(html)) !== null) {
      if (seen.has(m[2])) continue;
      seen.add(m[2]);
      matches.push({ name: m[1].replace(/-/g, " "), id: m[2] });
    }
    return matches;
  } catch {
    return [];
  }
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Pick the best AEMET match by token overlap with name + municipality. */
function bestMatch(
  candidates: Array<{ name: string; id: string }>,
  spotName: string,
  municipality: string,
): { name: string; id: string } | null {
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  const spotTokens = new Set(normalize(spotName).split(" ").filter(Boolean));
  const muniTokens = new Set(normalize(municipality).split(" ").filter(Boolean));

  let best = candidates[0];
  let bestScore = -1;
  for (const c of candidates) {
    const tokens = normalize(c.name).split(" ").filter(Boolean);
    let score = 0;
    for (const t of tokens) {
      if (spotTokens.has(t)) score += 3;
      if (muniTokens.has(t)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const ADMIN_SECRET = Deno.env.get("ADMIN_SECRET");
  const provided = req.headers.get("x-admin-secret");
  if (!ADMIN_SECRET || provided !== ADMIN_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const limit = Math.min(body.limit ?? 20, 50);
    const dryRun = body.dry_run === true;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: spots, error } = await supabase
      .from("surf_spots")
      .select("id, name, location, playa_id_aemet")
      .is("playa_id_aemet", null)
      .order("name")
      .limit(limit);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Array<Record<string, unknown>> = [];

    for (const spot of spots || []) {
      if (results.length > 0) await new Promise((r) => setTimeout(r, 800));

      const municipality = (spot.location || "").split(",")[0]?.trim() || "";

      // 1) Search by spot name
      let candidates = await searchAemetBeach(spot.name);
      let pick = bestMatch(candidates, spot.name, municipality);

      // 2) Fallback: search by municipality
      if (!pick && municipality) {
        await new Promise((r) => setTimeout(r, 600));
        candidates = await searchAemetBeach(municipality);
        pick = bestMatch(candidates, spot.name, municipality);
      }

      if (pick) {
        if (!dryRun) {
          const { error: upErr } = await supabase
            .from("surf_spots")
            .update({ playa_id_aemet: pick.id })
            .eq("id", spot.id);
          if (upErr) {
            results.push({ spot: spot.name, status: "update_error", error: upErr.message });
            continue;
          }
        }
        results.push({
          spot: spot.name,
          location: spot.location,
          status: dryRun ? "would_assign" : "assigned",
          aemet_id: pick.id,
          aemet_name: pick.name,
        });
      } else {
        results.push({
          spot: spot.name,
          location: spot.location,
          status: "not_found",
        });
      }
    }

    const assigned = results.filter((r) => r.status === "assigned" || r.status === "would_assign").length;
    return new Response(
      JSON.stringify({
        processed: results.length,
        assigned,
        not_found: results.length - assigned,
        dry_run: dryRun,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
