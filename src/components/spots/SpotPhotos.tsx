import { useState, useEffect, useRef } from "react";
import { Camera, Plus, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface SpotPhotosProps {
  spotId: string;
}

interface SpotPhoto {
  id: string;
  photo_url: string;
  caption: string | null;
  created_at: string;
  user_id: string;
}

const SpotPhotos = ({ spotId }: SpotPhotosProps) => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<SpotPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase
      .from("spot_photos")
      .select("*")
      .eq("spot_id", spotId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setPhotos(data);
      });
  }, [spotId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La foto no puede superar 5MB");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${spotId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("spot-photos")
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("spot-photos")
        .getPublicUrl(path);

      const { error: insertError } = await supabase
        .from("spot_photos")
        .insert({ spot_id: spotId, user_id: user.id, photo_url: urlData.publicUrl });

      if (insertError) throw insertError;

      // Refresh photos
      const { data } = await supabase
        .from("spot_photos")
        .select("*")
        .eq("spot_id", spotId)
        .order("created_at", { ascending: false });

      if (data) setPhotos(data);
      toast.success("¡Foto subida!");
    } catch (err: any) {
      toast.error("Error al subir la foto");
      console.error(err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-body">
          Fotos ({photos.length})
        </p>
        {user && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
            Subir
          </Button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-6 bg-card/40 rounded-xl border border-border/20">
          <Camera className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground font-body">Aún no hay fotos</p>
          {user && (
            <p className="text-[10px] text-muted-foreground/60 font-body mt-1">Sé el primero en subir una</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5">
          {photos.map((photo) => (
            <button
              key={photo.id}
              onClick={() => setSelectedPhoto(photo.photo_url)}
              className="aspect-square rounded-lg overflow-hidden group relative"
            >
              <img
                src={photo.photo_url}
                alt="Spot"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[2000] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button className="absolute top-4 right-4 text-white/70 hover:text-white" onClick={() => setSelectedPhoto(null)}>
            <X className="h-6 w-6" />
          </button>
          <img src={selectedPhoto} alt="Spot" className="max-w-full max-h-full rounded-lg" />
        </div>
      )}
    </div>
  );
};

export default SpotPhotos;
