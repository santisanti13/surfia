import { useEffect, useState, useCallback } from "react";
import { Users, LogOut, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface CheckinRow {
  id: string;
  user_id: string;
  spot_id: string;
  note: string | null;
  created_at: string;
  expires_at: string;
}

interface CheckinWithProfile extends CheckinRow {
  display_name: string | null;
  avatar_url: string | null;
}

interface Props {
  spotId: string;
  spotName: string;
}

function timeAgo(iso: string): string {
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "ahora mismo";
  if (mins < 60) return `hace ${mins} min`;
  const h = Math.floor(mins / 60);
  return `hace ${h}h`;
}

function timeLeft(iso: string): string {
  const mins = Math.max(0, Math.floor((new Date(iso).getTime() - Date.now()) / 60000));
  if (mins < 1) return "expira ya";
  if (mins < 60) return `${mins} min restantes`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m restantes`;
}

const SpotCheckinLive = ({ spotId, spotName }: Props) => {
  const { user } = useAuth();
  const [checkins, setCheckins] = useState<CheckinWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [note, setNote] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [, forceTick] = useState(0);

  const fetchCheckins = useCallback(async () => {
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from("spot_checkins")
      .select("*")
      .eq("spot_id", spotId)
      .gt("expires_at", nowIso)
      .order("created_at", { ascending: false });

    if (error || !data) {
      setCheckins([]);
      setLoading(false);
      return;
    }

    const userIds = [...new Set(data.map((c) => c.user_id))];
    let profileMap = new Map<string, { display_name: string | null; avatar_url: string | null }>();
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);
      profileMap = new Map(
        profiles?.map((p) => [p.user_id, { display_name: p.display_name, avatar_url: p.avatar_url }]) || []
      );
    }

    setCheckins(
      data.map((c) => ({
        ...c,
        display_name: profileMap.get(c.user_id)?.display_name ?? null,
        avatar_url: profileMap.get(c.user_id)?.avatar_url ?? null,
      }))
    );
    setLoading(false);
  }, [spotId]);

  // Initial load + realtime
  useEffect(() => {
    setLoading(true);
    fetchCheckins();

    const channel = supabase
      .channel(`spot_checkins:${spotId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "spot_checkins", filter: `spot_id=eq.${spotId}` },
        () => fetchCheckins()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [spotId, fetchCheckins]);

  // Re-render every minute to update "expira en" labels and prune visually
  useEffect(() => {
    const t = setInterval(() => forceTick((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  // Filter out anything that has now expired client-side
  const activeCheckins = checkins.filter((c) => new Date(c.expires_at).getTime() > Date.now());
  const myCheckin = user ? activeCheckins.find((c) => c.user_id === user.id) : null;

  const handleCheckin = async () => {
    if (!user) {
      toast.error("Inicia sesión para hacer check-in");
      return;
    }
    setSubmitting(true);
    try {
      // Remove any prior active checkin from this user on this spot
      await supabase
        .from("spot_checkins")
        .delete()
        .eq("user_id", user.id)
        .eq("spot_id", spotId);

      const { error } = await supabase.from("spot_checkins").insert({
        user_id: user.id,
        spot_id: spotId,
        note: note.trim() ? note.trim().slice(0, 140) : null,
      });
      if (error) throw error;
      toast.success(`¡Check-in en ${spotName}! Caduca en 2h`);
      setNote("");
      setShowForm(false);
      fetchCheckins();
    } catch (err: any) {
      toast.error(err.message || "No se pudo hacer check-in");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckout = async () => {
    if (!user || !myCheckin) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("spot_checkins")
        .delete()
        .eq("id", myCheckin.id);
      if (error) throw error;
      toast.success("Check-out realizado");
      fetchCheckins();
    } catch (err: any) {
      toast.error(err.message || "Error al hacer check-out");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-card/60 rounded-xl border border-border/20 p-4 mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Users className="h-4 w-4 text-primary" />
            {activeCheckins.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}
          </div>
          <h4 className="text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground">
            En el agua ahora
          </h4>
        </div>
        <span className="text-sm font-display text-primary">
          {loading ? "…" : activeCheckins.length}
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
        </div>
      ) : activeCheckins.length === 0 ? (
        <p className="text-xs text-muted-foreground font-body py-2">
          Aún no hay nadie en este spot. ¡Sé el primero!
        </p>
      ) : (
        <ul className="space-y-2 mb-3">
          {activeCheckins.slice(0, 8).map((c) => (
            <li key={c.id} className="flex items-start gap-2.5 text-xs">
              <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-display text-primary shrink-0 overflow-hidden">
                {c.avatar_url ? (
                  <img src={c.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  (c.display_name || "S").charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body font-medium truncate">
                  {c.display_name || "Surfer"}
                  {user && c.user_id === user.id && (
                    <span className="ml-1.5 text-[9px] text-primary uppercase tracking-wider">(tú)</span>
                  )}
                </p>
                {c.note && (
                  <p className="text-muted-foreground font-body truncate">"{c.note}"</p>
                )}
                <p className="text-[10px] text-muted-foreground font-body flex items-center gap-1 mt-0.5">
                  <Clock className="h-2.5 w-2.5" />
                  {timeAgo(c.created_at)} · {timeLeft(c.expires_at)}
                </p>
              </div>
            </li>
          ))}
          {activeCheckins.length > 8 && (
            <li className="text-[10px] text-muted-foreground font-body text-center pt-1">
              +{activeCheckins.length - 8} surfers más
            </li>
          )}
        </ul>
      )}

      {!user ? (
        <Link to="/auth">
          <Button variant="outline" size="sm" className="w-full rounded-lg text-xs">
            Inicia sesión para hacer check-in
          </Button>
        </Link>
      ) : myCheckin ? (
        <Button
          onClick={handleCheckout}
          disabled={submitting}
          variant="outline"
          size="sm"
          className="w-full rounded-lg text-xs"
        >
          {submitting ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
          ) : (
            <LogOut className="h-3 w-3 mr-1.5" />
          )}
          Salir del agua
        </Button>
      ) : showForm ? (
        <div className="space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 140))}
            placeholder="¿Cómo está? (opcional) — ej. 'limpio, 1m, poca gente'"
            rows={2}
            maxLength={140}
            className="w-full text-xs font-body bg-background/60 border border-border/30 rounded-lg p-2 resize-none focus:outline-none focus:border-primary"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-body">{note.length}/140</span>
            <div className="flex gap-1.5">
              <Button
                onClick={() => { setShowForm(false); setNote(""); }}
                variant="ghost"
                size="sm"
                className="rounded-lg text-xs h-8"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCheckin}
                disabled={submitting}
                variant="hero"
                size="sm"
                className="rounded-lg text-xs h-8"
              >
                {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirmar check-in"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setShowForm(true)}
          variant="hero"
          size="sm"
          className="w-full rounded-lg text-xs"
        >
          <Users className="h-3 w-3 mr-1.5" />
          Hacer check-in (2h)
        </Button>
      )}
    </div>
  );
};

export default SpotCheckinLive;
