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

/**
 * STRICT match: the spot's primary name (first word of the name, before parenthesis/dash)
 * MUST appear as a contiguous token sequence in the AEMET beach name.
 * Municipality is used only as tie-breaker, never to lower the bar.
 */
function primaryName(spotName: string): string {
  // "Playa de Andrín" → "andrin"; "Area Maior (Muros)" → "area maior"
  const cleaned = spotName.replace(/\(.*?\)/g, " ").replace(/[-–—]/g, " ");
  const n = normalize(cleaned)
    .replace(/^(playa|cala|punta|spot|la|el|las|los|de|del|do|da|dos|das)\s+/g, "")
    .trim();
  return n || normalize(spotName);
}

function strictMatch(
  candidates: Array<{ name: string; id: string }>,
  spotName: string,
  municipality: string,
): { name: string; id: string } | null {
  if (candidates.length === 0) return null;
  const primary = primaryName(spotName);
  if (!primary || primary.length < 3) return null;

  const muniTokens = new Set(normalize(municipality).split(" ").filter(Boolean));

  // Keep only candidates whose normalized name CONTAINS the full primary string as a substring (word-bounded)
  const re = new RegExp(`(^|\\s)${primary.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s|$)`);
  const strict = candidates.filter((c) => re.test(normalize(c.name)));
  if (strict.length === 0) return null;
  if (strict.length === 1) return strict[0];

  // Tie-break by municipality token overlap
  let best = strict[0];
  let bestScore = -1;
  for (const c of strict) {
    const tokens = normalize(c.name).split(" ");
    let score = 0;
    for (const t of tokens) if (muniTokens.has(t)) score += 1;
    if (score > bestScore) { bestScore = score; best = c; }
  }
  return best;
}

/**
 * Manual mapping for famous spots whose "surf name" doesn't match the AEMET
 * official beach name. Key is the normalized spot name (optionally + "|" + a
 * location keyword to disambiguate duplicates). Values:
 *   - query: term to search in the AEMET catalogue
 *   - expect: substring that MUST appear in the AEMET beach name (normalized)
 *
 * This lookup runs BEFORE the strict matcher. If a manual map hits and the
 * AEMET search returns a beach containing `expect`, that beach is assigned
 * directly. Otherwise we fall back to the normal strict pipeline.
 */
