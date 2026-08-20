"use client";

import { FadeImage } from "@/components/ui/fade-image";
import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";

export function CartDrawer() {
  const { items, isOpen, close, remove, setQty } = useCart();
  const subtotal = items.reduce((n, i) => n + i.qty * i.price, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[60] bg-leaf-950/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-[61] flex h-full w-full max-w-md flex-col bg-surface shadow-soft"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                <ShoppingBag size={18} className="text-accent-ink" /> Your Kennel Cart
              </h2>
              <button onClick={close} aria-label="Close cart" className="grid h-9 w-9 place-items-center rounded-full hover:bg-foreground/5">
                <X size={18} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="grid h-20 w-20 place-items-center rounded-full bg-surface-2">
                  <ShoppingBag size={30} className="text-muted" />
                </div>
                <p className="text-muted">Your cart is empty.</p>
                <ButtonLink href="/shop" onClick={close}>Browse Dogs</ButtonLink>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 rounded-2xl border border-border p-3">
                      <FadeImage src={item.image} alt={item.name} width={80} height={96} className="h-24 w-20 rounded-xl object-cover" />
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link href={`/dogs/${item.slug}`} onClick={close} className="font-semibold leading-tight hover:text-accent-ink">
                              {item.name}
                            </Link>
                            <p className="text-xs text-muted">{item.breedName}</p>
                          </div>
                          <button onClick={() => remove(item.id)} aria-label="Remove" className="text-muted hover:text-red-500">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center rounded-full border border-border">
                            <button onClick={() => setQty(item.id, item.qty - 1)} className="grid h-7 w-7 place-items-center" aria-label="Decrease">
                              <Minus size={13} />
                            </button>
                            <span className="w-6 text-center text-sm">{item.qty}</span>
                            <button onClick={() => setQty(item.id, item.qty + 1)} className="grid h-7 w-7 place-items-center" aria-label="Increase">
                              <Plus size={13} />
                            </button>
                          </div>
                          <span className="font-display font-bold">{formatPrice(item.price * item.qty)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t border-border p-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Subtotal</span>
                    <span className="font-display text-xl font-bold">{formatPrice(subtotal)}</span>
                  </div>
                  <p className="text-xs text-muted">Shipping &amp; delivery calculated at checkout. A deposit reserves your dog.</p>
                  <ButtonLink href="/checkout" onClick={close} className="w-full" size="lg">
                    Checkout <ArrowRight size={18} />
                  </ButtonLink>
                  <button onClick={close} className="w-full text-center text-sm text-muted hover:text-foreground">
                    Continue browsing
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
