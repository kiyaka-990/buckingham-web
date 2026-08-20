import { Mail, MapPin } from "lucide-react";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Customers · Admin" };

type Customer = { name: string; email: string; location: string; orders: number; spent: number };

export default async function AdminCustomers() {
  const orders = await db.order.findMany();
  const map = new Map<string, Customer>();
  for (const o of orders) {
    const c = map.get(o.email) ?? { name: o.customerName, email: o.email, location: o.city ?? "—", orders: 0, spent: 0 };
    c.orders += 1;
    if (o.status !== "cancelled") c.spent += o.total;
    map.set(o.email, c);
  }
  const customers = [...map.values()].sort((a, b) => b.spent - a.spent);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Customers</h1>
        <p className="text-muted">{customers.length} customers in the Buckingham family.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {customers.map((c) => (
          <div key={c.email} className="rounded-3xl border border-border bg-surface p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-sun-400/15 font-display text-lg font-bold text-accent-ink">{c.name.charAt(0)}</div>
              <div className="min-w-0">
                <p className="font-semibold">{c.name}</p>
                <p className="flex items-center gap-1 truncate text-xs text-muted"><Mail size={11} /> {c.email}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-muted"><MapPin size={13} className="text-accent-ink" /> {c.location}</span>
              <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs">{c.orders} order{c.orders > 1 ? "s" : ""}</span>
            </div>
            <div className="mt-3 border-t border-border pt-3">
              <p className="text-xs text-muted">Lifetime value</p>
              <p className="font-display text-xl font-bold text-accent-ink">{formatPrice(c.spent)}</p>
            </div>
          </div>
        ))}
        {customers.length === 0 && <p className="text-muted">No customers yet.</p>}
      </div>
    </div>
  );
}
