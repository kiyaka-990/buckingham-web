"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CreditCard, Smartphone, ShieldCheck, Lock, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { formatPrice, usdToKes, cn } from "@/lib/utils";
import { site } from "@/lib/site";

type Method = "card" | "mpesa";
type Stk = "idle" | "sent" | "success" | "failed" | "timeout";

export default function CheckoutPage() {
  const { items, clear } = useCart();
  const router = useRouter();
  const [method, setMethod] = useState<Method>("card");
  const [loading, setLoading] = useState(false);
  const [mpesaRef, setMpesaRef] = useState<string | null>(null);
  const [stk, setStk] = useState<Stk>("idle");
  const [stkMsg, setStkMsg] = useState("");
  const [receipt, setReceipt] = useState<string | null>(null);
  const [orderRef, setOrderRef] = useState<string | null>(null);

  const subtotal = items.reduce((n, i) => n + i.qty * i.price, 0);
  const deposit = Math.round(subtotal * 0.3);
  const depositKes = usdToKes(deposit);

  const pollStatus = async (orderId: string) => {
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      try {
        const r = await fetch(`/api/mpesa/status?orderId=${orderId}`);
        const d = await r.json();
        if (d.status === "confirmed") { setReceipt(d.receipt || null); setStk("success"); clear(); return; }
        if (d.status === "cancelled") { setStk("failed"); setStkMsg("The payment was cancelled or failed. Please try again."); return; }
      } catch { /* keep polling */ }
    }
    setStk("timeout");
  };

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

      if (data.url) { window.location.href = data.url; return; } // Stripe Checkout

      if (method === "mpesa") {
        const orderId = data.orderId as string;
        setOrderRef(orderId);
        // Try a live STK push; fall back to Paybill instructions if not configured.
        const stkRes = await fetch("/api/mpesa/stkpush", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, phone: form.phone, amount: depositKes }),
        });
        const stkData = await stkRes.json();
        setLoading(false);

        if (!stkData.configured) {
          setMpesaRef(`${site.payments.mpesaAccountPrefix}-${(orderId || "").slice(-6)}`);
          return;
        }
        if (stkData.ok) { setStk("sent"); pollStatus(orderId); return; }
        setStk("failed"); setStkMsg(stkData.error || "Could not send the M-Pesa prompt.");
        return;
      }

      clear();
      router.push(`/checkout/success?order=${data.orderId}`);
    } catch {
      setLoading(false);
      alert("Something went wrong. Please try again or contact us.");
    }
  };

  if (items.length === 0 && !mpesaRef && stk === "idle") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-40 text-center">
        <h1 className="font-display text-3xl font-bold">Your cart is empty</h1>
        <a href="/shop" className="mt-6 inline-block text-accent-ink hover:underline">Browse our dogs →</a>
      </div>
    );
  }

  // ---- Live STK push states ----
  if (stk !== "idle") {
    return (
      <div className="mx-auto max-w-lg px-6 py-32 text-center">
        <div className="rounded-3xl border border-border bg-surface p-8">
          {stk === "sent" && (
            <>
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15">
                <Smartphone className="text-emerald-500" size={30} />
              </div>
              <h1 className="font-display text-2xl font-bold">Check your phone 📲</h1>
              <p className="mt-2 text-muted">We sent an M-Pesa prompt for <span className="font-semibold text-foreground">KES {depositKes.toLocaleString()}</span>. Enter your PIN to confirm.</p>
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted"><Loader2 size={16} className="animate-spin text-accent-ink" /> Waiting for confirmation…</div>
            </>
          )}
          {stk === "success" && (
            <>
              <CheckCircle2 className="mx-auto mb-4 text-emerald-500" size={48} />
              <h1 className="font-display text-2xl font-bold">Payment received! 🎉</h1>
              <p className="mt-2 text-muted">Your reservation is confirmed{receipt ? <> — M-Pesa ref <span className="font-semibold text-foreground">{receipt}</span></> : ""}.</p>
              <button onClick={() => router.push(`/checkout/success?order=${orderRef}`)} className="btn-leaf mt-6 h-12 w-full rounded-full">View order</button>
            </>
          )}
          {(stk === "failed" || stk === "timeout") && (
            <>
              <XCircle className="mx-auto mb-4 text-red-500" size={48} />
              <h1 className="font-display text-2xl font-bold">{stk === "timeout" ? "Still waiting…" : "Payment not completed"}</h1>
              <p className="mt-2 text-muted">{stk === "timeout" ? "We haven't received your payment yet. If you paid, it will confirm shortly." : stkMsg}</p>
              <button onClick={() => { setStk("idle"); setMpesaRef(null); }} className="btn-leaf mt-6 h-12 w-full rounded-full">Try again</button>
            </>
          )}
        </div>
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
            <Line label="Deposit (30%)" value={`KES ${depositKes.toLocaleString()}`} />
            <Line label="Balance on delivery" value={`KES ${usdToKes(subtotal - deposit).toLocaleString()}`} />
          </div>
          <p className="mt-4 text-xs text-muted">
            Send your M-Pesa confirmation to WhatsApp {site.contact.phoneDisplay} and we&apos;ll confirm your reservation.
          </p>
          <button onClick={() => { clear(); router.push("/"); }} className="btn-leaf mt-6 h-12 w-full rounded-full">Done</button>
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
              <Lock size={14} className="text-accent-ink" />
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
              <div className="flex justify-between"><span className="text-muted">Deposit today (30%)</span><span className="font-semibold text-accent-ink">{formatPrice(deposit)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Balance on delivery</span><span>{formatPrice(subtotal - deposit)}</span></div>
            </div>
            <button disabled={loading} className="btn-leaf mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full text-base">
              {loading ? <><Loader2 className="animate-spin" size={18} /> Processing…</> : <>Pay {formatPrice(deposit)} Deposit</>}
            </button>
            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted"><ShieldCheck size={14} className="text-accent-ink" /> Secure &amp; encrypted checkout</p>
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
      <input name={name} type={type} required={required} className="h-12 w-full rounded-xl border border-border bg-background px-4 outline-none focus:border-sun-400" />
    </div>
  );
}

function MethodCard({ active, onClick, icon, title, desc }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <button type="button" onClick={onClick} className={cn("flex items-center gap-3 rounded-2xl border p-4 text-left transition", active ? "border-sun-400 bg-sun-400/10" : "border-border hover:border-sun-400")}>
      <span className={cn("grid h-11 w-11 place-items-center rounded-xl", active ? "bg-sun-400 text-leaf-900" : "bg-surface-2 text-accent-ink")}>{icon}</span>
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
