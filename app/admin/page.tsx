import Link from "next/link";
import { DollarSign, ShoppingCart, Dog, Users, TrendingUp, ArrowUpRight } from "lucide-react";
import { orders, statusStyles } from "@/lib/data/orders";
import { dogs, availableCount } from "@/lib/data/catalog";
import { breeds } from "@/lib/data/breeds";
import { formatPrice } from "@/lib/utils";

export default function AdminDashboard() {
  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((n, o) => n + o.total, 0);
  const customers = new Set(orders.map((o) => o.email)).size;
  const pending = orders.filter((o) => o.status === "pending" || o.status === "confirmed").length;

  const kpis = [
    { label: "Total Revenue", value: formatPrice(revenue), icon: DollarSign, delta: "+18.2%" },
    { label: "Orders", value: String(orders.length), icon: ShoppingCart, delta: "+12.5%" },
    { label: "Dogs Available", value: String(availableCount), icon: Dog, delta: `${dogs.length} total` },
    { label: "Customers", value: String(customers), icon: Users, delta: "+8.1%" },
  ];

  // Revenue by month (mock)
  const monthly = [
    { m: "Feb", v: 12400 }, { m: "Mar", v: 18900 }, { m: "Apr", v: 15600 },
    { m: "May", v: 24300 }, { m: "Jun", v: 28700 }, { m: "Jul", v: revenue },
  ];
  const maxV = Math.max(...monthly.map((x) => x.v));

  // Top breeds by inventory
  const breedCounts = breeds
    .map((b) => ({ name: b.name, count: dogs.filter((d) => d.breedSlug === b.slug).length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const maxBreed = Math.max(...breedCounts.map((b) => b.count));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="text-muted">Welcome back — here&apos;s what&apos;s happening at the kennel.</p>
        </div>
        <span className="rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
          {pending} orders need attention
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-3xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gold-400/12 text-gold-500">
                <k.icon size={20} />
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-500"><TrendingUp size={13} /> {k.delta}</span>
            </div>
            <p className="mt-4 font-display text-2xl font-bold">{k.value}</p>
            <p className="text-sm text-muted">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Revenue chart */}
        <div className="rounded-3xl border border-border bg-surface p-6 xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Revenue Overview</h2>
            <span className="text-sm text-muted">Last 6 months</span>
          </div>
          <div className="flex h-56 items-end gap-3">
            {monthly.map((m) => (
              <div key={m.m} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-gold-600 to-gold-300 transition-all hover:from-gold-500 hover:to-gold-200"
                    style={{ height: `${(m.v / maxV) * 100}%` }}
                    title={formatPrice(m.v)}
                  />
                </div>
                <span className="text-xs text-muted">{m.m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top breeds */}
        <div className="rounded-3xl border border-border bg-surface p-6">
          <h2 className="mb-6 font-display text-lg font-bold">Inventory by Breed</h2>
          <div className="space-y-4">
            {breedCounts.map((b) => (
              <div key={b.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{b.name}</span>
                  <span className="text-muted">{b.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-navy-600 dark:bg-navy-400" style={{ width: `${(b.count / maxBreed) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-3xl border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Recent Orders</h2>
          <Link href="/admin/orders" className="flex items-center gap-1 text-sm font-medium text-gold-500 hover:underline">
            View all <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="pb-3 font-medium">Order</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="hidden pb-3 font-medium sm:table-cell">Dog</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 6).map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0">
                  <td className="py-3 font-medium">{o.id}</td>
                  <td className="py-3">{o.customer}</td>
                  <td className="hidden py-3 text-muted sm:table-cell">{o.items[0].name} · {o.items[0].breed}</td>
                  <td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[o.status]}`}>{o.status}</span></td>
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