const MANUAL_MAP: Record<string, { query: string; expect: string }> = {
  "andrin":                     { query: "Niembro",         expect: "niembro" },
  "bakio":                      { query: "San Pelayo",      expect: "san pelayo" },
  "barinatxe la salvaje":       { query: "La Salvaje",      expect: "salvaje" },
  "la salvaje sopelana":        { query: "La Salvaje",      expect: "salvaje" },
  "sopelana la salvaje":        { query: "La Salvaje",      expect: "salvaje" },
  "sopelana la salvaje|sopelana": { query: "La Salvaje",    expect: "salvaje" },
  "roca puta":                  { query: "Arrigunaga",      expect: "arrigunaga" },
  "roka puta punta galea":      { query: "Arrigunaga",      expect: "arrigunaga" },
  "meñakoz":                    { query: "Meñakoz",         expect: "menakoz" },
  "menakoz":                    { query: "Meñakoz",         expect: "menakoz" },
  "ereaga":                     { query: "Ereaga",          expect: "ereaga" },
  "mundaka":                    { query: "Laida",           expect: "laida" },
  "orrua":                      { query: "Orrua",           expect: "orrua" },
  "hendaya frontera":           { query: "Hondarribia",     expect: "hondarribia" },
  "a frouxeira":                { query: "Frouxeira",       expect: "frouxeira" },
  "area maior louro":           { query: "Area Maior",      expect: "area maior" },
  "lariño":                     { query: "Lariño",          expect: "larino" },
  "larino":                     { query: "Lariño",          expect: "larino" },
  "o rostro":                   { query: "O Rostro",        expect: "rostro" },
  "nemiña":                     { query: "Nemiña",          expect: "nemina" },
  "nemina":                     { query: "Nemiña",          expect: "nemina" },
  "coido de cuño":              { query: "Cuño",            expect: "cuno" },
  "soesto":                     { query: "Soesto",          expect: "soesto" },
  "traba":                      { query: "Traba",           expect: "traba" },
  "pantín":                     { query: "Pantín",          expect: "pantin" },
  "pantin":                     { query: "Pantín",          expect: "pantin" },
  "foz":                        { query: "A Rapadoira",     expect: "rapadoira" },
  "frejulfe":                   { query: "Frejulfe",        expect: "frejulfe" },
  "tapia de casariego":         { query: "Tapia",           expect: "tapia" },
  "salinas":                    { query: "Salinas",         expect: "salinas" },
  "bayas":                      { query: "Bayas",           expect: "bayas" },
  "verdicio":                   { query: "Verdicio",        expect: "verdicio" },
  "xagó":                       { query: "Xagó",            expect: "xago" },
  "xago":                       { query: "Xagó",            expect: "xago" },
  "cuevas del mar":             { query: "Cuevas",          expect: "cuevas" },
  "españa":                     { query: "Rodiles",         expect: "rodiles" },
  "espana":                     { query: "Rodiles",         expect: "rodiles" },
  "la espasa":                  { query: "La Espasa",       expect: "espasa" },
  "berria":                     { query: "Berria",          expect: "berria" },
  "noja":                       { query: "Trengandín",     expect: "trengandin" },
  "el brusco":                  { query: "El Brusco",       expect: "brusco" },
  "langre":                     { query: "Langre",          expect: "langre" },
  "pukas surf eskola somo":     { query: "Somo",            expect: "somo" },
  "los locos":                  { query: "Los Locos",       expect: "locos" },
  "tagle":                      { query: "Tagle",           expect: "tagle" },
  "tagle el madero":            { query: "Tagle",           expect: "tagle" },
  "liencres":                   { query: "Valdearenas",     expect: "valdearenas" },
  "canallave":                  { query: "Canallave",       expect: "canallave" },
  // Canarias
  "famara":                     { query: "Famara",          expect: "famara" },
  "la caleta de famara":        { query: "Famara",          expect: "famara" },
  "el cotillo":                 { query: "El Cotillo",      expect: "cotillo" },
  "majanicho":                  { query: "Majanicho",       expect: "majanicho" },
  "esquinzo":                   { query: "Esquinzo",        expect: "esquinzo" },

  "el confital":                { query: "Confital",        expect: "confital" },
  "la cicer las canteras":      { query: "Las Canteras",    expect: "canteras" },
  "las palmeras":               { query: "Las Canteras",    expect: "canteras" },
  "la guancha":                 { query: "Bañaderos",       expect: "banaderos" },
  "el frontón":                 { query: "El Frontón",      expect: "fronton" },
  "el fronton":                 { query: "El Frontón",      expect: "fronton" },
  "playa del inglés":           { query: "Inglés",          expect: "ingles" },
  "playa del ingles":           { query: "Inglés",          expect: "ingles" },
  "las américas":               { query: "Las Américas",    expect: "americas" },
  "las americas":               { query: "Las Américas",    expect: "americas" },
  "playa de las américas":      { query: "Las Américas",    expect: "americas" },
  "playa de las americas":      { query: "Las Américas",    expect: "americas" },
  "las galletas":               { query: "Las Galletas",    expect: "galletas" },
  "igueste":                    { query: "Igueste",         expect: "igueste" },
  // Andalucía
  "el médano":                  { query: "El Médano",       expect: "medano" },
  "el medano":                  { query: "El Médano",       expect: "medano" },
  "los caños de meca":          { query: "Caños de Meca",   expect: "canos" },
  "los canos de meca":          { query: "Caños de Meca",   expect: "canos" },
  "punta paloma":               { query: "Punta Paloma",    expect: "paloma" },
  "valdevaqueros":              { query: "Valdevaqueros",   expect: "valdevaqueros" },
  "tarifa":                     { query: "Los Lances",      expect: "lances" },
  "yerbabuena":                 { query: "Yerbabuena",      expect: "yerbabuena" },
  "castilnovo":                 { query: "Castilnovo",      expect: "castilnovo" },
  "fuente del gallo":           { query: "Fuente del Gallo",expect: "gallo" },
  "cortadura":                  { query: "Cortadura",       expect: "cortadura" },
  "matalascañas":               { query: "Matalascañas",    expect: "matalascanas" },
  "matalascanas":               { query: "Matalascañas",    expect: "matalascanas" },
  "mazagón":                    { query: "Mazagón",         expect: "mazagon" },
  "mazagon":                    { query: "Mazagón",         expect: "mazagon" },
  "el rompido":                 { query: "El Rompido",      expect: "rompido" },
  "isla cristina":              { query: "Isla Cristina",   expect: "isla cristina" },
  // Mediterráneo
  "el saler":                   { query: "El Saler",        expect: "saler" },
  "la patacona":                { query: "Patacona",        expect: "patacona" },
  "pinedo":                     { query: "Pinedo",          expect: "pinedo" },
  "sitges":                     { query: "Sitges",          expect: "sitges" },
  "gavà":                       { query: "Gavà",            expect: "gava" },
  "gava":                       { query: "Gavà",            expect: "gava" },
  "cabrera de mar":             { query: "Cabrera",         expect: "cabrera" },
};

function manualLookupKeys(spotName: string, location: string): string[] {
  const base = primaryName(spotName);
  const fullNormalized = normalize(spotName.replace(/\(.*?\)/g, " ").replace(/[-–—]/g, " "));
  const loc = normalize((location || "").split(",")[0] || "");
  const keys = [base, fullNormalized];
  if (loc) {
    keys.push(`${base}|${loc}`);
    keys.push(`${fullNormalized}|${loc}`);
  }
  return [...new Set(keys.filter(Boolean))];
}

