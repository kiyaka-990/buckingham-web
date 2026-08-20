"use client";

import Link from "next/link";
import { Crest } from "@/components/brand/crest";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, ShoppingCart, Boxes, Users, BarChart3, MessageSquare, Settings, LogOut, Home, Search, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Messages", href: "/admin/messages", icon: MessageSquare },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface p-4 lg:flex">
      <Link href="/admin" className="mb-8 flex items-center gap-2.5 px-2 pt-2">
        <Crest className="h-10" />
        <span>
          <span className="block font-display text-sm font-bold leading-tight">Buckingham</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-accent-ink">Admin</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1">
        {nav.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active ? "bg-ochre-400/12 text-accent-ink" : "text-muted hover:bg-foreground/5 hover:text-foreground"
              )}
            >
              <item.icon size={18} /> {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-border pt-3">
        <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition hover:bg-foreground/5">
          <Home size={18} /> View Site
        </Link>
        <button onClick={() => signOut({ callbackUrl: "/" })} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition hover:bg-foreground/5">
          <LogOut size={18} /> Sign out
        </button>
      </div>
    </aside>
  );
}

export function AdminHeader({ name, email }: { name?: string | null; email?: string | null }) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-surface/80 px-5 py-3 backdrop-blur-xl sm:px-8">
      <div className="hidden flex-1 sm:block">
        <div className="flex h-10 max-w-sm items-center gap-2 rounded-full border border-border bg-background px-4">
          <Search size={16} className="text-muted" />
          <input placeholder="Search orders, dogs, customers…" className="h-full flex-1 bg-transparent text-sm outline-none" />
          <kbd className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted">⌘K</kbd>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
        <button className="relative grid h-10 w-10 place-items-center rounded-full border border-border hover:border-ochre-400" aria-label="Notifications">
          <Bell size={17} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-ochre-400" />
        </button>
        <div className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-ochre-400/15 font-display text-sm font-bold text-accent-ink">
            {(name || email || "A").charAt(0).toUpperCase()}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-xs font-semibold leading-tight">{name || "Admin"}</span>
            <span className="block text-[10px] text-muted">Administrator</span>
          </span>
        </div>
      </div>
    </header>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();
  return (
    <div className="sticky top-0 z-40 flex gap-1 overflow-x-auto border-b border-border bg-surface p-2 lg:hidden">
      {nav.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className={cn("flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium", active ? "bg-ochre-400/12 text-accent-ink" : "text-muted")}>
            <item.icon size={14} /> {item.label}
          </Link>
        );
      })}
    </div>
  );
}
