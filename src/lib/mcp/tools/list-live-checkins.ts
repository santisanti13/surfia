import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_live_checkins",
  title: "Quién está en el agua",
  description: "Muestra los check-ins activos (últimas 2 horas) de un spot o de todos los spots.",
  inputSchema: {
    spot_id: z.string().uuid().optional().describe("Limita el resultado a un spot concreto."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ spot_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "No autenticado" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let request = supabase
      .from("spot_checkins")
      .select("id,spot_id,note,created_at,expires_at,surf_spots(name,location)")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(50);
    if (spot_id) request = request.eq("spot_id", spot_id);

    const { data, error } = await request;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { checkins: data ?? [] },
    };
  },
});
