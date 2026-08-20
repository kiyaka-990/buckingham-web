import Link from "next/link";
import { FadeImage } from "@/components/ui/fade-image";
import { DollarSign, ShoppingCart, Users, TrendingUp, TrendingDown, ArrowUpRight, Target, Package, MessageSquare, Star, AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { getDogs } from "@/lib/queries";
import { statusStyles, type OrderStatus } from "@/lib/data/orders";
import { revenueSeries, activity } from "@/lib/data/admin";
import { formatPrice } from "@/lib/utils";
import { DonutChart, Sparkline, AreaChart, ProgressBar } from "@/components/admin/charts";

const activityIcon = { order: ShoppingCart, message: MessageSquare, stock: Package, review: Star };

export default async function AdminDashboard() {
  const [orderRows, dogs, customerGroups] = await Promise.all([
    db.order.findMany({ orderBy: { createdAt: "desc" }, include: { items: true } }),
    getDogs(),
    db.order.groupBy({ by: ["email"] }),
  ]);

  const revenue = orderRows.filter((o) => o.status !== "cancelled").reduce((n, o) => n + o.total, 0);
  const paidCount = orderRows.filter((o) => o.status !== "cancelled").length || 1;
  const aov = Math.round(revenue / paidCount);
  const pending = orderRows.filter((o) => o.status === "pending" || o.status === "confirmed").length;
  const target = 40000;

  const kpis = [
    { label: "Total Revenue", value: formatPrice(revenue), icon: DollarSign, delta: "+18.2%", up: true, spark: revenueSeries.data },
    { label: "Orders", value: String(orderRows.length), icon: ShoppingCart, delta: "+12.5%", up: true, spark: [4, 6, 5, 8, 7, 9, 8] },
    { label: "Avg Order Value", value: formatPrice(aov), icon: Target, delta: "+4.1%", up: true, spark: [3200, 3400, 3300, 3800, 4100, 3900, 4200] },
    { label: "Customers", value: String(customerGroups.length), icon: Users, delta: "+8.1%", up: true, spark: [8, 7, 9, 6, 8, 9, 10] },
  ];

  const statusColors: Record<string, string> = { pending: "#d9ad3a", confirmed: "#4d68bd", "in-transit": "#7d95d6", delivered: "#2fb380", cancelled: "#e05561" };
  const donut = (["pending", "confirmed", "in-transit", "delivered", "cancelled"] as OrderStatus[])
    .map((s) => ({ label: s, value: orderRows.filter((o) => o.status === s).length, color: statusColors[s] }))
    .filter((s) => s.value > 0);

  const topDogs = dogs.filter((d) => d.bestseller).slice(0, 5);
  const lowStock = dogs.filter((d) => d.status === "available" && d.stock <= 1).slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="text-muted">Welcome back — live data from your database.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-500/15 px-4 py-2 text-sm font-medium text-amber-600 dark:text-amber-400">{pending} orders need attention</span>
          <Link href="/admin/orders" className="btn-clay rounded-full px-4 py-2 text-sm">View orders</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="gradient-border rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-ochre-400/12 text-accent-ink"><k.icon size={20} /></div>
              <span className={`flex items-center gap-1 text-xs font-medium ${k.up ? "text-emerald-500" : "text-red-500"}`}>
                {k.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />} {k.delta}
              </span>
            </div>
            <p className="mt-4 font-display text-2xl font-bold">{k.value}</p>
            <div className="mt-1 flex items-end justify-between">
              <p className="text-sm text-muted">{k.label}</p>
              <Sparkline data={k.spark} width={80} height={28} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-border bg-gradient-surface p-6 xl:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <div><h2 className="font-display text-lg font-bold">Revenue Overview</h2><p className="text-sm text-muted">Last 7 months</p></div>
            <span className="rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-medium text-emerald-500">+22% YoY</span>
          </div>
          <AreaChart data={revenueSeries.data} labels={revenueSeries.labels} />
        </div>
        <div className="rounded-3xl border border-border bg-surface p-6">
          <h2 className="mb-5 font-display text-lg font-bold">Order Status</h2>
          {donut.length > 0 ? <DonutChart segments={donut} centerValue={String(orderRows.length)} centerLabel="orders" /> : <p className="text-muted">No orders yet.</p>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-border bg-royal p-6 text-white">
          <h2 className="font-display text-lg font-bold">Monthly Target</h2>
          <p className="mt-1 text-sm text-white/70">Revenue goal</p>
          <p className="mt-5 font-display text-3xl font-bold text-gradient-ochre">{formatPrice(revenue)}</p>
          <p className="text-sm text-white/60">of {formatPrice(target)}</p>
          <div className="mt-4"><ProgressBar value={revenue} max={target} /></div>
          <p className="mt-2 text-xs text-white/70">{Math.round((revenue / target) * 100)}% achieved · {formatPrice(Math.max(0, target - revenue))} to go</p>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Top Performers</h2>
            <Link href="/admin/inventory" className="text-xs font-medium text-accent-ink hover:underline">All</Link>
          </div>
          <div className="space-y-3">
            {topDogs.map((d, i) => (
              <div key={d.id} className="flex items-center gap-3">
                <span className="w-4 text-sm font-bold text-muted">{i + 1}</span>
                <FadeImage src={d.images[0]} alt={d.name} width={36} height={36} className="h-9 w-9 rounded-lg object-cover" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{d.name}</p><p className="truncate text-xs text-muted">{d.breedName}</p></div>
                <span className="text-sm font-semibold text-accent-ink">{formatPrice(d.price)}</span>
              </div>
            ))}
            {topDogs.length === 0 && <p className="text-sm text-muted">No bestsellers flagged.</p>}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Recent Activity</h2>
          <ul className="space-y-4">
            {activity.slice(0, 5).map((a, i) => {
              const Icon = activityIcon[a.kind];
              return (
                <li key={i} className="flex gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-2 text-accent-ink"><Icon size={14} /></span>
                  <div><p className="text-sm"><span className="font-medium">{a.who}</span> <span className="text-muted">{a.action}</span></p><p className="text-xs text-muted">{a.time}</p></div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold"><AlertTriangle size={18} className="text-amber-500" /> Low Stock Alerts</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {lowStock.map((d) => (
              <Link key={d.id} href={`/dogs/${d.slug}`} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 hover:border-ochre-400">
                <FadeImage src={d.images[0]} alt={d.name} width={40} height={40} className="h-10 w-10 rounded-lg object-cover" />
                <div><p className="text-sm font-medium">{d.name}</p><p className="text-xs text-amber-600 dark:text-amber-400">Only {d.stock} left</p></div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Recent Orders</h2>
          <Link href="/admin/orders" className="flex items-center gap-1 text-sm font-medium text-accent-ink hover:underline">View all <ArrowUpRight size={14} /></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="pb-3 font-medium">Order</th><th className="pb-3 font-medium">Customer</th>
                <th className="hidden pb-3 font-medium sm:table-cell">Dog</th><th className="pb-3 font-medium">Status</th>
                <th className="pb-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {orderRows.slice(0, 6).map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0">
                  <td className="py-3 font-medium">{o.ref}</td>
                  <td className="py-3">{o.customerName}</td>
                  <td className="hidden py-3 text-muted sm:table-cell">{o.items[0] ? `${o.items[0].name} · ${o.items[0].breedName}` : "—"}</td>
                  <td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[o.status as OrderStatus] ?? ""}`}>{o.status}</span></td>
                  <td className="py-3 text-right font-semibold">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
