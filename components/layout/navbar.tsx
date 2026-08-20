"use client";

import { useEffect, useState } from "react";
import { Crest } from "@/components/brand/crest";
import { FadeImage } from "@/components/ui/fade-image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  Search,
  ShoppingBag,
  Heart,
  Sun,
  Moon,
  Accessibility,
  Phone,
  User,
  LayoutDashboard,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { mainNav, site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/store/cart";
import { useWishlist } from "@/lib/store/wishlist";
import { useUI } from "@/lib/store/ui";
import { usePreferences } from "@/lib/store/preferences";
import { breeds } from "@/lib/data/breeds";
import { RotatingText } from "@/components/ui/rotating-text";

const announcements = [
  "Champion bloodlines · Health guaranteed · Global delivery",
  "New litters arriving — reserve your puppy today",
  "Health-guaranteed up to 36 months on every dog",
  "Free breed consultation — chat with us on WhatsApp",
  "Elite trained protection dogs now available",
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [breedsOpen, setBreedsOpen] = useState(false);
  const { data: session } = useSession();
  const [acctOpen, setAcctOpen] = useState(false);

  const cartCount = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const openCart = useCart((s) => s.open);
  const wishCount = useWishlist((s) => s.ids.length);
  const { setA11y, setMobileNav, setSearch } = useUI();
  const { theme, toggleTheme } = usePreferences();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape closes the account menu; on touch there is no mouse-leave to do it.
  useEffect(() => {
    if (!acctOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAcctOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [acctOpen]);

  const isAdmin = session?.user?.role === "admin";

  return (
    <>
      {/* Announcement bar */}
      <div className="hidden bg-leaf-900 text-leaf-50 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-1.5 text-xs">
          <p className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sun-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sun-400" />
            </span>
            <RotatingText words={announcements} interval={3500} className="h-4 text-leaf-50" />
          </p>
          <div className="flex items-center gap-4">
            <a href={`tel:${site.contact.phone}`} className="flex items-center gap-1.5 hover:text-sun-400 transition">
              <Phone size={12} /> {site.contact.phoneDisplay}
            </a>
            <a
              href={`https://wa.me/${site.contact.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sun-400 transition"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-500",
          scrolled ? "glass-strong shadow-soft" : "bg-transparent"
        )}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <Crest className="h-11" title={site.name} />
            <span className="hidden leading-none sm:block">
              <span className="block font-display text-base font-bold tracking-tight">Buckingham</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.3em] text-accent-ink">
                Kennel Ltd
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden items-center gap-1 lg:flex">
            {mainNav.map((item) =>
              item.label === "Breeds" ? (
                <li
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => setBreedsOpen(true)}
                  onMouseLeave={() => setBreedsOpen(false)}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition-colors hover:text-accent-ink",
                      pathname.startsWith("/breeds") && "text-accent-ink"
                    )}
                  >
                    {item.label}
                    <ChevronDown size={14} className={cn("transition-transform", breedsOpen && "rotate-180")} />
                  </Link>
                  <AnimatePresence>
                    {breedsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-1/2 top-full w-[560px] -translate-x-1/2 pt-3"
                      >
                        <div className="grid grid-cols-2 gap-1 rounded-2xl glass-strong p-3 shadow-soft">
                          {breeds.map((b) => (
                            <Link
                              key={b.slug}
                              href={`/breeds/${b.slug}`}
                              className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-foreground/5"
                            >
                              <FadeImage
                                src={b.heroImage}
                                alt={b.name}
                                width={48}
                                height={48}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                              <span>
                                <span className="block text-sm font-semibold">{b.name}</span>
                                <span className="block text-xs text-muted">{b.group}</span>
                              </span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              ) : (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "rounded-full px-3 py-2 text-sm font-medium transition-colors hover:text-accent-ink",
                      pathname === item.href && "text-accent-ink"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            )}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-0.5">
            <IconBtn label="Search" onClick={() => setSearch(true)}>
              <Search size={18} />
            </IconBtn>
            <IconBtn label="Accessibility settings" onClick={() => setA11y(true)}>
              <Accessibility size={18} />
            </IconBtn>
            <IconBtn label="Toggle theme" onClick={toggleTheme}>
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </IconBtn>
            <Link
              href="/account/wishlist"
              aria-label="Wishlist"
              title="Wishlist"
              className="relative hidden h-10 w-10 place-items-center rounded-full transition hover:bg-foreground/5 sm:grid"
            >
              <Heart size={18} />
              {wishCount > 0 && <Badge>{wishCount}</Badge>}
            </Link>

            {/* Account */}
            <div className="relative hidden sm:block" onMouseEnter={() => setAcctOpen(true)} onMouseLeave={() => setAcctOpen(false)}>
              <IconBtn
                label="Account"
                expanded={acctOpen}
                onClick={() => setAcctOpen((o) => !o)}
              >
                <User size={18} />
              </IconBtn>
              <AnimatePresence>
                {acctOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 top-full w-56 pt-2"
                    onClick={() => setAcctOpen(false)}
                  >
                    <div className="rounded-2xl glass-strong p-2 shadow-soft">
                      {session ? (
                        <>
                          <p className="px-3 py-2 text-xs text-muted">
                            Signed in as
                            <span className="block truncate font-semibold text-foreground">{session.user?.email}</span>
                          </p>
                          <MenuLink href="/account" icon={<User size={15} />}>My Account</MenuLink>
                          {isAdmin && (
                            <MenuLink href="/admin" icon={<LayoutDashboard size={15} />}>Admin Dashboard</MenuLink>
                          )}
                          <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-left transition hover:bg-foreground/5"
                          >
                            <LogOut size={15} /> Sign out
                          </button>
                        </>
                      ) : (
                        <>
                          <MenuLink href="/login" icon={<User size={15} />}>Sign in</MenuLink>
                          <MenuLink href="/register" icon={<Heart size={15} />}>Create account</MenuLink>
                          <MenuLink href="/admin" icon={<LayoutDashboard size={15} />}>Admin</MenuLink>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <IconBtn label="Cart" onClick={openCart}>
              <ShoppingBag size={18} />
              {cartCount > 0 && <Badge>{cartCount}</Badge>}
            </IconBtn>

            <button
              onClick={() => setMobileNav(true)}
              aria-label="Open menu"
              className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-foreground/5 lg:hidden"
            >
              <Menu size={20} />
            </button>
          </div>
        </nav>
      </header>
    </>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  expanded,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  expanded?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-expanded={expanded}
      title={label}
      className="relative grid h-10 w-10 place-items-center rounded-full transition hover:bg-foreground/5"
    >
      {children}
    </button>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-sun-400 px-1 text-[10px] font-bold text-leaf-900">
      {children}
    </span>
  );
}

function MenuLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition hover:bg-foreground/5">
      {icon} {children}
    </Link>
  );
}
