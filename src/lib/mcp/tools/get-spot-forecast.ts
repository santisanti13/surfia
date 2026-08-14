import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, supabaseProjectUrl, supabasePublishableKey } from "../supabase";

export default defineTool({
  name: "get_spot_forecast",
  title: "Previsión de un spot",
  description:
    "Devuelve las condiciones actuales de surf (altura de ola, periodo, viento, temperatura y puntuación) de un spot concreto.",
  inputSchema: {
    spot_id: z.string().uuid().describe("ID del spot obtenido con search_spots."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ spot_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "No autenticado" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data: spot, error } = await supabase
      .from("surf_spots")
      .select("id,name,location,lat,lng,playa_id_aemet")
      .eq("id", spot_id)
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!spot) return { content: [{ type: "text", text: "Spot no encontrado" }], isError: true };

    const response = await fetch(`${supabaseProjectUrl()}/functions/v1/aemet-weather`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabasePublishableKey(),
        Authorization: `Bearer ${supabasePublishableKey()}`,
      },
      body: JSON.stringify({ lat: spot.lat, lng: spot.lng, playa_id: spot.playa_id_aemet }),
    });

    const forecast = await response.json().catch(() => null);
    if (!response.ok || !forecast) {
      return { content: [{ type: "text", text: "No hay datos de previsión disponibles ahora mismo." }], isError: true };
    }

    const payload = { spot: { id: spot.id, name: spot.name, location: spot.location }, forecast };
    return {
      content: [{ type: "text", text: JSON.stringify(payload) }],
      structuredContent: payload,
    };
  },
});
