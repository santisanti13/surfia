import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_spots",
  title: "Buscar spots de surf",
  description:
    "Busca spots de surf aprobados en España por nombre, localidad, dificultad o tipo de ola. Devuelve coordenadas útiles para pedir la previsión.",
  inputSchema: {
    query: z.string().trim().optional().describe("Texto a buscar en el nombre o la localidad del spot."),
    difficulty: z.string().trim().optional().describe("Filtra por dificultad (p. ej. principiante, intermedio, avanzado)."),
    limit: z.number().int().min(1).max(50).default(20).describe("Número máximo de spots a devolver."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, difficulty, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "No autenticado" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let request = supabase
      .from("surf_spots")
      .select("id,name,location,lat,lng,wave_type,difficulty")
      .eq("approved", true)
      .limit(limit ?? 20);

    if (query) request = request.or(`name.ilike.%${query}%,location.ilike.%${query}%`);
    if (difficulty) request = request.ilike("difficulty", `%${difficulty}%`);

    const { data, error } = await request;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { spots: data ?? [] },
    };
  },
});
