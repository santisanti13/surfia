import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Flame, Navigation, LocateFixed } from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import SpotDetailPanel from "@/components/SpotDetailPanel";
import SuggestSpotForm from "@/components/SuggestSpotForm";
import SpotListSidebar from "@/components/spots/SpotListSidebar";
import SpotBottomSheet from "@/components/spots/SpotBottomSheet";
import MapLayerControl, { type LayerType } from "@/components/spots/MapLayerControl";
import HeatMapOverlay from "@/components/spots/HeatMapOverlay";

import { type SpotFilters, emptyFilters } from "@/components/spots/SpotFiltersBar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Seo from "@/components/Seo";

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

const TILE_LAYERS: Record<LayerType, { url: string; attribution: string }> = {
  streets: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
  },
  terrain: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
  },
};

function applyFilters(spots: SurfSpot[], filters: SpotFilters, userPos: [number, number] | null, search: string): SurfSpot[] {
  const q = search.toLowerCase().trim();
  return spots.filter((spot) => {
    if (q && !spot.name.toLowerCase().includes(q) && !spot.location.toLowerCase().includes(q)) return false;
    if (filters.difficulty.length > 0 && !filters.difficulty.includes(spot.difficulty || "")) return false;
    if (filters.waveType.length > 0 && !filters.waveType.includes(spot.wave_type || "")) return false;
    if (filters.maxDistance !== null && userPos) {
      const dist = getDistance(userPos[0], userPos[1], spot.lat, spot.lng);
      if (dist > filters.maxDistance) return false;
    }
    return true;
  });
}

