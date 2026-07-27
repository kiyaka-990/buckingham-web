"use client";

import { useState } from "react";
import { Send, Check } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email) setDone(true);
      }}
      className="pt-1"
    >
      <p className="mb-2 text-sm text-navy-100/80">Join for new litters &amp; offers</p>
      <div className="flex overflow-hidden rounded-full glass">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="h-10 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-navy-100/50"
        />
        <button className="btn-gold grid h-10 w-11 place-items-center" aria-label="Subscribe">
          {done ? <Check size={16} /> : <Send size={15} />}
        </button>
      </div>
      {done && <p className="mt-2 text-xs text-gold-400">You&apos;re on the list! 🐾</p>}
    </form>
  );
}
