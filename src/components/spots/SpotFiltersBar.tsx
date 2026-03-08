import { useState } from "react";
import { Filter, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface SpotFilters {
  difficulty: string[];
  waveType: string[];
  maxDistance: number | null; // km, null = no limit
}

interface SpotFiltersBarProps {
  filters: SpotFilters;
  onFiltersChange: (filters: SpotFilters) => void;
  hasUserPos: boolean;
  totalSpots: number;
  filteredCount: number;
  compact?: boolean;
}

const DIFFICULTIES = [
  { value: "beginner", label: "Principiante", color: "bg-primary/15 text-primary border-primary/30" },
  { value: "intermediate", label: "Intermedio", color: "bg-accent/15 text-accent border-accent/30" },
  { value: "advanced", label: "Avanzado", color: "bg-destructive/15 text-destructive border-destructive/30" },
];

const WAVE_TYPES = [
  { value: "beach_break", label: "Beach Break" },
  { value: "reef_break", label: "Reef Break" },
  { value: "point_break", label: "Point Break" },
  { value: "river_mouth", label: "River Mouth" },
];

const DISTANCES = [
  { value: null, label: "Sin límite" },
  { value: 25, label: "< 25 km" },
  { value: 50, label: "< 50 km" },
  { value: 100, label: "< 100 km" },
  { value: 200, label: "< 200 km" },
];

export const emptyFilters: SpotFilters = {
  difficulty: [],
  waveType: [],
  maxDistance: null,
};

export function hasActiveFilters(filters: SpotFilters): boolean {
  return filters.difficulty.length > 0 || filters.waveType.length > 0 || filters.maxDistance !== null;
}

const SpotFiltersBar = ({
  filters,
  onFiltersChange,
  hasUserPos,
  totalSpots,
  filteredCount,
  compact = false,
}: SpotFiltersBarProps) => {
  const [expanded, setExpanded] = useState(false);
  const active = hasActiveFilters(filters);
  const activeCount = filters.difficulty.length + filters.waveType.length + (filters.maxDistance ? 1 : 0);

  const toggleDifficulty = (val: string) => {
    const next = filters.difficulty.includes(val)
      ? filters.difficulty.filter((d) => d !== val)
      : [...filters.difficulty, val];
    onFiltersChange({ ...filters, difficulty: next });
  };

  const toggleWaveType = (val: string) => {
    const next = filters.waveType.includes(val)
      ? filters.waveType.filter((w) => w !== val)
      : [...filters.waveType, val];
    onFiltersChange({ ...filters, waveType: next });
  };

  const setDistance = (val: number | null) => {
    onFiltersChange({ ...filters, maxDistance: val });
  };

  const clearAll = () => {
    onFiltersChange(emptyFilters);
  };

  return (
    <div className="w-full">
      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border transition-all text-xs font-body font-medium ${
          active
            ? "bg-primary/10 border-primary/30 text-primary"
            : "bg-card/60 border-border/30 text-muted-foreground hover:bg-card hover:border-border/50"
        }`}
      >
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5" />
          <span>Filtros</span>
          {active && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {active && (
            <span className="text-[10px] text-muted-foreground">
              {filteredCount}/{totalSpots}
            </span>
          )}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* Expanded filter panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className={`pt-3 space-y-3 ${compact ? "px-0" : ""}`}>
              {/* Difficulty */}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-body mb-1.5">
                  Dificultad
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => toggleDifficulty(d.value)}
                      className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-body font-medium border transition-all ${
                        filters.difficulty.includes(d.value)
                          ? d.color
                          : "bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wave type */}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-body mb-1.5">
                  Tipo de ola
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {WAVE_TYPES.map((w) => (
                    <button
                      key={w.value}
                      onClick={() => toggleWaveType(w.value)}
                      className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-body font-medium border transition-all ${
                        filters.waveType.includes(w.value)
                          ? "bg-primary/15 text-primary border-primary/30"
                          : "bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary"
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Distance */}
              {hasUserPos && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-body mb-1.5">
                    Distancia máxima
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {DISTANCES.map((d) => (
                      <button
                        key={String(d.value)}
                        onClick={() => setDistance(d.value)}
                        className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-body font-medium border transition-all ${
                          filters.maxDistance === d.value
                            ? "bg-primary/15 text-primary border-primary/30"
                            : "bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear all */}
              {active && (
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1.5 text-[10px] text-destructive font-body font-medium hover:underline"
                >
                  <X className="h-3 w-3" />
                  Limpiar filtros
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpotFiltersBar;
