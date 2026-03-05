import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Waves, Wind, Thermometer, Sun, Droplets, MapPin, Navigation, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

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
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

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
      } catch {
        // Fall through to mock
      }
      // Use mock data as fallback
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
      className="absolute top-0 right-0 h-full w-96 bg-background/95 backdrop-blur-xl border-l border-border/50 z-[1000] overflow-y-auto"
    >
      {/* Header image */}
      <div className="relative h-48">
        <img
          src={spot.image_url || "https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=800"}
          alt={spot.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="absolute bottom-4 left-4">
          <h3 className="text-2xl font-display">{spot.name}</h3>
          <p className="text-sm text-muted-foreground font-body flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {spot.location}
            {userPos && (
              <span className="text-primary ml-2">
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
            <div className="text-center mb-6">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-body">Puntuación Surf</p>
              <p className={`text-6xl font-display mt-1 ${getScoreColor(weather.score || 5)}`}>
                {weather.score || 5}/10
              </p>
              <span className={`text-xs font-body font-bold uppercase tracking-widest ${getScoreColor(weather.score || 5)}`}>
                {getScoreLabel(weather.score || 5)}
              </span>
            </div>

            {usingMock && (
              <div className="flex items-center gap-2 text-xs text-accent bg-accent/10 rounded-lg p-2 mb-4">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                <span className="font-body">Datos simulados. Conecta la API de AEMET para datos reales.</span>
              </div>
            )}

            {/* Conditions grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {weather.oleaje && (
                <div className="bg-card/60 rounded-xl p-4 border border-border/30">
                  <Waves className="h-5 w-5 text-primary mb-2" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-body">Oleaje</p>
                  <p className="text-lg font-display mt-1">{weather.oleaje.altura}</p>
                  <p className="text-xs text-muted-foreground font-body">
                    {weather.oleaje.periodo} · {weather.oleaje.direccion}
                  </p>
                </div>
              )}
              {weather.viento && (
                <div className="bg-card/60 rounded-xl p-4 border border-border/30">
                  <Wind className="h-5 w-5 text-primary mb-2" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-body">Viento</p>
                  <p className="text-lg font-display mt-1">{weather.viento.velocidad}</p>
                  <p className="text-xs text-muted-foreground font-body">{weather.viento.direccion}</p>
                </div>
              )}
              {weather.temperatura && (
                <div className="bg-card/60 rounded-xl p-4 border border-border/30">
                  <Thermometer className="h-5 w-5 text-primary mb-2" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-body">Agua</p>
                  <p className="text-lg font-display mt-1">{weather.temperatura.agua}</p>
                  <p className="text-xs text-muted-foreground font-body">
                    {weather.temperatura.min} - {weather.temperatura.max}
                  </p>
                </div>
              )}
              {weather.uv && (
                <div className="bg-card/60 rounded-xl p-4 border border-border/30">
                  <Sun className="h-5 w-5 text-accent mb-2" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-body">UV</p>
                  <p className="text-lg font-display mt-1">{weather.uv}</p>
                  <p className="text-xs text-muted-foreground font-body">{weather.estado_cielo}</p>
                </div>
              )}
            </div>

            {/* Spot info */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-xs text-muted-foreground font-body uppercase tracking-wider">Tipo de ola</span>
                <span className="text-sm font-body font-medium">{spot.wave_type?.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-xs text-muted-foreground font-body uppercase tracking-wider">Dificultad</span>
                <span className="text-sm font-body font-medium">{spot.difficulty}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-xs text-muted-foreground font-body uppercase tracking-wider">Coordenadas</span>
                <span className="text-sm font-body font-medium">
                  {spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}
                </span>
              </div>
            </div>

            {/* Navigation button */}
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
          </>
        ) : null}
      </div>
    </motion.div>
  );
};

export default SpotDetailPanel;
