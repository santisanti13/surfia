import { Map, Satellite, Mountain } from "lucide-react";

type LayerType = "streets" | "satellite" | "terrain";

interface MapLayerControlProps {
  activeLayer: LayerType;
  onLayerChange: (layer: LayerType) => void;
}

const layers: { id: LayerType; icon: typeof Map; label: string }[] = [
  { id: "streets", icon: Map, label: "Mapa" },
  { id: "satellite", icon: Satellite, label: "Satélite" },
  { id: "terrain", icon: Mountain, label: "Terreno" },
];

const MapLayerControl = ({ activeLayer, onLayerChange }: MapLayerControlProps) => {
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-1 bg-background/90 backdrop-blur-xl rounded-xl border border-border/50 p-1 shadow-lg">
      {layers.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onLayerChange(id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-body font-medium transition-all duration-200 ${
            activeLayer === id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          title={label}
        >
          <Icon className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">{label}</span>
        </button>
      ))}
    </div>
  );
};

export default MapLayerControl;
export type { LayerType };
