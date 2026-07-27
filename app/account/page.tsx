import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, Heart, User, LayoutDashboard, LogOut } from "lucide-react";
import { auth, signOut } from "@/lib/auth";
import { orders, statusStyles } from "@/lib/data/orders";
import { formatPrice } from "@/lib/utils";

export default async function AccountPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = session.user!;
  const myOrders = orders.slice(0, 3); // demo

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-28">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-gold-400/15 text-gold-500">
            <User size={28} />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">{user.name || "My Account"}</h1>
            <p className="text-muted">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {user.role === "admin" && (
            <Link href="/admin" className="flex items-center gap-2 rounded-full bg-navy-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-navy-700">
              <LayoutDashboard size={16} /> Admin
            </Link>
          )}
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
            <button className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:border-gold-400">
              <LogOut size={16} /> Sign out
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Package} label="Orders" value={String(myOrders.length)} />
        <StatCard icon={Heart} label="Wishlist" value="View" href="/account/wishlist" />
        <StatCard icon={User} label="Membership" value="Royal Family" />
      </div>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-xl font-bold">Recent Orders</h2>
        <div className="overflow-hidden rounded-3xl border border-border">
          {myOrders.map((o) => (
            <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface p-4 last:border-0">
              <div>
                <p className="font-semibold">{o.id}</p>
                <p className="text-sm text-muted">{o.items.map((i) => i.name).join(", ")} · {o.date}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusStyles[o.status]}`}>{o.status}</span>
                <span className="font-display font-bold">{formatPrice(o.total)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, href }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: string; href?: string }) {
  const inner = (
    <div className="rounded-3xl border border-border bg-surface p-6 transition hover:border-gold-400">
      <Icon className="mb-3 text-gold-500" />
      <p className="text-sm text-muted">{label}</p>
      <p className="font-display text-xl font-bold">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
