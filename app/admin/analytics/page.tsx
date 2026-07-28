import { TrendingUp, Eye, MousePointerClick, ShoppingBag, Percent } from "lucide-react";
import { revenueSeries, trafficSources, funnel, salesByCategory, geoSales } from "@/lib/data/admin";
import { DonutChart, AreaChart, ProgressBar } from "@/components/admin/charts";

export const metadata = { title: "Analytics · Admin" };

export default function AnalyticsPage() {
  const maxFunnel = funnel[0].value;
  const conv = ((funnel[funnel.length - 1].value / funnel[0].value) * 100).toFixed(1);
  const maxGeo = Math.max(...geoSales.map((g) => g.value));

  const overview = [
    { label: "Page Views", value: "48.2k", icon: Eye, delta: "+14%" },
    { label: "Click Rate", value: "6.8%", icon: MousePointerClick, delta: "+2.1%" },
    { label: "Conversion", value: `${conv}%`, icon: Percent, delta: "+0.4%" },
    { label: "Sales", value: String(funnel[funnel.length - 1].value), icon: ShoppingBag, delta: "+18%" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Analytics</h1>
        <p className="text-muted">Traffic, conversion and sales insights.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {overview.map((o) => (
          <div key={o.label} className="rounded-3xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <o.icon className="text-gold-500" size={20} />
              <span className="flex items-center gap-1 text-xs text-emerald-500"><TrendingUp size={12} /> {o.delta}</span>
            </div>
            <p className="mt-3 font-display text-2xl font-bold">{o.value}</p>
            <p className="text-sm text-muted">{o.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-border bg-gradient-surface p-6">
        <h2 className="mb-4 font-display text-lg font-bold">Revenue Trend</h2>
        <AreaChart data={revenueSeries.data} labels={revenueSeries.labels} height={260} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-surface p-6">
          <h2 className="mb-5 font-display text-lg font-bold">Traffic Sources</h2>
          <DonutChart segments={trafficSources} centerValue="48k" centerLabel="visits" />
        </div>
        <div className="rounded-3xl border border-border bg-surface p-6">
          <h2 className="mb-5 font-display text-lg font-bold">Sales by Category</h2>
          <DonutChart segments={salesByCategory} centerValue="312" centerLabel="sales" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Funnel */}
        <div className="rounded-3xl border border-border bg-surface p-6">
          <h2 className="mb-5 font-display text-lg font-bold">Conversion Funnel</h2>
          <div className="space-y-3">
            {funnel.map((f) => (
              <div key={f.stage}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{f.stage}</span>
                  <span className="text-muted">{f.value.toLocaleString()}</span>
                </div>
                <div className="h-7 overflow-hidden rounded-lg bg-surface-2">
                  <div className="flex h-full items-center justify-end rounded-lg bg-gradient-to-r from-navy-600 to-gold-400 px-2 text-[11px] font-medium text-white" style={{ width: `${(f.value / maxFunnel) * 100}%` }}>
                    {((f.value / maxFunnel) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geo */}
        <div className="rounded-3xl border border-border bg-surface p-6">
          <h2 className="mb-5 font-display text-lg font-bold">Sales by Region</h2>
          <div className="space-y-4">
            {geoSales.map((g) => (
              <div key={g.region}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{g.region}</span>
                  <span className="text-muted">{g.value}%</span>
                </div>
                <ProgressBar value={g.value} max={maxGeo} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
