import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Waves, Wind, Thermometer, Navigation, AlertTriangle, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import SpotDetailPanel from "@/components/SpotDetailPanel";

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const surfIcon = new L.DivIcon({
  className: "custom-surf-marker",
  html: `<div style="background: hsl(185, 72%, 48%); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid hsl(200, 20%, 6%); box-shadow: 0 0 20px hsl(185, 72%, 48%, 0.5);">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(200, 20%, 6%)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
      <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
      <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
    </svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const userIcon = new L.DivIcon({
  className: "custom-user-marker",
  html: `<div style="background: hsl(35, 90%, 55%); width: 20px; height: 20px; border-radius: 50%; border: 3px solid hsl(200, 20%, 6%); box-shadow: 0 0 15px hsl(35, 90%, 55%, 0.6);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

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

function FlyToUser({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 10, { duration: 2 });
    }
  }, [position, map]);
  return null;
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const Spots = () => {
  const [spots, setSpots] = useState<SurfSpot[]>([]);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<SurfSpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpots = async () => {
      const { data } = await supabase.from("surf_spots").select("*");
      if (data) setSpots(data);
      setLoading(false);
    };
    fetchSpots();
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
        (err) => setGeoError("Activa la geolocalización para ver spots cercanos"),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const sortedSpots = userPos
    ? [...spots].sort((a, b) => getDistance(userPos[0], userPos[1], a.lat, a.lng) - getDistance(userPos[0], userPos[1], b.lat, b.lng))
    : spots;

  const defaultCenter: [number, number] = userPos || [40.4168, -3.7038]; // Madrid default

  return (
    <div className="h-screen w-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 relative mt-16">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : (
          <>
            <MapContainer
              center={defaultCenter}
              zoom={userPos ? 10 : 6}
              className="h-full w-full z-0"
              style={{ background: "hsl(200, 20%, 6%)" }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              <FlyToUser position={userPos} />

              {userPos && (
                <Marker position={userPos} icon={userIcon}>
                  <Popup className="dark-popup">
                    <span className="font-body text-sm">📍 Tu ubicación</span>
                  </Popup>
                </Marker>
              )}

              {spots.map((spot) => (
                <Marker
                  key={spot.id}
                  position={[spot.lat, spot.lng]}
                  icon={surfIcon}
                  eventHandlers={{ click: () => setSelectedSpot(spot) }}
                >
                  <Popup className="dark-popup">
                    <div className="font-body">
                      <p className="font-semibold text-sm">{spot.name}</p>
                      <p className="text-xs opacity-70">{spot.location}</p>
                      {userPos && (
                        <p className="text-xs mt-1 text-primary">
                          {getDistance(userPos[0], userPos[1], spot.lat, spot.lng).toFixed(0)} km
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Spots sidebar */}
            <div className="absolute top-0 left-0 h-full w-80 bg-background/90 backdrop-blur-xl border-r border-border/50 overflow-y-auto z-[1000] hidden md:block">
              <div className="p-4">
                <h2 className="font-display text-2xl mb-1">Spots de Surf</h2>
                <p className="text-xs text-muted-foreground font-body mb-4">
                  {spots.length} spots · {userPos ? "Ordenados por distancia" : "España"}
                </p>
                {geoError && (
                  <div className="flex items-center gap-2 text-xs text-accent bg-accent/10 rounded-lg p-2 mb-3">
                    <Navigation className="h-3 w-3" />
                    {geoError}
                  </div>
                )}
                <div className="space-y-2">
                  {sortedSpots.map((spot) => (
                    <button
                      key={spot.id}
                      onClick={() => setSelectedSpot(spot)}
                      className={`w-full text-left p-3 rounded-xl transition-all duration-300 ${
                        selectedSpot?.id === spot.id
                          ? "bg-primary/20 border border-primary/50"
                          : "bg-card/40 border border-transparent hover:bg-card/80"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-body font-semibold text-sm">{spot.name}</p>
                          <p className="text-xs text-muted-foreground font-body flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" /> {spot.location}
                          </p>
                        </div>
                        {userPos && (
                          <span className="text-xs text-primary font-body font-medium">
                            {getDistance(userPos[0], userPos[1], spot.lat, spot.lng).toFixed(0)} km
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded font-body">
                          {spot.wave_type?.replace("_", " ")}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded font-body">
                          {spot.difficulty}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Detail panel */}
            <AnimatePresence>
              {selectedSpot && (
                <SpotDetailPanel
                  spot={selectedSpot}
                  userPos={userPos}
                  onClose={() => setSelectedSpot(null)}
                  getDistance={getDistance}
                />
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
};

export default Spots;
