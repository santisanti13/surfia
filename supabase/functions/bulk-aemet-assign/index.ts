import { corsHeaders } from "../_shared/cors.ts";

// One-shot internal runner: loops the auto-assign-aemet-ids function in default
// "assign" mode (which now includes municipality fallback) until no more nulls
// can be converted or a safety cap is hit. Uses ADMIN_SECRET from env so we
// don't have to expose it. Aggregates results across batches.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const ADMIN_SECRET = Deno.env.get("ADMIN_SECRET");
  if (!ADMIN_SECRET) {
    return new Response(JSON.stringify({ error: "ADMIN_SECRET not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/auto-assign-aemet-ids`;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;

  const body = await req.json().catch(() => ({}));
  const maxBatches = Math.min(body.max_batches ?? 6, 10);
  const limit = Math.min(body.limit ?? 50, 50);
  const dryRun = body.dry_run === true;

  const allResults: Array<Record<string, unknown>> = [];
  let totalAssigned = 0;
  let totalProcessed = 0;
  let batchesRun = 0;
  let lastBatch: Record<string, unknown> | null = null;

  for (let i = 0; i < maxBatches; i++) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": ADMIN_SECRET,
        "Authorization": `Bearer ${anon}`,
        "apikey": anon,
      },
      body: JSON.stringify({ limit, dry_run: dryRun, mode: "assign" }),
    });
    const json = await res.json().catch(() => ({ error: "parse_error" }));
    batchesRun++;
    lastBatch = json;
    if (!res.ok) {
      return new Response(JSON.stringify({ error: "downstream", status: res.status, json, batchesRun }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const processed = Number(json.processed ?? 0);
    const assigned = Number(json.assigned ?? 0);
    totalProcessed += processed;
    totalAssigned += assigned;
    if (Array.isArray(json.results)) allResults.push(...json.results);
    // Stop if nothing left to process, or this batch assigned nothing (no progress)
    if (processed === 0) break;
    if (assigned === 0 && !dryRun) break;
  }

  return new Response(
    JSON.stringify({
      batchesRun,
      totalProcessed,
      totalAssigned,
      totalNotFound: totalProcessed - totalAssigned,
      dry_run: dryRun,
      results: allResults,
      lastBatch,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
