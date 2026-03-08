import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Waves, Wind, Thermometer, Sun, MapPin, Navigation, Loader2, AlertTriangle, Heart, Bell, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import ForecastCharts from "@/components/spots/ForecastCharts";
import SpotPhotos from "@/components/spots/SpotPhotos";
import SpotReviews from "@/components/spots/SpotReviews";

interface SurfSpot {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  playa_id_aemet: string | null;
  wave_type: string | null;
  difficulty: string | null;
  image_url: string | null;
}

interface WeatherData {
  oleaje?: { altura: string; periodo: string; direccion: string };
  viento?: { velocidad: string; direccion: string };
  temperatura?: { agua: string; max: string; min: string };
  uv?: string;
  estado_cielo?: string;
  score?: number;
}

interface SpotDetailPanelProps {
  spot: SurfSpot;
  userPos: [number, number] | null;
  onClose: () => void;
  getDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
}

function generateMockWeather(): WeatherData {
  const waveHeight = (Math.random() * 3 + 0.5).toFixed(1);
  const period = Math.floor(Math.random() * 8 + 6);
  const windSpeed = Math.floor(Math.random() * 25 + 5);
  const waterTemp = Math.floor(Math.random() * 8 + 14);
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const score = Math.min(10, Math.max(1, Math.round(
    (parseFloat(waveHeight) * 2) + (period > 10 ? 2 : 0) + (windSpeed < 15 ? 3 : 0) + (waterTemp > 18 ? 1 : 0)
  )));
  return {
    oleaje: { altura: `${waveHeight}m`, periodo: `${period}s`, direccion: dirs[Math.floor(Math.random() * dirs.length)] },
    viento: { velocidad: `${windSpeed} km/h`, direccion: dirs[Math.floor(Math.random() * dirs.length)] },
    temperatura: { agua: `${waterTemp}°C`, max: `${waterTemp + 5}°C`, min: `${waterTemp - 2}°C` },
    uv: `${Math.floor(Math.random() * 8 + 2)}`,
    estado_cielo: ["Soleado", "Parcialmente nublado", "Nublado", "Despejado"][Math.floor(Math.random() * 4)],
    score,
  };
}

function getScoreColor(score: number): string {
  if (score >= 8) return "text-primary";
  if (score >= 5) return "text-accent";
  return "text-destructive";
}

function getScoreLabel(score: number): string {
  if (score >= 8) return "ÉPICO";
  if (score >= 6) return "BUENO";
  if (score >= 4) return "REGULAR";
  return "POBRE";
}

