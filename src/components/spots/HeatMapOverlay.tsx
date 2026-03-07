import { useEffect, useRef } from "react";
import L from "leaflet";

interface SurfSpot {
  id: string;
  lat: number;
  lng: number;
  name: string;
}

interface HeatMapOverlayProps {
  map: L.Map | null;
  spots: SurfSpot[];
  visible: boolean;
}

// Simple circle-based heat map (no extra dependency needed)
const HeatMapOverlay = ({ map, spots, visible }: HeatMapOverlayProps) => {
  const circlesRef = useRef<L.Circle[]>([]);

  useEffect(() => {
    // Clear previous
    circlesRef.current.forEach((c) => c.remove());
    circlesRef.current = [];

    if (!map || !visible || spots.length === 0) return;

    spots.forEach((spot) => {
      // Generate a pseudo-random score based on spot position (deterministic per spot)
      const seed = (spot.lat * 1000 + spot.lng * 1000) % 10;
      const score = Math.max(2, Math.min(10, Math.round(seed)));

      const color =
        score >= 8 ? "hsl(185, 72%, 42%)" :
        score >= 5 ? "hsl(35, 90%, 55%)" :
        "hsl(0, 84%, 60%)";

      const opacity = 0.12 + (score / 10) * 0.15;
      const radius = 8000 + score * 2000; // 10-30km radius

      const circle = L.circle([spot.lat, spot.lng], {
        radius,
        color: "transparent",
        fillColor: color,
        fillOpacity: opacity,
        interactive: false,
      }).addTo(map);

      circlesRef.current.push(circle);
    });

    return () => {
      circlesRef.current.forEach((c) => c.remove());
      circlesRef.current = [];
    };
  }, [map, spots, visible]);

  return null;
};

export default HeatMapOverlay;