const Spots = () => {
  const { user } = useAuth();
  const [spots, setSpots] = useState<SurfSpot[]>([]);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<SurfSpot | null>(null);
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<LayerType>("streets");
  const [showHeatMap, setShowHeatMap] = useState(false);
  
  const [filters, setFilters] = useState<SpotFilters>(emptyFilters);
  const [searchQuery, setSearchQuery] = useState("");
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  const filteredSpots = useMemo(() => applyFilters(spots, filters, userPos, searchQuery), [spots, filters, userPos, searchQuery]);

  const fetchSpots = useCallback(async () => {
    const { data } = await supabase.from("surf_spots").select("*");
    if (data) setSpots(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSpots(); }, [fetchSpots]);

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

    const map = L.map(mapContainerRef.current, { center, zoom, zoomControl: false });

    const layer = TILE_LAYERS[activeLayer];
    tileLayerRef.current = L.tileLayer(layer.url, { attribution: layer.attribution }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapRef.current = map;

    return () => { map.remove(); mapRef.current = null; };
  }, [loading]);

  // Switch tile layer
  useEffect(() => {
    if (!mapRef.current) return;
    if (tileLayerRef.current) tileLayerRef.current.remove();
    const layer = TILE_LAYERS[activeLayer];
    tileLayerRef.current = L.tileLayer(layer.url, { attribution: layer.attribution }).addTo(mapRef.current);
  }, [activeLayer]);

  // Fly to user
  useEffect(() => {
    if (!mapRef.current || !userPos) return;
    mapRef.current.flyTo(userPos, 10, { duration: 2 });

    const userIcon = L.divIcon({
      className: "custom-user-marker",
      html: `<div style="background: hsl(35, 90%, 55%); width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); animation: pulse 2s ease-in-out infinite;"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    L.marker(userPos, { icon: userIcon })
      .addTo(mapRef.current)
      .bindPopup("<span style='font-family: Inter, sans-serif; font-size: 13px;'>📍 Tu ubicación</span>");
  }, [userPos]);

  // Add clustered markers — now depends on filteredSpots
  useEffect(() => {
    if (!mapRef.current || filteredSpots.length === 0) return;

    if (clusterGroupRef.current) {
      mapRef.current.removeLayer(clusterGroupRef.current);
    }

    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        const size = count > 20 ? 48 : count > 10 ? 40 : 32;
        return L.divIcon({
          html: `<div style="background: hsl(185, 72%, 42%); width: ${size}px; height: ${size}px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 3px 12px rgba(0,0,0,0.25); color: white; font-family: Inter, sans-serif; font-weight: 700; font-size: ${size > 40 ? 14 : 12}px;">${count}</div>`,
          className: "custom-cluster-icon",
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
      },
    });

    const surfIcon = L.divIcon({
      className: "custom-surf-marker",
      html: `<div style="background: hsl(185, 72%, 42%); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.2); cursor: pointer; transition: transform 0.2s;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
          <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
          <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
        </svg>
      </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    filteredSpots.forEach((spot) => {
      const marker = L.marker([spot.lat, spot.lng], { icon: surfIcon })
        .on("click", () => handleSpotClick(spot));

      const distText = userPos
        ? `<br/><span style="color: hsl(185, 72%, 42%); font-size: 11px; font-weight: 600;">${getDistance(userPos[0], userPos[1], spot.lat, spot.lng).toFixed(0)} km</span>`
        : "";

      const escapeHtml = (s: string) =>
        String(s)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      marker.bindPopup(
        `<div style="font-family: Inter, sans-serif;">
          <b style="font-size: 13px;">${escapeHtml(spot.name)}</b><br/>
          <span style="font-size: 11px; opacity: 0.7;">${escapeHtml(spot.location)}</span>
          ${distText}
        </div>`
      );

      clusterGroup.addLayer(marker);
    });

    mapRef.current.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;

    // If no spots match and we had some before, clear the cluster
    return () => {
      if (mapRef.current && clusterGroupRef.current) {
        mapRef.current.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
      }
    };
  }, [filteredSpots, userPos]);

  const handleSpotClick = useCallback((spot: SurfSpot) => {
    setSelectedSpot(spot);
    if (mapRef.current) {
      mapRef.current.flyTo([spot.lat, spot.lng], 12, { duration: 1 });
    }
  }, []);

  return (
    <div className="h-screen w-screen bg-background flex flex-col">
      <Seo
        title="Mapa de spots de surf en España — SurfIA"
        description="Mapa interactivo con cientos de spots de surf en España. Consulta oleaje, viento y mareas en tiempo real para encontrar las mejores olas cerca de ti."
        path="/spots"
        jsonLd={{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Spots de surf en España", url: "https://surfiaa.com/spots" }}
      />
      <Navbar />
      <div className="flex-1 relative mt-16">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : (
          <>
            <div ref={mapContainerRef} className="h-full w-full z-0" style={{ background: "#f0f4f8" }} />


            {/* Desktop sidebar */}
            <SpotListSidebar
              spots={filteredSpots}
              allSpotsCount={spots.length}
              selectedSpotId={selectedSpot?.id || null}
              userPos={userPos}
              geoError={geoError}
              getDistance={getDistance}
              onSpotClick={handleSpotClick}
              filters={filters}
              onFiltersChange={setFilters}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            {/* Mobile bottom sheet */}
            <SpotBottomSheet
              spots={filteredSpots}
              allSpotsCount={spots.length}
              selectedSpotId={selectedSpot?.id || null}
              userPos={userPos}
              getDistance={getDistance}
              onSpotClick={handleSpotClick}
              filters={filters}
              onFiltersChange={setFilters}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            {/* Heat Map Overlay */}
            <HeatMapOverlay map={mapRef.current} spots={filteredSpots} show={showHeatMap} />

            {/* Layer control */}
            <div className="hidden md:block">
              <MapLayerControl activeLayer={activeLayer} onLayerChange={setActiveLayer} />
            </div>

            {/* Heat Map Toggle Desktop */}
            <div className="hidden md:block absolute top-[136px] right-4 z-[1000]">
              <button
                onClick={() => setShowHeatMap(!showHeatMap)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border shadow-lg font-body text-xs font-bold transition-all duration-300 backdrop-blur-xl w-[100px] justify-center ${
                  showHeatMap 
                    ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white border-transparent" 
                    : "bg-background/90 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground"
                }`}
              >
                <Flame className={`h-4 w-4 ${showHeatMap ? 'animate-pulse' : ''}`} />
                <span>Olas</span>
              </button>
            </div>

            {/* Mobile layer control & heat map toggle */}
            <div className="absolute top-3 right-3 z-[1000] md:hidden flex flex-col gap-2">
              <button
                onClick={() => setActiveLayer(activeLayer === "streets" ? "satellite" : activeLayer === "satellite" ? "terrain" : "streets")}
                className="w-9 h-9 rounded-xl bg-background/90 backdrop-blur-xl border border-border/50 shadow-lg flex items-center justify-center"
              >
                <span className="text-xs font-body font-bold text-muted-foreground">
                  {activeLayer === "streets" ? "🗺️" : activeLayer === "satellite" ? "🛰️" : "⛰️"}
                </span>
              </button>

              <button
                onClick={() => setShowHeatMap(!showHeatMap)}
                className={`w-9 h-9 rounded-xl border shadow-lg flex items-center justify-center transition-all duration-300 backdrop-blur-xl ${
                  showHeatMap 
                    ? "bg-gradient-to-br from-orange-500 to-rose-500 text-white border-transparent" 
                    : "bg-background/90 text-muted-foreground border-border/50"
                }`}
              >
                <Flame className={`h-4 w-4 ${showHeatMap ? 'animate-pulse' : ''}`} />
              </button>
            </div>

            {/* Suggest spot button */}
            {user && (
              <Button
                onClick={() => setShowSuggestForm(true)}
                className="absolute bottom-4 right-4 md:bottom-4 z-[1000] rounded-full shadow-lg"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Sugerir Spot</span>
              </Button>
            )}

            {/* Suggest spot form */}
            <AnimatePresence>
              {showSuggestForm && (
                <SuggestSpotForm onClose={() => setShowSuggestForm(false)} onSubmitted={fetchSpots} />
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

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 hsla(35, 90%, 55%, 0.4); }
          50% { box-shadow: 0 0 0 12px hsla(35, 90%, 55%, 0); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .leaflet-cluster-anim .leaflet-marker-icon, .leaflet-cluster-anim .leaflet-marker-shadow {
          transition: transform 0.3s ease-out, opacity 0.3s ease-in;
        }
      `}</style>
    </div>
  );
};

export default Spots;
