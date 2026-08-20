"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, Loader2 } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { updateOrderStatus } from "@/lib/actions/admin";

export type AdminOrder = {
  id: string; ref: string; customerName: string; email: string; city: string | null;
  method: string; status: string; total: number; date: string;
  itemLabel: string;
};

const STATUSES = ["pending", "confirmed", "in-transit", "delivered", "cancelled"];
const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  confirmed: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  "in-transit": "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  delivered: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  cancelled: "bg-red-500/15 text-red-600 dark:text-red-400",
};

export function OrdersManager({ orders }: { orders: AdminOrder[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, start] = useTransition();

  const filtered = orders.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (q && !`${o.ref} ${o.customerName} ${o.email}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const changeStatus = (id: string, status: string) => {
    setPendingId(id);
    start(async () => { await updateOrderStatus(id, status); setPendingId(null); router.refresh(); });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Orders</h1>
        <p className="text-muted">{orders.length} orders · update status inline (saved to the database).</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-4">
          <Search size={16} className="text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search orders…" className="h-10 w-48 bg-transparent text-sm outline-none" />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Filter size={16} className="text-muted" />
          {["all", ...STATUSES].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={cn("shrink-0 rounded-full px-3 py-1.5 text-xs font-medium capitalize transition", filter === s ? "bg-sun-400 text-leaf-900" : "border border-border hover:border-sun-400")}>{s}</button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2/50 text-left text-muted">
                <th className="p-4 font-medium">Order</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="hidden p-4 font-medium md:table-cell">Dog</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-foreground/[0.02]">
                  <td className="p-4 font-medium">{o.ref}</td>
                  <td className="p-4 text-muted">{o.date}</td>
                  <td className="p-4"><p className="font-medium">{o.customerName}</p><p className="text-xs text-muted">{o.city}</p></td>
                  <td className="hidden p-4 text-muted md:table-cell">{o.itemLabel}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium capitalize", statusStyles[o.status])}>{o.status}</span>
                      <select
                        value={o.status}
                        onChange={(e) => changeStatus(o.id, e.target.value)}
                        disabled={pendingId === o.id}
                        className="rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:border-sun-400"
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {pendingId === o.id && <Loader2 size={14} className="animate-spin text-accent-ink" />}
                    </div>
                  </td>
                  <td className="p-4 text-right font-semibold">{formatPrice(o.total)}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted">No orders match.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
