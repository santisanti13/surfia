import { useState, useEffect } from "react";
import { Star, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface SpotReviewsProps {
  spotId: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  profile?: { display_name: string | null };
}

const StarRating = ({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <button
        key={i}
        onClick={() => interactive && onRate?.(i)}
        className={interactive ? "cursor-pointer" : "cursor-default"}
        disabled={!interactive}
      >
        <Star
          className={`h-4 w-4 transition-colors ${
            i <= rating ? "fill-accent text-accent" : "text-muted-foreground/30"
          }`}
        />
      </button>
    ))}
  </div>
);

const SpotReviews = ({ spotId }: SpotReviewsProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("spot_reviews")
      .select("*")
      .eq("spot_id", spotId)
      .order("created_at", { ascending: false });

    if (data) {
      // Fetch profiles for reviewers
      const userIds = [...new Set(data.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      setReviews(data.map(r => ({ ...r, profile: profileMap.get(r.user_id) || null })));
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [spotId]);

  const handleSubmit = async () => {
    if (!user || newRating === 0) {
      toast.error("Selecciona una puntuación");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("spot_reviews")
        .insert({
          spot_id: spotId,
          user_id: user.id,
          rating: newRating,
          comment: newComment.trim() || null,
        });

      if (error) throw error;

      setNewRating(0);
      setNewComment("");
      setShowForm(false);
      fetchReviews();
      toast.success("¡Reseña publicada!");
    } catch (err: any) {
      toast.error("Error al publicar la reseña");
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-body">
            Reseñas ({reviews.length})
          </p>
          {avgRating && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-accent text-accent" />
              <span className="text-xs font-body font-semibold">{avgRating}</span>
            </div>
          )}
        </div>
        {user && !showForm && (
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowForm(true)}>
            <Star className="h-3 w-3" /> Opinar
          </Button>
        )}
      </div>

      {/* New review form */}
      {showForm && user && (
        <div className="bg-card/60 rounded-xl border border-border/30 p-3 mb-3 space-y-2">
          <StarRating rating={newRating} onRate={setNewRating} interactive />
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="¿Cómo fue tu sesión?"
            className="w-full bg-transparent border border-border/30 rounded-lg p-2 text-xs font-body resize-none h-16 focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/50"
          />
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs gap-1 flex-1" onClick={handleSubmit} disabled={submitting || newRating === 0}>
              {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
              Publicar
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setShowForm(false); setNewRating(0); setNewComment(""); }}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="text-center py-6 bg-card/40 rounded-xl border border-border/20">
          <Star className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground font-body">Aún no hay reseñas</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {reviews.map((review) => (
            <div key={review.id} className="bg-card/40 rounded-xl border border-border/20 p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-body font-semibold">
                    {(review as any).profile?.display_name || "Surfer anónimo"}
                  </p>
                  <StarRating rating={review.rating} />
                </div>
                <span className="text-[10px] text-muted-foreground font-body">
                  {new Date(review.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                </span>
              </div>
              {review.comment && (
                <p className="text-xs text-muted-foreground/80 font-body mt-1">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpotReviews;
