import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Waves } from "lucide-react";

type OAuthNamespace = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};

function oauthApi(): OAuthNamespace {
  return (supabase.auth as unknown as { oauth: OAuthNamespace }).oauth;
}

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Falta el parámetro authorization_id");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error: err } = await oauthApi().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (err) {
        setError(err.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error: err } = approve
      ? await oauthApi().approveAuthorization(authorizationId)
      : await oauthApi().denyAuthorization(authorizationId);
    if (err) {
      setBusy(false);
      setError(err.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("El servidor de autorización no devolvió ninguna redirección.");
      return;
    }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? "una aplicación";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="glass-card w-full max-w-md rounded-2xl p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Waves className="h-7 w-7 text-primary" />
          <span className="font-display text-3xl tracking-wide">SURFIA</span>
        </div>

        {error ? (
          <p className="font-body text-sm text-muted-foreground">
            No se pudo cargar esta solicitud de autorización: {error}
          </p>
        ) : !details ? (
          <p className="font-body text-sm text-muted-foreground">Cargando…</p>
        ) : (
          <>
            <h1 className="font-display text-2xl mb-3">Conectar {clientName} a tu cuenta</h1>
            <p className="font-body text-sm text-muted-foreground mb-8">
              {clientName} podrá consultar spots y previsiones y gestionar tus favoritos, alertas y check-ins en tu nombre.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" disabled={busy} onClick={() => decide(false)}>
                Denegar
              </Button>
              <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>
                Autorizar
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
