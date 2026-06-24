import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Trash2, Plus, RefreshCw } from "lucide-react";

type Mapping = {
  id: string;
  spot_name: string;
  aemet_id: string;
  aemet_name: string | null;
  notes: string | null;
  updated_at: string;
};

type LogRow = {
  id: string;
  spot_name: string;
  previous_aemet_id: string | null;
  new_aemet_id: string | null;
  method: string;
  created_at: string;
};

const SECRET_KEY = "surfia.adminSecret";

export default function AdminAemet() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setIsAdmin(false); setChecking(false); return; }
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
      setChecking(false);
    })();
  }, [user, authLoading]);

  if (authLoading || checking) {
    return <div className="p-8 flex items-center gap-2"><Loader2 className="animate-spin" /> Cargando…</div>;
  }
  if (!user) {
    return (
      <div className="p-8 max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Admin AEMET</h1>
        <p>Inicia sesión para continuar.</p>
        <Link className="underline text-primary" to="/auth">Ir a login</Link>
      </div>
    );
  }
  if (!isAdmin) return <BootstrapAdmin userId={user.id} onGranted={() => setIsAdmin(true)} />;

  return <AdminPanel />;
}

function BootstrapAdmin({ userId, onGranted }: { userId: string; onGranted: () => void }) {
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("grant-admin", {
        body: { secret, user_id: userId },
      });
      if (error || (data as any)?.error) throw new Error(error?.message || (data as any)?.error);
      localStorage.setItem(SECRET_KEY, secret);
      toast({ title: "Admin activado" });
      onGranted();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="p-8 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Activar admin</h1>
      <p className="text-sm text-muted-foreground">Introduce el ADMIN_SECRET para concederte rol de admin.</p>
      <Input type="password" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="ADMIN_SECRET" />
      <Button onClick={submit} disabled={!secret || loading}>
        {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}Activar
      </Button>
    </div>
  );
}

