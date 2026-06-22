import { useState, useEffect, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartPoint {
  label: string;
  hour: number;
  dayIndex: number;
  waveHeight: number;
  windSpeed: number;
  waveDesc: string;
  windDesc: string;
  skyDesc: string;
}

interface ForecastResponse {
  chartData: ChartPoint[];
  general: {
    tAgua: string;
    tMax: string;
    uvMax: string;
  };
  daysCount: number;
}

interface ForecastChartsProps {
  spotName: string;
  playaIdAemet?: string | null;
  lat?: number;
  lng?: number;
}

function generateFallbackData(): ChartPoint[] {
  const points: ChartPoint[] = [];
  const dayNames = ["Hoy", "Mañana", "Pasado"];
  for (let d = 0; d < 3; d++) {
    for (const h of [3, 9, 15, 21]) {
      const baseWave = 1.2 + Math.sin((d * 4 + h) / 4) * 0.8 + Math.random() * 0.3;
      const baseWind = 12 + Math.sin((d * 4 + h) / 3) * 8 + Math.random() * 5;
      points.push({
        label: `${dayNames[d]} ${String(h).padStart(2, "0")}:00`,
        hour: h,
        dayIndex: d,
        waveHeight: Math.max(0.3, parseFloat(baseWave.toFixed(1))),
        windSpeed: Math.max(3, Math.round(baseWind)),
        waveDesc: "",
        windDesc: "",
        skyDesc: "",
      });
    }
  }
  return points;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload as ChartPoint | undefined;
  return (
    <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-[10px] text-muted-foreground font-body mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs font-body font-medium" style={{ color: entry.color }}>
          {entry.name}: {entry.value}{entry.name === "Olas" ? "m" : entry.name === "Viento" ? " km/h" : "s"}
        </p>
      ))}
      {point?.waveDesc && (
        <p className="text-[10px] text-muted-foreground font-body mt-1">🌊 {point.waveDesc}</p>
      )}
      {point?.windDesc && (
        <p className="text-[10px] text-muted-foreground font-body">💨 {point.windDesc}</p>
      )}
      {point?.skyDesc && (
        <p className="text-[10px] text-muted-foreground font-body">☁️ {point.skyDesc}</p>
      )}
    </div>
  );
};

const ForecastCharts = ({ spotName, playaIdAemet, lat, lng }: ForecastChartsProps) => {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReal, setIsReal] = useState(false);
  const [source, setSource] = useState<string>("");

  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      if (playaIdAemet || (lat != null && lng != null)) {
        try {
          const { data: res, error } = await supabase.functions.invoke("aemet-forecast", {
            body: { playa_id: playaIdAemet ?? undefined, lat, lng },
          });
          if (!error && res && !res.error && res.chartData?.length > 0) {
            setData(res.chartData);
            setIsReal(true);
            setSource(res.source || "");
            setLoading(false);
            return;
          }
        } catch { /* fallback */ }
      }
      setData(generateFallbackData());
      setIsReal(false);
      setLoading(false);
    };
    fetchForecast();
  }, [playaIdAemet, lat, lng]);

  // Estimate period from wave height (rough approximation since AEMET doesn't provide it for beaches)
  const dataWithPeriod = useMemo(() =>
    data.map(d => ({
      ...d,
      period: Math.round(6 + d.waveHeight * 2.5),
    })), [data]
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[120px] w-full rounded-xl" />
        <Skeleton className="h-[100px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isReal && (
        <div className="flex items-center gap-2 text-[10px] text-accent bg-accent/10 rounded-lg p-2 border border-accent/20">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          <span className="font-body">Datos simulados</span>
        </div>
      )}

      {isReal && (
        <div className="flex items-center gap-2 text-[10px] text-primary bg-primary/10 rounded-lg p-2 border border-primary/20">
          <span className="font-body">✓ Datos {source === "stormglass" ? "Stormglass" : "AEMET"} en tiempo real · Previsión {data.length > 4 ? "3 días" : "24h"}</span>
        </div>
      )}

      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-body mb-2">
          Oleaje · {isReal ? (source === "stormglass" ? "Stormglass" : "AEMET") : "simulado"}
        </p>
        <div className="bg-card/40 rounded-xl border border-border/20 p-3">
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={dataWithPeriod} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={Math.max(0, Math.floor(dataWithPeriod.length / 5) - 1)} angle={-20} textAnchor="end" height={35} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} unit="m" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="waveHeight" name="Olas" stroke="hsl(var(--primary))" fill="url(#waveGrad)" strokeWidth={2} dot={dataWithPeriod.length <= 12} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-body mb-2">
          Viento · {isReal ? (source === "stormglass" ? "Stormglass" : "AEMET") : "simulado"}
        </p>
        <div className="bg-card/40 rounded-xl border border-border/20 p-3">
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={dataWithPeriod} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={Math.max(0, Math.floor(dataWithPeriod.length / 5) - 1)} angle={-20} textAnchor="end" height={35} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} unit="" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="windSpeed" name="Viento" fill="url(#windGrad)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-body mb-2">
          Periodo estimado · {isReal ? (source === "stormglass" ? "Stormglass" : "AEMET") : "simulado"}
        </p>
        <div className="bg-card/40 rounded-xl border border-border/20 p-3">
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={dataWithPeriod} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="periodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={Math.max(0, Math.floor(dataWithPeriod.length / 5) - 1)} angle={-20} textAnchor="end" height={35} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} unit="s" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="period" name="Periodo" stroke="hsl(var(--muted-foreground))" fill="url(#periodGrad)" strokeWidth={2} dot={dataWithPeriod.length <= 12} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ForecastCharts;
