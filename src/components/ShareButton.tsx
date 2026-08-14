import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  title: string;
  text?: string;
  className?: string;
}

const ShareButton = ({ title, text, className }: ShareButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        /* usuario canceló: seguimos con copiar */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* sin permisos de portapapeles */
    }
  };

  return (
    <Button
      type="button"
      variant="glass"
      size="sm"
      onClick={handleShare}
      aria-label="Compartir este artículo"
      className={`rounded-full ${className ?? ""}`}
    >
      {copied ? <Check className="h-4 w-4 mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
      {copied ? "Enlace copiado" : "Compartir"}
    </Button>
  );
};

export default ShareButton;
