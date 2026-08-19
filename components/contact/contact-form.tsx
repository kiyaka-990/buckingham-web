"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { breeds } from "@/lib/data/breeds";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
    } catch {
      /* demo — ignore network errors */
    }
    setStatus("sent");
  };

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-surface p-12 text-center">
        <CheckCircle2 className="mb-4 text-emerald-500" size={48} />
        <h3 className="font-display text-2xl font-bold">Message sent!</h3>
        <p className="mt-2 text-muted">Thank you for reaching out. Our team will respond within 24 hours.</p>
        <button onClick={() => setStatus("idle")} className="mt-6 text-sm text-brass-500 hover:underline">Send another message</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-3xl border border-border bg-surface p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="name" required placeholder="Jane Doe" />
        <Field label="Phone / WhatsApp" name="phone" required placeholder="+254 …" />
      </div>
      <Field label="Email" name="email" type="email" required placeholder="you@email.com" />
      <div>
        <label className="mb-1.5 block text-sm font-medium">Interested in</label>
        <select name="interest" className="h-12 w-full rounded-xl border border-border bg-background px-4 outline-none focus:border-brass-400">
          <option value="">Select a breed / service…</option>
          {breeds.map((b) => <option key={b.slug} value={b.name}>{b.name}</option>)}
          <option value="Training">Training</option>
          <option value="Stud Services">Stud Services</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Message</label>
        <textarea name="message" rows={4} required placeholder="Tell us what you're looking for…" className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-brass-400" />
      </div>
      <button disabled={status === "sending"} className="btn-brass flex h-13 w-full items-center justify-center gap-2 rounded-full py-3.5 text-base">
        {status === "sending" ? "Sending…" : <>Send Message <Send size={18} /></>}
      </button>
    </form>
  );
}

function Field({ label, name, type = "text", required, placeholder }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <input name={name} type={type} required={required} placeholder={placeholder} className="h-12 w-full rounded-xl border border-border bg-background px-4 outline-none focus:border-brass-400" />
    </div>
  );
}
