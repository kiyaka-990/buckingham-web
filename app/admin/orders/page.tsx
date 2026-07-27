"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { orders as allOrders, statusStyles, type OrderStatus } from "@/lib/data/orders";
import { formatPrice, cn } from "@/lib/utils";

const statuses: (OrderStatus | "all")[] = ["all", "pending", "confirmed", "in-transit", "delivered", "cancelled"];

export default function AdminOrders() {
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [q, setQ] = useState("");

  const orders = allOrders.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (q && !`${o.id} ${o.customer} ${o.email}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Orders</h1>
        <p className="text-muted">Manage and track every reservation.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-4">
          <Search size={16} className="text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search orders…" className="h-10 w-48 bg-transparent text-sm outline-none" />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Filter size={16} className="text-muted" />
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn("shrink-0 rounded-full px-3 py-1.5 text-xs font-medium capitalize transition", filter === s ? "bg-gold-400 text-navy-900" : "border border-border hover:border-gold-400")}
            >
              {s}
            </button>
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
                <th className="hidden p-4 font-medium lg:table-cell">Payment</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-foreground/[0.02]">
                  <td className="p-4 font-medium">{o.id}</td>
                  <td className="p-4 text-muted">{o.date}</td>
                  <td className="p-4">
                    <p className="font-medium">{o.customer}</p>
                    <p className="text-xs text-muted">{o.location}</p>
                  </td>
                  <td className="hidden p-4 text-muted md:table-cell">{o.items[0].name} · {o.items[0].breed}</td>
                  <td className="hidden p-4 text-muted lg:table-cell">{o.payment}</td>
                  <td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[o.status]}`}>{o.status}</span></td>
                  <td className="p-4 text-right font-semibold">{formatPrice(o.total)}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={7} className="p-10 text-center text-muted">No orders match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
