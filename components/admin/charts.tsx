import { cn } from "@/lib/utils";

/* ---------------- Donut ---------------- */
export function DonutChart({
  segments,
  size = 176,
  thickness = 22,
  centerLabel,
  centerValue,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = segments.reduce((n, s) => n + s.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={thickness} />
        {segments.map((s, i) => {
          const len = (s.value / total) * c;
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
            />
          );
          offset += len;
          return el;
        })}
        {(centerValue || centerLabel) && (
          <g className="rotate-90" style={{ transformOrigin: "center" }}>
            {centerValue && <text x="50%" y="47%" textAnchor="middle" className="fill-foreground font-display text-xl font-bold">{centerValue}</text>}
            {centerLabel && <text x="50%" y="60%" textAnchor="middle" className="fill-muted text-[10px]">{centerLabel}</text>}
          </g>
        )}
      </svg>
      <ul className="space-y-2 text-sm">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            <span className="text-muted">{s.label}</span>
            <span className="ml-auto font-semibold">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Sparkline ---------------- */
export function Sparkline({ data, color = "var(--color-ochre-400)", width = 120, height = 36 }: { data: number[]; color?: string; width?: number; height?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data.map((d, i) => `${i * step},${height - ((d - min) / range) * (height - 4) - 2}`);
  const line = pts.join(" ");
  const area = `${line} ${width},${height} 0,${height}`;
  const id = "spark-" + Math.random().toString(36).slice(2, 7);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${id})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------------- Area / line chart ---------------- */
export function AreaChart({ data, labels, height = 240 }: { data: number[]; labels: string[]; height?: number }) {
  const width = 640;
  const pad = 8;
  const max = Math.max(...data) * 1.1;
  const step = (width - pad * 2) / (data.length - 1);
  const y = (v: number) => height - 24 - (v / max) * (height - 48);
  const pts = data.map((d, i) => `${pad + i * step},${y(d)}`);
  const line = pts.join(" ");
  const area = `${pad},${height - 24} ${line} ${pad + (data.length - 1) * step},${height - 24}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      <defs>
        <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-ochre-400)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--color-ochre-400)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={pad} x2={width - pad} y1={y(max * f)} y2={y(max * f)} stroke="var(--surface-2)" strokeWidth="1" />
      ))}
      <polygon points={area} fill="url(#area-grad)" />
      <polyline points={line} fill="none" stroke="var(--color-ochre-400)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <circle key={i} cx={pad + i * step} cy={y(d)} r="3.5" fill="var(--surface)" stroke="var(--color-ochre-400)" strokeWidth="2" />
      ))}
      {labels.map((l, i) => (
        <text key={l} x={pad + i * step} y={height - 6} textAnchor="middle" className="fill-muted text-[10px]">{l}</text>
      ))}
    </svg>
  );
}

/* ---------------- Progress bar ---------------- */
export function ProgressBar({ value, max, className }: { value: number; max: number; className?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className={cn("h-2.5 overflow-hidden rounded-full bg-surface-2", className)}>
      <div className="h-full rounded-full bg-gradient-to-r from-ochre-500 to-ochre-300" style={{ width: `${pct}%` }} />
    </div>
  );
}
