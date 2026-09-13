"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, X, Send, Sparkles, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Crest } from "@/components/brand/crest";
import { useUI } from "@/lib/store/ui";
import { formatPrice, cn } from "@/lib/utils";

type Suggestion = { label: string; slug: string; price: number; image: string; breed: string; status?: string };
type Msg = { role: "user" | "assistant"; content: string; suggestions?: Suggestion[] };

const starters = [
  "I need a guard dog for my farm",
  "Show me puppies under $550",
  "Do you deliver to Nairobi?",
  "Which breed suits a family with kids?",
];

/** Remembered so a returning visitor is never asked twice. */
const VISITOR_KEY = "bk.visitor";

type Visitor = { name: string; email: string };

function loadVisitor(): Visitor | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(VISITOR_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<Visitor>;
    return v.name && v.email ? { name: v.name, email: v.email } : null;
  } catch {
    return null;
  }
}

export function ChatWidget() {
  const { chatOpen, setChat } = useUI();
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "I'm Duke, the Buckingham Kennel sales agent. Tell me what you need a dog for — family, farm or protection — and roughly your budget, and I'll match you to one we actually have on the ground.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Lazy initialiser rather than an effect: loadVisitor() is guarded for SSR and
  // returns null there. `visitor` never reaches the DOM, so server and client
  // markup match regardless of what is in localStorage.
  const [visitor, setVisitor] = useState<Visitor | null>(loadVisitor);
  const [gate, setGate] = useState(false);
  /** The message that triggered the gate, replayed once they identify themselves. */
  const pending = useRef<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [formError, setFormError] = useState<string | null>(null);


  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string, who: Visitor | null = visitor, replayOf?: Msg[]) => {
    const q = text.trim();
    if (!q || loading) return;
    const next = replayOf ?? [...messages, { role: "user" as const, content: q }];
    if (!replayOf) setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map(({ role, content }) => ({ role, content })),
          ...(who ? { visitor: who } : {}),
        }),
      });
      const data = await res.json();

      // The server decides when to ask, not the widget — so honour whatever it
      // says even if we thought we had already identified this visitor.
      if (data.gate) {
        pending.current = q;
        setGate(true);
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
        return;
      }

      setGate(false);
      setMessages((m) => [...m, { role: "assistant", content: data.reply, suggestions: data.suggestions }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Apologies — I had trouble connecting. Please call us on +254 720 332 626 or WhatsApp us and we'll help right away." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const submitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    if (name.length < 2) return setFormError("Could I take your name?");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return setFormError("That email doesn't look quite right.");

    const who = { name, email };
    setFormError(null);
    setVisitor(who);
    try {
      window.localStorage.setItem(VISITOR_KEY, JSON.stringify(who));
    } catch {
      /* private browsing — they'll just be asked again next visit */
    }
    setGate(false);

    // Replay the question the gate interrupted, so they never have to retype it.
    const question = pending.current;
    pending.current = null;
    if (question) {
      const replay = [...messages, { role: "assistant" as const, content: `Thank you, ${name}.` }];
      setMessages(replay);
      void send(question, who, [...replay, { role: "user" as const, content: question }]);
    }
  };

  return (
    <>
      {/* Launcher */}
      <AnimatePresence>
        {!chatOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setChat(true)}
            aria-label="Open the sales agent chat"
            className="fixed bottom-5 right-5 z-[70] grid h-15 w-15 place-items-center rounded-full btn-accent shadow-soft animate-pulse-ring"
            style={{ height: 60, width: 60 }}
          >
            <MessageCircle size={26} />
            <span className="absolute -left-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-graphite-900 text-volt-400">
              <Sparkles size={12} />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
            className="fixed bottom-4 right-4 z-[70] flex h-[70vh] max-h-[600px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-soft"
          >
            {/* Header */}
            <div className="flex items-center gap-3 bg-graphite-900 px-4 py-3 text-graphite-50">
              <div className="relative grid h-10 w-10 place-items-center rounded-full bg-volt-400 text-graphite-900">
                <Crown size={20} />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-graphite-900 bg-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="font-display font-semibold leading-tight">Duke · Sales Agent</p>
                <p className="text-xs text-graphite-100/70">Online · sees live stock</p>
              </div>
              <button onClick={() => setChat(false)} aria-label="Close chat" className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-surface-2/40 p-4">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[85%] space-y-2")}>
                    <div
                      className={cn(
                        "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                        m.role === "user"
                          ? "rounded-br-sm bg-graphite-800 text-white"
                          : "rounded-bl-sm glass-strong"
                      )}
                    >
                      {m.content}
                    </div>
                    {m.suggestions && m.suggestions.length > 0 && (
                      <div className="space-y-2">
                        {m.suggestions.map((s) => (
                          <Link
                            key={s.slug}
                            href={`/dogs/${s.slug}`}
                            onClick={() => setChat(false)}
                            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-2 transition hover:border-volt-400"
                          >
                            {s.image ? (
                              <Image src={s.image} alt={s.label} width={44} height={44} className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                            ) : (
                              <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-deep">
                                <Crest tone="invert" className="h-6" />
                              </span>
                            )}
                            <span className="flex-1">
                              <span className="block text-sm font-semibold">{s.label}</span>
                              <span className="text-xs text-muted">
                                {s.breed}
                                {s.status && s.status !== "available" && (
                                  <span className="ml-1 capitalize text-accent-ink">· {s.status}</span>
                                )}
                              </span>
                            </span>
                            <span className="text-sm font-bold text-accent-ink">{formatPrice(s.price)}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-1 rounded-2xl rounded-bl-sm glass-strong px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-muted" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Starters */}
            {messages.length <= 1 && !gate && (
              <div className="flex flex-wrap gap-2 border-t border-border px-3 py-2">
                {starters.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-border px-3 py-1.5 text-xs transition hover:border-volt-400 hover:text-accent-ink">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Gentle gate: asked once, after Duke has already been useful. */}
            {gate ? (
              <form onSubmit={submitDetails} className="space-y-2 border-t border-border p-3">
                <div className="flex gap-2">
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Your name"
                    autoComplete="name"
                    autoFocus
                    className="h-11 w-1/2 rounded-full border border-border bg-surface px-4 text-sm outline-none focus:border-volt-400"
                  />
                  <input
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="Email"
                    type="email"
                    autoComplete="email"
                    className="h-11 w-1/2 rounded-full border border-border bg-surface px-4 text-sm outline-none focus:border-volt-400"
                  />
                </div>
                {formError && <p className="px-2 text-xs text-red-400">{formError}</p>}
                <button type="submit" className="btn-accent h-11 w-full rounded-full text-sm font-semibold">
                  Continue the conversation
                </button>
                <p className="px-2 text-center text-[11px] leading-snug text-muted">
                  We&apos;ll only use this to follow up about puppies, and you can stop it any time
                  with one click. We never pass it to anyone else.
                </p>
              </form>
            ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-border p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Duke anything…"
                className="h-11 flex-1 rounded-full border border-border bg-surface px-4 text-sm outline-none focus:border-volt-400"
              />
              <button type="submit" disabled={loading} className="btn-accent grid h-11 w-11 shrink-0 place-items-center rounded-full" aria-label="Send">
                <Send size={16} />
              </button>
            </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
