import { MapPin, Navigation, Search, X } from "lucide-react";
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
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const getDifficultyColor = (difficulty: string | null) => {
  switch (difficulty) {
    case "beginner": return "bg-primary/15 text-ocean-deep";
    case "intermediate": return "bg-accent/15 text-ocean-deep";
    case "advanced": return "bg-destructive/15 text-ocean-deep";
    default: return "bg-ocean-mid/10 text-ocean-deep";
  }
};

const SpotListSidebar = ({ spots, allSpotsCount, selectedSpotId, userPos, geoError, getDistance, onSpotClick, filters, onFiltersChange, searchQuery, onSearchChange }: SpotListSidebarProps) => {
  const sortedSpots = userPos
    ? [...spots].sort((a, b) => getDistance(userPos[0], userPos[1], a.lat, a.lng) - getDistance(userPos[0], userPos[1], b.lat, b.lng))
    : spots;

  return (
    <div className="absolute top-4 left-4 bottom-4 w-80 glass-panel border border-border/50 rounded-2xl shadow-xl overflow-hidden z-[1000] hidden md:flex flex-col">
      <div className="px-4 pt-4 pb-3 border-b border-border/40 shrink-0">
        <h2 className="font-display text-2xl tracking-wide text-foreground">SPOTS DE SURF</h2>
        <p className="text-xs text-muted-foreground font-body mt-1">
          {spots.length} spots · {userPos ? "Ordenados por distancia" : "España"}
        </p>
      </div>
      <div className="p-4 overflow-y-auto flex-1 spot-scroll">

        {geoError && (
          <div className="flex items-center gap-2 text-xs text-accent bg-accent/10 rounded-lg p-2.5 mb-3 border border-accent/20">
            <Navigation className="h-3 w-3 shrink-0" />
            {geoError}
          </div>
        )}

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre o ubicación..."
            className="w-full glass-card border border-border/30 rounded-xl pl-9 pr-8 py-2 text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>

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
              className={`spot-list-card w-full text-left p-3 rounded-xl transition-all duration-200 group border ${
                selectedSpotId === spot.id
                  ? "spot-list-card-active border-primary/50 shadow-sm"
                  : "border-border/50 hover:border-primary/50"
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <p className="font-body font-bold text-[15px] leading-snug text-ocean-deep truncate group-hover:text-ocean-mid transition-colors">
                    {spot.name}
                  </p>
                  <p className="text-xs font-semibold text-ocean-mid font-body flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3 shrink-0 text-ocean-mid" />
                    <span className="truncate">{spot.location}</span>
                  </p>
                </div>
                {userPos && (
                  <span className="text-xs text-ocean-deep font-body font-bold whitespace-nowrap bg-ocean-deep/10 px-2 py-0.5 rounded-full">
                    {getDistance(userPos[0], userPos[1], spot.lat, spot.lng).toFixed(0)} km
                  </span>
                )}
              </div>
              <div className="flex gap-1.5 mt-2">
                <span className="text-[11px] uppercase tracking-wider text-ocean-deep bg-ocean-mid/15 px-2 py-0.5 rounded-full font-body font-medium">
                  {spot.wave_type?.replace(/_/g, " ")}
                </span>
                <span className={`text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full font-body font-medium ${getDifficultyColor(spot.difficulty)}`}>
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
