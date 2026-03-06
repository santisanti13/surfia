import { useState, useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Navigation, Loader2, Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import SpotDetailPanel from "@/components/SpotDetailPanel";
import SuggestSpotForm from "@/components/SuggestSpotForm";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

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

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const Spots = () => {
  const { user } = useAuth();
  const [spots, setSpots] = useState<SurfSpot[]>([]);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<SurfSpot | null>(null);
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [geoError, setGeoError] = useState<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Fetch spots
  const fetchSpots = useCallback(async () => {
    const { data } = await supabase.from("surf_spots").select("*");
    if (data) setSpots(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSpots();
  }, [fetchSpots]);

  // Geolocation
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
        () => setGeoError("Activa la geolocalización para ver spots cercanos"),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (loading || !mapContainerRef.current || mapRef.current) return;

    const center: [number, number] = userPos || [40.4168, -3.7038];
    const zoom = userPos ? 10 : 6;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [loading]);

  // Fly to user when position available
  useEffect(() => {
    if (mapRef.current && userPos) {
      mapRef.current.flyTo(userPos, 10, { duration: 2 });

      // Add user marker
      const userIcon = L.divIcon({
        className: "custom-user-marker",
        html: `<div style="background: hsl(35, 90%, 55%); width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.2);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      L.marker(userPos, { icon: userIcon })
        .addTo(mapRef.current)
        .bindPopup("<span style='font-family: Inter, sans-serif; font-size: 13px;'>📍 Tu ubicación</span>");
    }
  }, [userPos]);

  // Add spot markers
  useEffect(() => {
    if (!mapRef.current || spots.length === 0) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const surfIcon = L.divIcon({
      className: "custom-surf-marker",
      html: `<div style="background: hsl(185, 72%, 42%); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.2); cursor: pointer;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
          <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
          <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
        </svg>
      </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    spots.forEach((spot) => {
      const marker = L.marker([spot.lat, spot.lng], { icon: surfIcon })
        .addTo(mapRef.current!)
        .on("click", () => setSelectedSpot(spot));

      const distText = userPos
        ? `<br/><span style="color: hsl(185, 72%, 42%); font-size: 11px;">${getDistance(userPos[0], userPos[1], spot.lat, spot.lng).toFixed(0)} km</span>`
        : "";

      marker.bindPopup(
        `<div style="font-family: Inter, sans-serif;">
          <b style="font-size: 13px;">${spot.name}</b><br/>
          <span style="font-size: 11px; opacity: 0.7;">${spot.location}</span>
          ${distText}
        </div>`
      );

      markersRef.current.push(marker);
    });
  }, [spots, userPos]);

  const handleSpotClick = useCallback((spot: SurfSpot) => {
    setSelectedSpot(spot);
    if (mapRef.current) {
      mapRef.current.flyTo([spot.lat, spot.lng], 12, { duration: 1 });
    }
  }, []);

  const sortedSpots = userPos
    ? [...spots].sort((a, b) => getDistance(userPos[0], userPos[1], a.lat, a.lng) - getDistance(userPos[0], userPos[1], b.lat, b.lng))
    : spots;

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
            <div ref={mapContainerRef} className="h-full w-full z-0" style={{ background: "#f0f4f8" }} />

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
                      onClick={() => handleSpotClick(spot)}
                      className={`w-full text-left p-3 rounded-xl transition-all duration-300 ${
                        selectedSpot?.id === spot.id
                          ? "bg-primary/10 border border-primary/30"
                          : "bg-card border border-transparent hover:bg-muted"
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
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-0.5 rounded font-body">
                          {spot.wave_type?.replace(/_/g, " ")}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-0.5 rounded font-body">
                          {spot.difficulty}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggest spot button */}
            {user && (
              <Button
                onClick={() => setShowSuggestForm(true)}
                className="absolute bottom-4 right-4 z-[1000] rounded-full shadow-lg"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Sugerir Spot
              </Button>
            )}

            {/* Suggest spot form */}
            <AnimatePresence>
              {showSuggestForm && (
                <SuggestSpotForm
                  onClose={() => setShowSuggestForm(false)}
                  onSubmitted={fetchSpots}
                />
              )}
            </AnimatePresence>

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
