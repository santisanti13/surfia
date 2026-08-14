import { Link } from "react-router-dom";
import { MapPin, Bell } from "lucide-react";

/** CTA fijo en móvil: acceso rápido al mapa y a las alertas. */
const StickyMobileCta = () => (
  <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-2 bg-gradient-to-t from-background via-background/90 to-transparent">
    <div className="glass-panel rounded-2xl p-2 flex gap-2">
      <Link
        to="/spots"
        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-body text-sm font-semibold py-3"
      >
        <MapPin className="h-4 w-4" /> Ver olas ahora
      </Link>
      <Link
        to="/alerts"
        aria-label="Crear una alerta de olas"
        className="inline-flex items-center justify-center gap-2 rounded-xl px-4 border border-border/60 text-foreground font-body text-sm font-semibold"
      >
        <Bell className="h-4 w-4" /> Alertas
      </Link>
    </div>
  </div>
);

export default StickyMobileCta;
