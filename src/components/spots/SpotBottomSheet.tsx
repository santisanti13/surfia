import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, ChevronUp, Search, X } from "lucide-react";
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
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const COLLAPSED_HEIGHT = 80;

const getDifficultyColor = (difficulty: string | null) => {
  switch (difficulty) {
    case "beginner": return "bg-primary/15 text-ocean-deep";
    case "intermediate": return "bg-accent/15 text-ocean-deep";
    case "advanced": return "bg-destructive/15 text-ocean-deep";
    default: return "bg-ocean-mid/10 text-ocean-deep";
  }
};

const SpotBottomSheet = ({ spots, allSpotsCount, selectedSpotId, userPos, getDistance, onSpotClick, filters, onFiltersChange, searchQuery, onSearchChange }: SpotBottomSheetProps) => {
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
      <div className="h-full glass-panel rounded-t-2xl border-t border-border/50 shadow-2xl flex flex-col">
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
                  className={`spot-list-card flex-shrink-0 w-40 text-left p-2.5 rounded-xl transition-all border ${
                    selectedSpotId === spot.id
                      ? "spot-list-card-active border-primary/40"
                      : "border-border/50 hover:border-primary/50"
                  }`}
                >
                  <p className="font-body font-bold text-sm text-ocean-deep truncate leading-tight">{spot.name}</p>
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-ocean-mid mt-0.5">
                    <MapPin className="h-2.5 w-2.5 shrink-0 text-ocean-mid" />
                    <span className="truncate">{spot.location}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-body font-medium ${getDifficultyColor(spot.difficulty)}`}>
                      {spot.difficulty}
                    </span>
                    {userPos && (
                      <span className="text-[10px] text-ocean-deep font-body font-bold">
                        {getDistance(userPos[0], userPos[1], spot.lat, spot.lng).toFixed(0)} km
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Buscar spot..."
                  className="w-full glass-card border border-border/30 rounded-xl pl-9 pr-8 py-2 text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                )}
              </div>

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
                    className={`spot-list-card w-full text-left p-3 rounded-xl transition-all border ${
                      selectedSpotId === spot.id
                        ? "spot-list-card-active border-primary/50"
                        : "border-border/50 hover:border-primary/50"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <p className="font-body font-bold text-[15px] leading-tight text-card-foreground truncate">
                          {spot.name}
                        </p>
                        <p className="text-xs font-semibold text-muted-foreground font-body flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 shrink-0 text-primary/80" />
                          <span className="truncate">{spot.location}</span>
                        </p>
                      </div>
                      {userPos && (
                        <span className="text-xs text-primary font-body font-bold whitespace-nowrap bg-primary/15 px-2 py-0.5 rounded-full">
                          {getDistance(userPos[0], userPos[1], spot.lat, spot.lng).toFixed(0)} km
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      <span className="text-[11px] uppercase tracking-wider text-secondary-foreground bg-secondary px-2 py-0.5 rounded-full font-body font-medium">
                        {spot.wave_type?.replace(/_/g, " ")}
                      </span>
                      <span className={`text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full font-body font-medium ${getDifficultyColor(spot.difficulty)}`}>
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
