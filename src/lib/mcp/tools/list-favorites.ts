import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_favorites",
  title: "Mis spots favoritos",
  description: "Lista los spots de surf marcados como favoritos por el usuario autenticado.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "No autenticado" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("favorite_spots")
      .select("spot_id, created_at, surf_spots(id,name,location,lat,lng,difficulty,wave_type)")
      .eq("user_id", ctx.getUserId());

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { favorites: data ?? [] },
    };
  },
});