const SpotDetailPanel = ({ spot, userPos, onClose, getDistance }: SpotDetailPanelProps) => {
  const { user } = useAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "photos" | "reviews">("info");

  useEffect(() => {
    if (!user) return;
    supabase.from("favorite_spots").select("id").eq("user_id", user.id).eq("spot_id", spot.id).maybeSingle()
      .then(({ data }) => setIsFavorite(!!data));
  }, [user, spot.id]);

  const toggleFavorite = async () => {
    if (!user) { toast.error("Inicia sesión para guardar favoritos"); return; }
    if (isFavorite) {
      await supabase.from("favorite_spots").delete().eq("user_id", user.id).eq("spot_id", spot.id);
      setIsFavorite(false);
      toast.success("Eliminado de favoritos");
    } else {
      await supabase.from("favorite_spots").insert({ user_id: user.id, spot_id: spot.id });
      setIsFavorite(true);
      toast.success("¡Añadido a favoritos!");
    }
  };

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        if (spot.playa_id_aemet) {
          const { data, error } = await supabase.functions.invoke("aemet-weather", {
            body: { playa_id: spot.playa_id_aemet },
          });
          if (!error && data && !data.error) {
            setWeather(data);
            setUsingMock(false);
            setLoading(false);
            return;
          }
        }
      } catch { /* fallback */ }
      setWeather(generateMockWeather());
      setUsingMock(true);
      setLoading(false);
    };
    fetchWeather();
  }, [spot]);

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute top-0 right-0 h-full w-full sm:w-[420px] bg-background/95 backdrop-blur-xl border-l border-border/50 z-[1001] overflow-y-auto"
    >
      {/* Header image */}
      <div className="relative h-52">
        <img
          src={spot.image_url || "https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=800"}
          alt={spot.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={toggleFavorite}
            className="w-9 h-9 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors shadow-sm"
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-destructive text-destructive" : ""}`} />
          </button>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors shadow-sm"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-2xl font-display tracking-wide">{spot.name}</h3>
          <p className="text-sm text-muted-foreground font-body flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {spot.location}
            {userPos && (
              <span className="text-primary font-semibold ml-2">
                · {getDistance(userPos[0], userPos[1], spot.lat, spot.lng).toFixed(0)} km
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        ) : weather ? (
          <>
            {/* Score */}
            <div className="text-center mb-5 bg-card/50 rounded-2xl border border-border/20 py-5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-body">Puntuación Surf</p>
              <p className={`text-5xl font-display mt-1 ${getScoreColor(weather.score || 5)}`}>
                {weather.score || 5}<span className="text-2xl text-muted-foreground">/10</span>
              </p>
              <span className={`text-xs font-body font-bold uppercase tracking-widest ${getScoreColor(weather.score || 5)}`}>
                {getScoreLabel(weather.score || 5)}
              </span>
            </div>

            {usingMock && (
              <div className="flex items-center gap-2 text-xs text-accent bg-accent/10 rounded-lg p-2 mb-4 border border-accent/20">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                <span className="font-body">Datos simulados. Conecta AEMET para datos reales.</span>
              </div>
            )}

            {/* Conditions grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              {weather.oleaje && (
                <div className="bg-card/60 rounded-xl p-3.5 border border-border/20">
                  <Waves className="h-4 w-4 text-primary mb-1.5" />
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-body">Oleaje</p>
                  <p className="text-lg font-display mt-0.5">{weather.oleaje.altura}</p>
                  <p className="text-[10px] text-muted-foreground font-body">
                    {weather.oleaje.periodo} · {weather.oleaje.direccion}
                  </p>
                </div>
              )}
              {weather.viento && (
                <div className="bg-card/60 rounded-xl p-3.5 border border-border/20">
                  <Wind className="h-4 w-4 text-primary mb-1.5" />
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-body">Viento</p>
                  <p className="text-lg font-display mt-0.5">{weather.viento.velocidad}</p>
                  <p className="text-[10px] text-muted-foreground font-body">{weather.viento.direccion}</p>
                </div>
              )}
              {weather.temperatura && (
                <div className="bg-card/60 rounded-xl p-3.5 border border-border/20">
                  <Thermometer className="h-4 w-4 text-primary mb-1.5" />
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-body">Agua</p>
                  <p className="text-lg font-display mt-0.5">{weather.temperatura.agua}</p>
                  <p className="text-[10px] text-muted-foreground font-body">
                    {weather.temperatura.min} - {weather.temperatura.max}
                  </p>
                </div>
              )}
              {weather.uv && (
                <div className="bg-card/60 rounded-xl p-3.5 border border-border/20">
                  <Sun className="h-4 w-4 text-accent mb-1.5" />
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-body">UV</p>
                  <p className="text-lg font-display mt-0.5">{weather.uv}</p>
                  <p className="text-[10px] text-muted-foreground font-body">{weather.estado_cielo}</p>
                </div>
              )}
            </div>

            {/* Forecast toggle */}
            <button
              onClick={() => setShowForecast(!showForecast)}
              className="w-full flex items-center justify-between bg-card/60 rounded-xl border border-border/20 px-4 py-3 mb-5 hover:bg-card transition-colors"
            >
              <span className="text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground">
                Previsión 24h
              </span>
              {showForecast ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>

            {showForecast && (
              <div className="mb-5">
                <ForecastCharts spotName={spot.name} playaIdAemet={spot.playa_id_aemet} />
              </div>
            )}

            {/* Tabs: Info / Fotos / Reseñas */}
            <div className="flex gap-1 bg-card/40 rounded-xl border border-border/20 p-1 mb-4">
              {(["info", "photos", "reviews"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 text-xs font-body font-medium py-2 rounded-lg transition-all ${
                    activeTab === tab
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "info" ? "Info" : tab === "photos" ? "Fotos" : "Reseñas"}
                </button>
              ))}
            </div>

            {activeTab === "info" && (
              <div className="space-y-2 mb-5">
                <div className="flex justify-between items-center py-2.5 border-b border-border/20">
                  <span className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">Tipo de ola</span>
                  <span className="text-sm font-body font-medium">{spot.wave_type?.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-border/20">
                  <span className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">Dificultad</span>
                  <span className="text-sm font-body font-medium">{spot.difficulty}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-border/20">
                  <span className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">Coordenadas</span>
                  <span className="text-sm font-body font-medium">
                    {spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            )}

            {activeTab === "photos" && (
              <div className="mb-5">
                <SpotPhotos spotId={spot.id} />
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="mb-5">
                <SpotReviews spotId={spot.id} />
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-2">
              {userPos && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="hero" className="w-full rounded-xl">
                    <Navigation className="h-4 w-4 mr-2" />
                    Cómo llegar
                  </Button>
                </a>
              )}
              <Link to="/alerts">
                <Button variant="outline" className="w-full rounded-xl mt-2">
                  <Bell className="h-4 w-4 mr-2" />
                  Crear alerta para este spot
                </Button>
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </motion.div>
  );
};

export default SpotDetailPanel;
