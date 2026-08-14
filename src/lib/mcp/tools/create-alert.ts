import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_alert",
  title: "Crear alerta de olas",
  description:
    "Crea una alerta para avisar al usuario cuando un spot supere una altura mínima de ola y no exceda un viento máximo.",
  inputSchema: {
    spot_id: z.string().uuid().describe("ID del spot obtenido con search_spots."),
    min_wave_height: z.number().min(0).max(15).describe("Altura mínima de ola en metros."),
    max_wind_speed: z.number().min(0).max(120).optional().describe("Velocidad máxima de viento en km/h."),
    preferred_wind_direction: z.string().trim().optional().describe("Dirección de viento preferida (p. ej. S, SW, offshore)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ spot_id, min_wave_height, max_wind_speed, preferred_wind_direction }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "No autenticado" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("user_alerts")
      .insert({
        user_id: ctx.getUserId(),
        spot_id,
        min_wave_height,
        max_wind_speed: max_wind_speed ?? null,
        preferred_wind_direction: preferred_wind_direction ?? null,
        is_active: true,
      })
      .select()
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { alert: data },
    };
  },
});
