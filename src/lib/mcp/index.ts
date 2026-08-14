import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchSpots from "./tools/search-spots";
import getSpotForecast from "./tools/get-spot-forecast";
import listFavorites from "./tools/list-favorites";
import addFavorite from "./tools/add-favorite";
import listAlerts from "./tools/list-alerts";
import createAlert from "./tools/create-alert";
import checkinSpot from "./tools/checkin-spot";
import listLiveCheckins from "./tools/list-live-checkins";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "surfia",
  title: "SurfIA",
  version: "0.1.0",
  instructions:
    "Herramientas de SurfIA, la app de previsión de surf en España. Usa search_spots para localizar playas, get_spot_forecast para las condiciones actuales, y las herramientas de favoritos, alertas y check-ins para gestionar la cuenta del usuario autenticado.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    searchSpots,
    getSpotForecast,
    listFavorites,
    addFavorite,
    listAlerts,
    createAlert,
    checkinSpot,
    listLiveCheckins,
  ],
});