function AdminPanel() {
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [log, setLog] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [secret, setSecret] = useState(() => localStorage.getItem(SECRET_KEY) || "");

  const loadAll = async () => {
    setLoading(true);
    const [mRes, lRes] = await Promise.all([
      supabase.from("aemet_manual_mappings").select("*").order("spot_name"),
      supabase.from("aemet_assignment_log").select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    if (mRes.data) setMappings(mRes.data as Mapping[]);
    if (lRes.data) setLog(lRes.data as LogRow[]);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const saveSecret = (v: string) => {
    setSecret(v);
    localStorage.setItem(SECRET_KEY, v);
  };

  const runBatch = async (mode: "assign" | "reassign_suspicious", dry_run: boolean) => {
    if (!secret) { toast({ title: "Falta ADMIN_SECRET", variant: "destructive" }); return; }
    setRunning(true);
    try {
      const url = `https://zaujdnwzngtcnfektfgj.supabase.co/functions/v1/auto-assign-aemet-ids`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
        },
        body: JSON.stringify({ mode, dry_run, limit: 50 }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error");
      toast({
        title: dry_run ? "Dry run completado" : "Ejecutado",
        description: mode === "assign"
          ? `Procesados ${json.processed} · Asignados ${json.assigned}`
          : `Procesados ${json.processed} · Nulled ${json.nulled}`,
      });
      await loadAll();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Admin · AEMET</h1>
        <Button variant="outline" size="sm" onClick={loadAll} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />Recargar
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Ejecutar matcher</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input
            type="password"
            placeholder="ADMIN_SECRET"
            value={secret}
            onChange={(e) => saveSecret(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => runBatch("assign", true)} disabled={running} variant="secondary">Assign · Dry run</Button>
            <Button onClick={() => runBatch("assign", false)} disabled={running}>Assign · Escribir</Button>
            <Button onClick={() => runBatch("reassign_suspicious", true)} disabled={running} variant="secondary">Reassign · Dry run</Button>
            <Button onClick={() => runBatch("reassign_suspicious", false)} disabled={running} variant="destructive">Reassign · Escribir</Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="mappings">
        <TabsList>
          <TabsTrigger value="mappings">Mapeos ({mappings.length})</TabsTrigger>
          <TabsTrigger value="log">Historial ({log.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="mappings" className="space-y-4">
          <MappingsEditor mappings={mappings} reload={loadAll} />
        </TabsContent>
        <TabsContent value="log">
          <LogView rows={log} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MappingsEditor({ mappings, reload }: { mappings: Mapping[]; reload: () => Promise<void> }) {
  const [filter, setFilter] = useState("");
  const filtered = useMemo(
    () => mappings.filter((m) => (m.spot_name + " " + (m.aemet_name || "") + " " + m.aemet_id).toLowerCase().includes(filter.toLowerCase())),
    [mappings, filter],
  );

  const [draft, setDraft] = useState({ spot_name: "", aemet_id: "", aemet_name: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const add = async () => {
    if (!draft.spot_name.trim() || !draft.aemet_id.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("aemet_manual_mappings").insert({
      spot_name: draft.spot_name.trim(),
      aemet_id: draft.aemet_id.trim(),
      aemet_name: draft.aemet_name.trim() || null,
      notes: draft.notes.trim() || null,
    });
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setDraft({ spot_name: "", aemet_id: "", aemet_name: "", notes: "" });
    await reload();
  };

  const update = async (m: Mapping, patch: Partial<Mapping>) => {
    const { error } = await supabase.from("aemet_manual_mappings").update(patch).eq("id", m.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    await reload();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar mapeo?")) return;
    const { error } = await supabase.from("aemet_manual_mappings").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    await reload();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Añadir mapeo</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-2">
          <Input placeholder="spot_name (ej: Mundaka)" value={draft.spot_name} onChange={(e) => setDraft({ ...draft, spot_name: e.target.value })} />
          <Input placeholder="aemet_id (7 dígitos)" value={draft.aemet_id} onChange={(e) => setDraft({ ...draft, aemet_id: e.target.value })} />
          <Input placeholder="aemet_name (ej: Laida)" value={draft.aemet_name} onChange={(e) => setDraft({ ...draft, aemet_name: e.target.value })} />
          <div className="flex gap-2">
            <Textarea className="min-h-10" placeholder="notas" value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
            <Button onClick={add} disabled={saving}><Plus className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>

      <Input placeholder="Filtrar…" value={filter} onChange={(e) => setFilter(e.target.value)} />

      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Spot</TableHead>
              <TableHead>AEMET id</TableHead>
              <TableHead>AEMET name</TableHead>
              <TableHead>Notas</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((m) => (
              <TableRow key={m.id}>
                <TableCell><EditableCell value={m.spot_name} onSave={(v) => update(m, { spot_name: v })} /></TableCell>
                <TableCell><EditableCell value={m.aemet_id} onSave={(v) => update(m, { aemet_id: v })} /></TableCell>
                <TableCell><EditableCell value={m.aemet_name ?? ""} onSave={(v) => update(m, { aemet_name: v })} /></TableCell>
                <TableCell><EditableCell value={m.notes ?? ""} onSave={(v) => update(m, { notes: v })} /></TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => remove(m.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">Sin mapeos.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function EditableCell({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  return (
    <Input
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => { if (v !== value) onSave(v); }}
      className="h-8"
    />
  );
}

function LogView({ rows }: { rows: LogRow[] }) {
  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Spot</TableHead>
            <TableHead>Antes</TableHead>
            <TableHead>Ahora</TableHead>
            <TableHead>Método</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="whitespace-nowrap text-xs">{new Date(r.created_at).toLocaleString("es-ES")}</TableCell>
              <TableCell>{r.spot_name}</TableCell>
              <TableCell className="font-mono text-xs">{r.previous_aemet_id ?? "—"}</TableCell>
              <TableCell className="font-mono text-xs">{r.new_aemet_id ?? "—"}</TableCell>
              <TableCell><span className="text-xs px-2 py-0.5 rounded bg-muted">{r.method}</span></TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">Sin entradas todavía.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
