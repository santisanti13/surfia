import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Plus, Trash2, Waves, Wind, MapPin, Navigation, Loader2, ArrowLeft, BellOff } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";

interface SurfSpot {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
}

interface UserAlert {
  id: string;
  spot_id: string;
  min_wave_height: number;
  max_wind_speed: number;
  preferred_wind_direction: string | null;
  is_active: boolean;
  spot?: SurfSpot;
}

const Alerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<UserAlert[]>([]);
  const [spots, setSpots] = useState<SurfSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // New alert form
  const [selectedSpot, setSelectedSpot] = useState("");
  const [minWave, setMinWave] = useState("1.0");
  const [maxWind, setMaxWind] = useState("25");
  const [windDir, setWindDir] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) { setLoading(false); return; }

    const [spotsRes, alertsRes] = await Promise.all([
      supabase.from("surf_spots").select("id, name, location, lat, lng"),
      supabase.from("user_alerts").select("*").eq("user_id", user.id),
    ]);

    if (spotsRes.data) setSpots(spotsRes.data);
    if (alertsRes.data) {
      const enriched = alertsRes.data.map((a: any) => ({
        ...a,
        spot: spotsRes.data?.find((s: SurfSpot) => s.id === a.spot_id),
      }));
      setAlerts(enriched);
    }
    setLoading(false);
  };

  const createAlert = async () => {
    if (!user || !selectedSpot) return;
    setSaving(true);

    const { error } = await supabase.from("user_alerts").insert({
      user_id: user.id,
      spot_id: selectedSpot,
      min_wave_height: parseFloat(minWave),
      max_wind_speed: parseFloat(maxWind),
      preferred_wind_direction: windDir || null,
    });

    if (error) {
      toast.error("Error al crear alerta");
    } else {
      toast.success("¡Alerta creada!");
      setShowForm(false);
      setSelectedSpot("");
      setMinWave("1.0");
      setMaxWind("25");
      setWindDir("");
      fetchData();
    }
    setSaving(false);
  };

  const toggleAlert = async (id: string, isActive: boolean) => {
    await supabase.from("user_alerts").update({ is_active: !isActive }).eq("id", id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_active: !isActive } : a)));
  };

  const deleteAlert = async (id: string) => {
    await supabase.from("user_alerts").delete().eq("id", id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast.success("Alerta eliminada");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 px-4 text-center max-w-md mx-auto">
          <Bell className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="font-display text-3xl mb-2">Alertas de Surf</h1>
          <p className="text-muted-foreground font-body mb-6">
            Inicia sesión para configurar alertas y recibir notificaciones cuando haya buenas condiciones.
          </p>
          <Link to="/auth">
            <Button variant="hero" className="rounded-xl">Iniciar sesión</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 px-4 max-w-2xl mx-auto pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl">Mis Alertas</h1>
            <p className="text-sm text-muted-foreground font-body mt-1">
              Recibe notificaciones cuando haya buenas condiciones
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} variant="hero" className="rounded-xl">
            <Plus className="h-4 w-4 mr-1" /> Nueva
          </Button>
        </div>

        {/* New alert form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <h3 className="font-display text-xl">Nueva alerta</h3>

                <div>
                  <Label className="font-body text-sm">Spot</Label>
                  <Select value={selectedSpot} onValueChange={setSelectedSpot}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecciona un spot" />
                    </SelectTrigger>
                    <SelectContent>
                      {spots.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} — {s.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-body text-sm">Altura mínima de ola (m)</Label>
                    <Input type="number" step="0.1" min="0" value={minWave} onChange={(e) => setMinWave(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="font-body text-sm">Viento máximo (km/h)</Label>
                    <Input type="number" step="1" min="0" value={maxWind} onChange={(e) => setMaxWind(e.target.value)} className="mt-1" />
                  </div>
                </div>

                <div>
                  <Label className="font-body text-sm">Dirección viento preferida (opcional)</Label>
                  <Select value={windDir} onValueChange={setWindDir}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Cualquier dirección" />
                    </SelectTrigger>
                    <SelectContent>
                      {["N", "NE", "E", "SE", "S", "SW", "W", "NW"].map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3">
                  <Button onClick={createAlert} variant="hero" className="rounded-xl flex-1" disabled={saving || !selectedSpot}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear alerta"}
                  </Button>
                  <Button onClick={() => setShowForm(false)} variant="outline" className="rounded-xl">
                    Cancelar
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Alerts list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12">
            <BellOff className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-body">No tienes alertas configuradas</p>
            <p className="text-xs text-muted-foreground font-body mt-1">
              Crea una para recibir notificaciones cuando haya buenas condiciones
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-card border border-border rounded-2xl p-5 transition-opacity ${!alert.is_active ? "opacity-50" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-body font-semibold">{alert.spot?.name || "Spot desconocido"}</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-body mb-3">
                      {alert.spot?.location}
                    </p>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1.5">
                        <Waves className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-body">≥ {alert.min_wave_height}m</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Wind className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-body">≤ {alert.max_wind_speed} km/h</span>
                      </div>
                      {alert.preferred_wind_direction && (
                        <div className="flex items-center gap-1.5">
                          <Navigation className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-body">{alert.preferred_wind_direction}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={alert.is_active}
                      onCheckedChange={() => toggleAlert(alert.id, alert.is_active)}
                    />
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