async function tryManualMap(
  spotName: string,
  location: string,
): Promise<{ name: string; id: string; via: "manual" } | null> {
  const keys = manualLookupKeys(spotName, location);
  let entry: { query: string; expect: string } | undefined;
  for (const k of keys) {
    if (MANUAL_MAP[k]) { entry = MANUAL_MAP[k]; break; }
  }
  if (!entry) return null;
  const candidates = await searchAemetBeach(entry.query);
  const expectNorm = normalize(entry.expect);
  // Require word-bounded token match (no loose substring), to avoid e.g. "santa" matching "santandria"
  const re = new RegExp(`(^|\\s)${expectNorm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s|$)`);
  const hit = candidates.find((c) => re.test(normalize(c.name)));
  return hit ? { ...hit, via: "manual" } : null;
}



async function loadDbMappings(supabase: any) {
  const { data } = await supabase
    .from("aemet_manual_mappings")
    .select("spot_name, aemet_id, aemet_name");
  if (!data) return;
  for (const row of data) {
    const key = normalize(row.spot_name);
    if (!key) continue;
    // DB overrides hardcoded
    MANUAL_MAP[key] = {
      query: row.aemet_name || row.spot_name,
      expect: normalize(row.aemet_name || row.spot_name),
    };
    // Also accept by direct ID via a sentinel
    (MANUAL_MAP as any)[`__direct__${key}`] = { id: row.aemet_id, name: row.aemet_name || row.spot_name };
  }
}

function directDbMatch(spotName: string): { id: string; name: string } | null {
  const key = normalize(spotName);
  const v = (MANUAL_MAP as any)[`__direct__${key}`];
  return v ?? null;
}

async function logAssignment(
  supabase: any,
  spot: { id: string; name: string },
  previous: string | null,
  next: string | null,
  method: string,
) {
  await supabase.from("aemet_assignment_log").insert({
    spot_id: spot.id,
    spot_name: spot.name,
    previous_aemet_id: previous,
    new_aemet_id: next,
    method,
  });
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
    const mode = body.mode === "reassign_suspicious" ? "reassign_suspicious" : "assign";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    await loadDbMappings(supabase);

    // ===== Mode: reassign_suspicious =====
    // Re-evaluate already-assigned spots with the strict matcher; null out the ones that don't pass.
    if (mode === "reassign_suspicious") {
      const { data: spots, error } = await supabase
        .from("surf_spots")
        .select("id, name, location, playa_id_aemet")
        .not("playa_id_aemet", "is", null)
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

        // Manual map takes precedence — if the spot is in our curated list,
        // trust that mapping over whatever the strict search returns.
        const manual = await tryManualMap(spot.name, spot.location || "");
        const candidates = await searchAemetBeach(spot.name);
        const strict = strictMatch(candidates, spot.name, municipality);
        const pick = manual ?? strict;

        // Suspicious if no pick found, OR the chosen pick doesn't agree with the current assignment
        const suspicious = !pick || pick.id !== spot.playa_id_aemet;

        if (suspicious) {
          if (!dryRun) {
            const { error: upErr } = await supabase
              .from("surf_spots")
              .update({ playa_id_aemet: null })
              .eq("id", spot.id);
            if (upErr) {
              results.push({ spot: spot.name, status: "update_error", error: upErr.message });
              continue;
            }
          }
          results.push({
            spot: spot.name,
            location: spot.location,
            status: dryRun ? "would_null" : "nulled",
            previous_id: spot.playa_id_aemet,
            strict_pick: pick?.name ?? null,
          });
        } else {
          results.push({
            spot: spot.name,
            status: "kept",
            aemet_id: pick.id,
            aemet_name: pick.name,
          });
        }
      }

      const nulled = results.filter((r) => r.status === "nulled" || r.status === "would_null").length;
      return new Response(
        JSON.stringify({ mode, processed: results.length, nulled, kept: results.length - nulled, dry_run: dryRun, results }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ===== Mode: assign (default) =====
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

      // 0) Manual mapping for famous spots — runs first, bypasses strict matcher
      let pick: { name: string; id: string } | null = await tryManualMap(spot.name, spot.location || "");
      let via: "manual" | "strict_name" | "strict_municipio" | null = pick ? "manual" : null;

      // 1) Search by spot name — STRICT
      if (!pick) {
        const candidates = await searchAemetBeach(spot.name);
        pick = strictMatch(candidates, spot.name, municipality);
        if (pick) via = "strict_name";
      }

      // 2) Fallback: search by municipality, still STRICT on spot name
      if (!pick && municipality) {
        await new Promise((r) => setTimeout(r, 600));
        const candidates = await searchAemetBeach(municipality);
        pick = strictMatch(candidates, spot.name, municipality);
        if (pick) via = "strict_municipio";
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
          via,
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
        mode,
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

