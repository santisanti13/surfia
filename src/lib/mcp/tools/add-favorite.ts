import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "add_favorite",
  title: "Guardar spot favorito",
  description: "Añade un spot a los favoritos del usuario autenticado.",
  inputSchema: {
    spot_id: z.string().uuid().describe("ID del spot obtenido con search_spots."),
  },
  annotations: { readOnlyHint: false, idempotentHint: true, destructiveHint: false, openWorldHint: false },
  handler: async ({ spot_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "No autenticado" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("favorite_spots")
      .insert({ user_id: ctx.getUserId(), spot_id })
      .select()
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { favorite: data },
    };
  },
});
