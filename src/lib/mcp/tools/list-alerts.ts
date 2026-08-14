import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_alerts",
  title: "Mis alertas de olas",
  description: "Lista las alertas de oleaje configuradas por el usuario autenticado.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "No autenticado" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("user_alerts")
      .select("id,spot_id,min_wave_height,max_wind_speed,preferred_wind_direction,is_active,surf_spots(name,location)")
      .eq("user_id", ctx.getUserId());

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { alerts: data ?? [] },
    };
  },
});
