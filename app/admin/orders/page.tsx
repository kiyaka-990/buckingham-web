import { db } from "@/lib/db";
import { OrdersManager, type AdminOrder } from "@/components/admin/orders-manager";

export const metadata = { title: "Orders · Admin" };

export default async function AdminOrders() {
  const rows = await db.order.findMany({ orderBy: { createdAt: "desc" }, include: { items: true } });
  const orders: AdminOrder[] = rows.map((o) => ({
    id: o.id,
    ref: o.ref,
    customerName: o.customerName,
    email: o.email,
    city: o.city,
    method: o.method,
    status: o.status,
    total: o.total,
    date: o.createdAt.toISOString().slice(0, 10),
    itemLabel: o.items.map((i) => `${i.name} · ${i.breedName}`).join(", ") || "—",
  }));

  return <OrdersManager orders={orders} />;
}
