import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "checkin_spot",
  title: "Hacer check-in en un spot",
  description:
    "Marca al usuario autenticado como 'en el agua' en un spot durante 2 horas para que otros surfistas lo vean.",
  inputSchema: {
    spot_id: z.string().uuid().describe("ID del spot obtenido con search_spots."),
    note: z.string().trim().max(200).optional().describe("Nota corta opcional sobre las condiciones."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ spot_id, note }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "No autenticado" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from("spot_checkins")
      .insert({ user_id: ctx.getUserId(), spot_id, note: note ?? null, expires_at: expires })
      .select()
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { checkin: data },
    };
  },
});
