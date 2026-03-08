import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, ChevronUp } from "lucide-react";
import SpotFiltersBar, { type SpotFilters } from "./SpotFiltersBar";

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

interface SpotBottomSheetProps {
  spots: SurfSpot[];
  allSpotsCount: number;
  selectedSpotId: string | null;
  userPos: [number, number] | null;
  getDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
  onSpotClick: (spot: SurfSpot) => void;
  filters: SpotFilters;
  onFiltersChange: (filters: SpotFilters) => void;
}

const COLLAPSED_HEIGHT = 80;

const getDifficultyColor = (difficulty: string | null) => {
  switch (difficulty) {
    case "beginner": return "bg-primary/15 text-primary";
    case "intermediate": return "bg-accent/15 text-accent";
    case "advanced": return "bg-destructive/15 text-destructive";
    default: return "bg-secondary text-muted-foreground";
  }
};

const SpotBottomSheet = ({ spots, allSpotsCount, selectedSpotId, userPos, getDistance, onSpotClick, filters, onFiltersChange }: SpotBottomSheetProps) => {
  const [expanded, setExpanded] = useState(false);

  const sortedSpots = userPos
    ? [...spots].sort((a, b) => getDistance(userPos[0], userPos[1], a.lat, a.lng) - getDistance(userPos[0], userPos[1], b.lat, b.lng))
    : spots;

  const currentHeight = expanded ? window.innerHeight * 0.7 : COLLAPSED_HEIGHT;

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-[1000] md:hidden"
      animate={{ height: currentHeight }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
    >
      <div className="h-full bg-background/95 backdrop-blur-xl rounded-t-2xl border-t border-border/50 shadow-2xl flex flex-col">
        {/* Handle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex flex-col items-center pt-2 pb-3 px-4 cursor-grab active:cursor-grabbing"
        >
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mb-2" />
          <div className="flex items-center justify-between w-full">
            <div>
              <p className="font-display text-lg tracking-wide text-left">SPOTS DE SURF</p>
              <p className="text-[10px] text-muted-foreground font-body">
                {spots.length} spots · Desliza para explorar
              </p>
            </div>
            <ChevronUp className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
          </div>
        </button>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {!expanded ? (
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {sortedSpots.slice(0, 10).map((spot) => (
                <button
                  key={spot.id}
                  onClick={() => { onSpotClick(spot); setExpanded(false); }}
                  className={`flex-shrink-0 w-40 text-left p-2.5 rounded-xl transition-all ${
                    selectedSpotId === spot.id
                      ? "bg-primary/10 border border-primary/30"
                      : "bg-card border border-border/30"
                  }`}
                >
                  <p className="font-body font-semibold text-xs truncate">{spot.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-body ${getDifficultyColor(spot.difficulty)}`}>
                      {spot.difficulty}
                    </span>
                    {userPos && (
                      <span className="text-[10px] text-primary font-body font-semibold">
                        {getDistance(userPos[0], userPos[1], spot.lat, spot.lng).toFixed(0)} km
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Filters */}
              <SpotFiltersBar
                filters={filters}
                onFiltersChange={onFiltersChange}
                hasUserPos={!!userPos}
                totalSpots={allSpotsCount}
                filteredCount={spots.length}
                compact
              />

              <div className="space-y-1.5">
                {sortedSpots.map((spot) => (
                  <button
                    key={spot.id}
                    onClick={() => { onSpotClick(spot); setExpanded(false); }}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      selectedSpotId === spot.id
                        ? "bg-primary/10 border border-primary/30"
                        : "bg-card/50 border border-transparent hover:bg-card"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <p className="font-body font-semibold text-sm truncate">{spot.name}</p>
                        <p className="text-xs text-muted-foreground font-body flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{spot.location}</span>
                        </p>
                      </div>
                      {userPos && (
                        <span className="text-xs text-primary font-body font-semibold whitespace-nowrap bg-primary/10 px-2 py-0.5 rounded-full">
                          {getDistance(userPos[0], userPos[1], spot.lat, spot.lng).toFixed(0)} km
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-0.5 rounded-full font-body">
                        {spot.wave_type?.replace(/_/g, " ")}
                      </span>
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-body font-medium ${getDifficultyColor(spot.difficulty)}`}>
                        {spot.difficulty}
                      </span>
                    </div>
                  </button>
                ))}

                {sortedSpots.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground font-body">No hay spots con estos filtros</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SpotBottomSheet;
