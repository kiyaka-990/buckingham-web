"use client";

import { useState, useRef, useTransition } from "react";
import { Store, CreditCard, Bell, Save, Check, Loader2 } from "lucide-react";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { saveSetting } from "@/lib/actions/admin";

export default function SettingsPage() {
  const [tab, setTab] = useState<"general" | "payments" | "notifications">("general");
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const save = () => {
    const fd = new FormData(formRef.current ?? undefined);
    const values = Object.fromEntries(fd.entries());
    start(async () => {
      await saveSetting(`settings:${tab}`, JSON.stringify(values));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const tabs = [
    { id: "general" as const, label: "General", icon: Store },
    { id: "payments" as const, label: "Payments", icon: CreditCard },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <p className="text-muted">Manage your store configuration.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 lg:flex-col">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={cn("flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition", tab === t.id ? "bg-brass-400/12 text-brass-600 dark:text-brass-400" : "text-muted hover:bg-foreground/5")}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </nav>

        <form ref={formRef} onSubmit={(e) => { e.preventDefault(); save(); }} className="rounded-3xl border border-border bg-surface p-6">
          {tab === "general" && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold">Store Details</h2>
              <Field label="Store name" defaultValue={site.name} />
              <Field label="Contact email" defaultValue={site.contact.email} />
              <Field label="Phone" defaultValue={site.contact.phoneDisplay} />
              <Field label="Address" defaultValue={`${site.contact.address.building}, ${site.contact.address.county}`} />
            </div>
          )}
          {tab === "payments" && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold">Payment Methods</h2>
              <Toggle label="Stripe (Card payments)" desc="Accept international Visa, Mastercard, Amex" defaultOn />
              <Toggle label="M-Pesa Paybill" desc="Lipa na M-Pesa for local Kenyan customers" defaultOn />
              <Field label="M-Pesa Paybill number" defaultValue={site.payments.mpesaPaybill} />
              <Field label="Deposit percentage" defaultValue="30%" />
            </div>
          )}
          {tab === "notifications" && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold">Notifications</h2>
              <Toggle label="New order alerts" desc="Email me when an order is placed" defaultOn />
              <Toggle label="New enquiry alerts" desc="Notify on WhatsApp / form messages" defaultOn />
              <Toggle label="Low stock alerts" desc="Warn when a dog has 1 or fewer in stock" defaultOn />
              <Toggle label="Weekly summary" desc="Receive a weekly performance report" />
            </div>
          )}

          <button type="submit" disabled={pending} className="btn-brass mt-6 flex items-center gap-2 rounded-full px-6 py-2.5 text-sm">
            {pending ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : saved ? <><Check size={16} /> Saved</> : <><Save size={16} /> Save changes</>}
          </button>
        </form>
      </div>
    </div>
  );
}

const nameOf = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

function Field({ label, defaultValue }: { label: string; defaultValue?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <input name={nameOf(label)} defaultValue={defaultValue} className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-brass-400" />
    </div>
  );
}

function Toggle({ label, desc, defaultOn }: { label: string; desc: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <button type="button" onClick={() => setOn(!on)} className="flex w-full items-center justify-between rounded-xl border border-border p-4 text-left transition hover:bg-foreground/5">
      <input type="hidden" name={nameOf(label)} value={on ? "on" : "off"} />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="text-xs text-muted">{desc}</span>
      </span>
      <span className={cn("relative h-6 w-11 shrink-0 rounded-full transition", on ? "bg-brass-400" : "bg-muted/30")}>
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all", on ? "left-[22px]" : "left-0.5")} />
      </span>
    </button>
  );
}
