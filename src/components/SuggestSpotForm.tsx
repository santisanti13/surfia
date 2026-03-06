import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { MapPin, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SuggestSpotFormProps {
  onClose: () => void;
  onSubmitted: () => void;
}

const SuggestSpotForm = ({ onClose, onSubmitted }: SuggestSpotFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    location: "",
    lat: "",
    lng: "",
    wave_type: "beach_break",
    difficulty: "intermediate",
  });

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((f) => ({
            ...f,
            lat: pos.coords.latitude.toFixed(4),
            lng: pos.coords.longitude.toFixed(4),
          }));
          toast.success("📍 Ubicación obtenida");
        },
        () => toast.error("No se pudo obtener la ubicación")
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Inicia sesión para sugerir un spot");
      return;
    }

    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);
    if (isNaN(lat) || isNaN(lng)) {
      toast.error("Coordenadas inválidas");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("surf_spots").insert({
      name: form.name,
      location: form.location,
      lat,
      lng,
      wave_type: form.wave_type,
      difficulty: form.difficulty,
      source: "community",
      submitted_by: user.id,
      approved: false,
    });

    setLoading(false);

    if (error) {
      toast.error("Error al enviar: " + error.message);
    } else {
      toast.success("🏄 ¡Spot sugerido! Lo revisaremos pronto.");
      onSubmitted();
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl p-5 z-[1100] shadow-2xl"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display text-lg flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Sugerir Spot
        </h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label className="text-xs font-body">Nombre del spot</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ej: Playa de los Surfistas"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs font-body">Ubicación</Label>
          <Input
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            placeholder="Ej: Cádiz, Andalucía"
            required
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs font-body">Latitud</Label>
            <Input
              value={form.lat}
              onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
              placeholder="43.2847"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs font-body">Longitud</Label>
            <Input
              value={form.lng}
              onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
              placeholder="-2.1694"
              required
              className="mt-1"
            />
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGetLocation}
          className="w-full"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Usar mi ubicación actual
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs font-body">Tipo de ola</Label>
            <Select value={form.wave_type} onValueChange={(v) => setForm((f) => ({ ...f, wave_type: v }))}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beach_break">Beach Break</SelectItem>
                <SelectItem value="point_break">Point Break</SelectItem>
                <SelectItem value="reef_break">Reef Break</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-body">Dificultad</Label>
            <Select value={form.difficulty} onValueChange={(v) => setForm((f) => ({ ...f, difficulty: v }))}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Principiante</SelectItem>
                <SelectItem value="intermediate">Intermedio</SelectItem>
                <SelectItem value="advanced">Avanzado</SelectItem>
                <SelectItem value="expert">Experto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Enviando..." : "Enviar sugerencia"}
        </Button>
      </form>
    </motion.div>
  );
};

export default SuggestSpotForm;
