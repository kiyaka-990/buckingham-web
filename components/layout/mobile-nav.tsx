"use client";

import Link from "next/link";
import Image from "next/image";
import { X, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { mainNav, site } from "@/lib/site";
import { useUI } from "@/lib/store/ui";
import { ButtonLink } from "@/components/ui/button";

export function MobileNav() {
  const { mobileNavOpen, setMobileNav } = useUI();
  const close = () => setMobileNav(false);

  return (
    <AnimatePresence>
      {mobileNavOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[70] bg-navy-950/60 backdrop-blur-sm lg:hidden"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 z-[71] flex h-full w-[85%] max-w-sm flex-col bg-surface shadow-soft lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <Link href="/" onClick={close} className="flex items-center gap-2">
                <Image src="/brand/logo.png" alt={site.name} width={40} height={40} className="h-10 w-10 rounded-full" />
                <span className="font-display font-bold">Buckingham</span>
              </Link>
              <button onClick={close} aria-label="Close menu" className="grid h-9 w-9 place-items-center rounded-full hover:bg-foreground/5">
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-1">
                {mainNav.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                  >
                    <Link
                      href={item.href}
                      onClick={close}
                      className="block rounded-xl px-4 py-3 font-display text-lg transition hover:bg-foreground/5 hover:text-gold-500"
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>

            <div className="space-y-3 border-t border-border p-5">
              <ButtonLink href="/login" onClick={close} variant="outline" className="w-full">Sign in</ButtonLink>
              <a href={`tel:${site.contact.phone}`} className="flex items-center justify-center gap-2 text-sm text-muted">
                <Phone size={14} /> {site.contact.phoneDisplay}
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
