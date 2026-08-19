"use client";

import Image from "next/image";
import { FadeImage } from "@/components/ui/fade-image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";

export default function CartPage() {
  const { items, remove, setQty } = useCart();
  const subtotal = items.reduce((n, i) => n + i.qty * i.price, 0);

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-28">
      <h1 className="font-display text-4xl font-bold">Your Cart</h1>
      <p className="mt-2 text-muted">{items.length} {items.length === 1 ? "companion" : "companions"} selected.</p>

      {items.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-24 text-center">
          <ShoppingBag size={48} className="mb-4 text-muted" />
          <p className="text-muted">Your cart is empty.</p>
          <ButtonLink href="/shop" className="mt-6">Browse Dogs</ButtonLink>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-3xl border border-border bg-surface p-4">
                <FadeImage src={item.image} alt={item.name} width={120} height={140} className="h-32 w-28 rounded-2xl object-cover" />
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link href={`/dogs/${item.slug}`} className="font-display text-lg font-semibold hover:text-brass-500">{item.name}</Link>
                      <p className="text-sm text-muted">{item.breedName}</p>
                    </div>
                    <button onClick={() => remove(item.id)} aria-label="Remove" className="text-muted hover:text-red-500"><Trash2 size={18} /></button>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-border">
                      <button onClick={() => setQty(item.id, item.qty - 1)} className="grid h-9 w-9 place-items-center" aria-label="Decrease"><Minus size={15} /></button>
                      <span className="w-8 text-center">{item.qty}</span>
                      <button onClick={() => setQty(item.id, item.qty + 1)} className="grid h-9 w-9 place-items-center" aria-label="Increase"><Plus size={15} /></button>
                    </div>
                    <span className="font-display text-xl font-bold">{formatPrice(item.price * item.qty)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border bg-surface p-6">
              <h2 className="font-display text-xl font-bold">Order Summary</h2>
              <div className="mt-4 space-y-2 text-sm">
                <Row label="Subtotal" value={formatPrice(subtotal)} />
                <Row label="Delivery" value="Calculated next" muted />
                <div className="my-3 border-t border-border" />
                <Row label="Total" value={formatPrice(subtotal)} bold />
              </div>
              <ButtonLink href="/checkout" size="lg" className="mt-6 w-full">Proceed to Checkout <ArrowRight size={18} /></ButtonLink>
              <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted"><ShieldCheck size={14} className="text-brass-500" /> Secure checkout · Deposit reserves your dog</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={muted ? "text-muted" : ""}>{label}</span>
      <span className={bold ? "font-display text-lg font-bold" : ""}>{value}</span>
    </div>
  );
}
