"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, ShoppingCart, Boxes, Users, Dog, Settings, LogOut, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

const nav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Breeds", href: "/breeds", icon: Dog },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface p-4 lg:flex">
      <Link href="/admin" className="mb-8 flex items-center gap-2.5 px-2 pt-2">
        <Image src="/brand/logo.png" alt={site.name} width={40} height={40} className="h-10 w-10 rounded-full ring-1 ring-gold-400/40" />
        <span>
          <span className="block font-display text-sm font-bold leading-tight">Buckingham</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-gold-500">Admin</span>
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
                active ? "bg-gold-400/12 text-gold-600 dark:text-gold-400" : "text-muted hover:bg-foreground/5 hover:text-foreground"
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

export function AdminMobileNav() {
  const pathname = usePathname();
  return (
    <div className="sticky top-0 z-40 flex gap-1 overflow-x-auto border-b border-border bg-surface p-2 lg:hidden">
      {nav.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className={cn("flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium", active ? "bg-gold-400/12 text-gold-500" : "text-muted")}>
            <item.icon size={14} /> {item.label}
          </Link>
        );
      })}
    </div>
  );
}
