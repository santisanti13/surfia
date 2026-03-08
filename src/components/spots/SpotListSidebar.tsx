import { MapPin, Navigation } from "lucide-react";
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

interface SpotListSidebarProps {
  spots: SurfSpot[];
  allSpotsCount: number;
  selectedSpotId: string | null;
  userPos: [number, number] | null;
  geoError: string | null;
  getDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
  onSpotClick: (spot: SurfSpot) => void;
  filters: SpotFilters;
  onFiltersChange: (filters: SpotFilters) => void;
}

const getDifficultyColor = (difficulty: string | null) => {
  switch (difficulty) {
    case "beginner": return "bg-primary/15 text-primary";
    case "intermediate": return "bg-accent/15 text-accent";
    case "advanced": return "bg-destructive/15 text-destructive";
    default: return "bg-secondary text-muted-foreground";
  }
};

const SpotListSidebar = ({ spots, allSpotsCount, selectedSpotId, userPos, geoError, getDistance, onSpotClick, filters, onFiltersChange }: SpotListSidebarProps) => {
  const sortedSpots = userPos
    ? [...spots].sort((a, b) => getDistance(userPos[0], userPos[1], a.lat, a.lng) - getDistance(userPos[0], userPos[1], b.lat, b.lng))
    : spots;

  return (
    <div className="absolute top-0 left-0 h-full w-80 bg-background/95 backdrop-blur-xl border-r border-border/50 overflow-y-auto z-[1000] hidden md:block">
      <div className="p-4">
        <div className="mb-3">
          <h2 className="font-display text-2xl tracking-wide">SPOTS DE SURF</h2>
          <p className="text-xs text-muted-foreground font-body mt-1">
            {spots.length} spots · {userPos ? "Ordenados por distancia" : "España"}
          </p>
        </div>

        {geoError && (
          <div className="flex items-center gap-2 text-xs text-accent bg-accent/10 rounded-lg p-2.5 mb-3 border border-accent/20">
            <Navigation className="h-3 w-3 shrink-0" />
            {geoError}
          </div>
        )}

        {/* Filters */}
        <div className="mb-3">
          <SpotFiltersBar
            filters={filters}
            onFiltersChange={onFiltersChange}
            hasUserPos={!!userPos}
            totalSpots={allSpotsCount}
            filteredCount={spots.length}
          />
        </div>

        <div className="space-y-1.5">
          {sortedSpots.map((spot) => (
            <button
              key={spot.id}
              onClick={() => onSpotClick(spot)}
              className={`w-full text-left p-3 rounded-xl transition-all duration-200 group ${
                selectedSpotId === spot.id
                  ? "bg-primary/10 border border-primary/30 shadow-sm"
                  : "bg-card/50 border border-transparent hover:bg-card hover:border-border/50 hover:shadow-sm"
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <p className="font-body font-semibold text-sm truncate group-hover:text-primary transition-colors">
                    {spot.name}
                  </p>
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
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground font-body">No hay spots con estos filtros</p>
              <p className="text-xs text-muted-foreground font-body mt-1">Prueba a cambiar los filtros</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpotListSidebar;
