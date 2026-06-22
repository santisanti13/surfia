import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AlertCheck {
  id: string;
  spot_id: string;
  min_wave_height: number;
  max_wind_speed: number;
  preferred_wind_direction: string | null;
  is_active: boolean;
}

interface SpotInfo {
  id: string;
  name: string;
  lat: number;
  lng: number;
  playa_id_aemet: string | null;
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const waveMap: Record<string, number> = {
  "en calma": 0.2, "calma": 0.2, "débil": 0.5, "debil": 0.5,
  "moderado": 1.2, "moderada": 1.2, "fuerte": 2.5, "muy fuerte": 4.0,
};

const windMap: Record<string, number> = {
  "en calma": 0, "calma": 0, "flojo": 10, "moderado": 20, "moderada": 20,
  "fuerte": 35, "muy fuerte": 50,
};

export function useAlertChecker() {
  const { user } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const notifiedRef = useRef<Set<string>>(new Set());

  const checkAlerts = useCallback(async () => {
    if (!user) return;

    // Get user position
    const position = await new Promise<GeolocationPosition | null>((resolve) => {
      if (!("geolocation" in navigator)) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), { timeout: 5000 });
    });

    // Fetch active alerts
    const { data: alerts } = await supabase
      .from("user_alerts")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (!alerts || alerts.length === 0) return;

    // Get spots for these alerts
    const spotIds = [...new Set(alerts.map((a: AlertCheck) => a.spot_id))];
    const { data: spots } = await supabase
      .from("surf_spots")
      .select("id, name, lat, lng, playa_id_aemet")
      .in("id", spotIds);

    if (!spots) return;

    // Check each alert against current conditions
    for (const alert of alerts as AlertCheck[]) {
      const spot = spots.find((s: SpotInfo) => s.id === alert.spot_id);
      if (!spot) continue;

      // Skip if already notified in this session
      if (notifiedRef.current.has(alert.id)) continue;

      try {
        const { data: weather } = await supabase.functions.invoke("aemet-weather", {
          body: { playa_id: spot.playa_id_aemet ?? undefined, lat: spot.lat, lng: spot.lng },
        });

        if (!weather || weather.error) continue;

        // Parse wave height from AEMET description
        const alturaText = weather.oleaje?.altura?.replace("m", "") || "0";
        const waveHeight = parseFloat(alturaText) || waveMap[alturaText.toLowerCase()] || 0;

        // Parse wind speed
        const windText = weather.viento?.velocidad?.replace(" km/h", "") || "0";
        const windSpeed = parseFloat(windText) || windMap[windText.toLowerCase()] || 0;

        // Check if conditions match alert
        const waveMatch = waveHeight >= alert.min_wave_height;
        const windMatch = windSpeed <= alert.max_wind_speed;

        if (waveMatch && windMatch) {
          notifiedRef.current.add(alert.id);

          const distText = position
            ? ` a ${getDistance(position.coords.latitude, position.coords.longitude, spot.lat, spot.lng).toFixed(0)} km de ti`
            : "";

          // Show notification
          toast.success(
            `🏄 ¡Olas de ${weather.oleaje?.altura} con viento ${weather.viento?.velocidad}${distText}!`,
            {
              description: `${spot.name} — ${weather.estado_cielo}`,
              duration: 10000,
            }
          );

          // Try browser notification
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(`🏄 ¡Buenas condiciones en ${spot.name}!`, {
              body: `Olas de ${weather.oleaje?.altura} con viento ${weather.viento?.velocidad}${distText}`,
              icon: "/favicon.ico",
            });
          }
        }
      } catch {
        // Skip on error
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Check immediately, then every 10 minutes
    const timeout = setTimeout(checkAlerts, 3000);
    intervalRef.current = setInterval(checkAlerts, 10 * 60 * 1000);

    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, checkAlerts]);
}
