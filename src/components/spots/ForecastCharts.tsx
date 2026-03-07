import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from "recharts";

interface ForecastData {
  hour: string;
  waveHeight: number;
  windSpeed: number;
  period: number;
}

interface ForecastChartsProps {
  spotName: string;
}

function generateForecastData(): ForecastData[] {
  const hours = [];
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const h = new Date(now.getTime() + i * 3600000);
    const baseWave = 1.2 + Math.sin(i / 4) * 0.8 + Math.random() * 0.3;
    const baseWind = 12 + Math.sin(i / 3) * 8 + Math.random() * 5;
    const basePeriod = 8 + Math.sin(i / 5) * 3 + Math.random() * 1;
    hours.push({
      hour: `${h.getHours().toString().padStart(2, "0")}:00`,
      waveHeight: Math.max(0.3, parseFloat(baseWave.toFixed(1))),
      windSpeed: Math.max(3, Math.round(baseWind)),
      period: Math.max(5, Math.round(basePeriod)),
    });
  }
  return hours;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-[10px] text-muted-foreground font-body mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs font-body font-medium" style={{ color: entry.color }}>
          {entry.name}: {entry.value}{entry.name === "Olas" ? "m" : entry.name === "Viento" ? " km/h" : "s"}
        </p>
      ))}
    </div>
  );
};

const ForecastCharts = ({ spotName }: ForecastChartsProps) => {
  const data = generateForecastData();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-body mb-2">
          Previsión oleaje · 24h
        </p>
        <div className="bg-card/40 rounded-xl border border-border/20 p-3">
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(185, 72%, 42%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(185, 72%, 42%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "hsl(210, 10%, 45%)" }} tickLine={false} axisLine={false} interval={5} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(210, 10%, 45%)" }} tickLine={false} axisLine={false} unit="m" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="waveHeight" name="Olas" stroke="hsl(185, 72%, 42%)" fill="url(#waveGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-body mb-2">
          Previsión viento · 24h
        </p>
        <div className="bg-card/40 rounded-xl border border-border/20 p-3">
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(35, 90%, 55%)" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="hsl(35, 90%, 55%)" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "hsl(210, 10%, 45%)" }} tickLine={false} axisLine={false} interval={5} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(210, 10%, 45%)" }} tickLine={false} axisLine={false} unit="" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="windSpeed" name="Viento" fill="url(#windGrad)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-body mb-2">
          Periodo del oleaje · 24h
        </p>
        <div className="bg-card/40 rounded-xl border border-border/20 p-3">
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="periodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(200, 25%, 55%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(200, 25%, 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "hsl(210, 10%, 45%)" }} tickLine={false} axisLine={false} interval={5} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(210, 10%, 45%)" }} tickLine={false} axisLine={false} unit="s" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="period" name="Periodo" stroke="hsl(200, 25%, 55%)" fill="url(#periodGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ForecastCharts;
