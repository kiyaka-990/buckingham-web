"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CreditCard, Smartphone, ShieldCheck, Lock, Loader2 } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { formatPrice, usdToKes, cn } from "@/lib/utils";
import { site } from "@/lib/site";

type Method = "card" | "mpesa";

export default function CheckoutPage() {
  const { items, clear } = useCart();
  const router = useRouter();
  const [method, setMethod] = useState<Method>("card");
  const [loading, setLoading] = useState(false);
  const [mpesaRef, setMpesaRef] = useState<string | null>(null);

  const subtotal = items.reduce((n, i) => n + i.qty * i.price, 0);
  const deposit = Math.round(subtotal * 0.3);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, customer: { ...form, method } }),
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url; // Stripe Checkout
        return;
      }
      if (method === "mpesa") {
        setMpesaRef(`${site.payments.mpesaAccountPrefix}-${(data.orderId || "").slice(-6)}`);
        setLoading(false);
        return;
      }
      clear();
      router.push(`/checkout/success?order=${data.orderId}`);
    } catch {
      setLoading(false);
      alert("Something went wrong. Please try again or contact us.");
    }
  };

  if (items.length === 0 && !mpesaRef) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-40 text-center">
        <h1 className="font-display text-3xl font-bold">Your cart is empty</h1>
        <a href="/shop" className="mt-6 inline-block text-gold-500 hover:underline">Browse our dogs →</a>
      </div>
    );
  }

  if (mpesaRef) {
    return (
      <div className="mx-auto max-w-lg px-6 py-32 text-center">
        <div className="rounded-3xl border border-border bg-surface p-8">
          <Smartphone className="mx-auto mb-4 text-emerald-500" size={44} />
          <h1 className="font-display text-2xl font-bold">Complete your M-Pesa payment</h1>
          <p className="mt-2 text-muted">Use the Lipa na M-Pesa details below to pay your deposit.</p>
          <div className="mt-6 space-y-2 rounded-2xl bg-surface-2 p-5 text-left">
            <Line label="Paybill Number" value={site.payments.mpesaPaybill} />
            <Line label="Account Number" value={mpesaRef} />
            <Line label="Deposit (30%)" value={`KES ${usdToKes(deposit).toLocaleString()}`} />
            <Line label="Balance on delivery" value={`KES ${usdToKes(subtotal - deposit).toLocaleString()}`} />
          </div>
          <p className="mt-4 text-xs text-muted">
            Paybill activates soon. Send your M-Pesa confirmation to WhatsApp {site.contact.phoneDisplay} and we&apos;ll confirm your reservation.
          </p>
          <button onClick={() => { clear(); router.push("/"); }} className="btn-gold mt-6 h-12 w-full rounded-full">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-28">
      <h1 className="font-display text-4xl font-bold">Checkout</h1>

      <form onSubmit={submit} className="mt-10 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          {/* Delivery */}
          <section className="rounded-3xl border border-border bg-surface p-6">
            <h2 className="font-display text-xl font-bold">Delivery Details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input name="firstName" label="First name" required />
              <Input name="lastName" label="Last name" required />
              <Input name="email" label="Email" type="email" required />
              <Input name="phone" label="Phone" required />
              <Input name="city" label="City / Town" required />
              <Input name="county" label="County / Region" required />
              <div className="sm:col-span-2">
                <Input name="address" label="Delivery address" required />
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-3xl border border-border bg-surface p-6">
            <h2 className="font-display text-xl font-bold">Payment Method</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <MethodCard active={method === "card"} onClick={() => setMethod("card")} icon={<CreditCard />} title="Card (Stripe)" desc="Visa, Mastercard, Amex" />
              <MethodCard active={method === "mpesa"} onClick={() => setMethod("mpesa")} icon={<Smartphone />} title="M-Pesa" desc="Lipa na M-Pesa Paybill" />
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted">
              <Lock size={14} className="text-gold-500" />
              {method === "card"
                ? "You'll be redirected to Stripe's secure checkout (test mode until keys are added)."
                : "M-Pesa Paybill instructions will appear after you place the order."}
            </p>
          </section>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-border bg-surface p-6">
            <h2 className="font-display text-xl font-bold">Your Order</h2>
            <div className="mt-4 space-y-3">
              {items.map((i) => (
                <div key={i.id} className="flex items-center gap-3">
                  <Image src={i.image} alt={i.name} width={48} height={48} className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{i.name}</p>
                    <p className="text-xs text-muted">{i.breedName} × {i.qty}</p>
                  </div>
                  <span className="text-sm font-semibold">{formatPrice(i.price * i.qty)}</span>
                </div>
              ))}
            </div>
            <div className="my-4 border-t border-border" />
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Deposit today (30%)</span><span className="font-semibold text-gold-500">{formatPrice(deposit)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Balance on delivery</span><span>{formatPrice(subtotal - deposit)}</span></div>
            </div>
            <button disabled={loading} className="btn-gold mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full text-base">
              {loading ? <><Loader2 className="animate-spin" size={18} /> Processing…</> : <>Pay {formatPrice(deposit)} Deposit</>}
            </button>
            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted"><ShieldCheck size={14} className="text-gold-500" /> Secure &amp; encrypted checkout</p>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Input({ name, label, type = "text", required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <input name={name} type={type} required={required} className="h-12 w-full rounded-xl border border-border bg-background px-4 outline-none focus:border-gold-400" />
    </div>
  );
}

function MethodCard({ active, onClick, icon, title, desc }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <button type="button" onClick={onClick} className={cn("flex items-center gap-3 rounded-2xl border p-4 text-left transition", active ? "border-gold-400 bg-gold-400/10" : "border-border hover:border-gold-400")}>
      <span className={cn("grid h-11 w-11 place-items-center rounded-xl", active ? "bg-gold-400 text-navy-900" : "bg-surface-2 text-gold-500")}>{icon}</span>
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="text-xs text-muted">{desc}</span>
      </span>
    </button>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted">{label}</span>
      <span className="font-display font-bold">{value}</span>
    </div>
  );
}
