import { useEffect, useRef } from 'react';
import L from 'leaflet';

interface SurfSpot {
  id: string;
  lat: number;
  lng: number;
  difficulty?: string | null;
}

interface HeatMapOverlayProps {
  map: L.Map | null;
  spots: SurfSpot[];
  show: boolean;
}

export default function HeatMapOverlay({ map, spots, show }: HeatMapOverlayProps) {
  const layerGroupRef = useRef<L.FeatureGroup | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!layerGroupRef.current) {
      layerGroupRef.current = L.featureGroup().addTo(map);
    }

    const group = layerGroupRef.current;
    group.clearLayers();

    const mapContainer = map.getContainer();
    const tilePane = mapContainer.querySelector('.leaflet-tile-pane') as HTMLElement;

    if (show) {
      if (tilePane) {
        tilePane.style.transition = 'filter 0.5s ease';
        tilePane.style.filter = 'contrast(0.85) brightness(0.6) saturate(1.3) sepia(0.2)';
      }

      spots.forEach((spot) => {
        let color = 'rgba(239, 68, 68, 0.7)'; 
        let radius = 160;
        
        // Intensity pseudo-random based on id to keep it stable
        const hash = spot.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        const intensity = hash % 3;
        
        if (spot.difficulty === 'alta' || intensity === 2) {
          color = 'rgba(244, 63, 94, 0.8)'; // Rose
          radius = 170;
        } else if (spot.difficulty === 'media' || intensity === 1) {
          color = 'rgba(245, 158, 11, 0.75)'; // Amber
          radius = 140;
        } else {
          color = 'rgba(16, 185, 129, 0.7)'; // Green
          radius = 110;
        }

        const heatIcon = L.divIcon({
          className: 'custom-heat-icon',
          html: `<div style="
            width: 100%; 
            height: 100%; 
            background: radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 65%);
            border-radius: 50%;
            filter: blur(8px);
            mix-blend-mode: screen;
          "></div>`,
          iconSize: [radius, radius],
          iconAnchor: [radius/2, radius/2],
        });

        L.marker([spot.lat, spot.lng], { icon: heatIcon, interactive: false }).addTo(group);
      });
    } else {
      if (tilePane) {
        tilePane.style.filter = 'none';
      }
    }

    return () => {
      if (layerGroupRef.current) {
        layerGroupRef.current.clearLayers();
      }
    };
  }, [map, spots, show]);

  useEffect(() => {
    return () => {
      if (map) {
        const tilePane = map.getContainer().querySelector('.leaflet-tile-pane') as HTMLElement;
        if (tilePane) tilePane.style.filter = 'none';
      }
    };
  }, [map]);

  return null;
}
