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
  "Show me puppies under $2,600",
  "Do you deliver to Nairobi?",
  "Which breed suits a family with kids?",
];

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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    const next = [...messages, { role: "user" as const, content: q }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })) }),
      });
      const data = await res.json();
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
            className="fixed bottom-5 right-5 z-[70] grid h-15 w-15 place-items-center rounded-full btn-brass shadow-soft animate-pulse-ring"
            style={{ height: 60, width: 60 }}
          >
            <MessageCircle size={26} />
            <span className="absolute -left-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-forest-900 text-brass-400">
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
            <div className="flex items-center gap-3 bg-forest-900 px-4 py-3 text-forest-50">
              <div className="relative grid h-10 w-10 place-items-center rounded-full bg-brass-400 text-forest-900">
                <Crown size={20} />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-forest-900 bg-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="font-display font-semibold leading-tight">Duke · Sales Agent</p>
                <p className="text-xs text-forest-100/70">Online · sees live stock</p>
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
                          ? "rounded-br-sm bg-forest-800 text-white"
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
                            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-2 transition hover:border-brass-400"
                          >
                            {s.image ? (
                              <Image src={s.image} alt={s.label} width={44} height={44} className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                            ) : (
                              <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-estate">
                                <Crest tone="invert" className="h-6" />
                              </span>
                            )}
                            <span className="flex-1">
                              <span className="block text-sm font-semibold">{s.label}</span>
                              <span className="text-xs text-muted">
                                {s.breed}
                                {s.status && s.status !== "available" && (
                                  <span className="ml-1 capitalize text-brass-500">· {s.status}</span>
                                )}
                              </span>
                            </span>
                            <span className="text-sm font-bold text-brass-500">{formatPrice(s.price)}</span>
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
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 border-t border-border px-3 py-2">
                {starters.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-border px-3 py-1.5 text-xs transition hover:border-brass-400 hover:text-brass-500">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
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
                className="h-11 flex-1 rounded-full border border-border bg-surface px-4 text-sm outline-none focus:border-brass-400"
              />
              <button type="submit" disabled={loading} className="btn-brass grid h-11 w-11 shrink-0 place-items-center rounded-full" aria-label="Send">
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
