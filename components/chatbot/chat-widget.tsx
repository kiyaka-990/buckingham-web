"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MessageCircle, X, Send, Sparkles, Crown, Menu, PawPrint, Dog, Dna, Scissors, Phone,
  CalendarCheck, RotateCcw, LogOut, ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Crest } from "@/components/brand/crest";
import { useUI } from "@/lib/store/ui";
import { formatPrice, cn } from "@/lib/utils";
import { site, phones } from "@/lib/site";

type Suggestion = { label: string; slug: string; price: number; image: string; breed: string; status?: string };
type Msg = { role: "user" | "assistant"; content: string; suggestions?: Suggestion[] };
type Visitor = { name: string; email: string; phone?: string };

/** Quick replies, always one tap away — typing on a phone is the slow part. */
const quickReplies = [
  { label: "Puppies", text: "Show me the puppies you have available" },
  { label: "Prices", text: "How much do your puppies cost?" },
  { label: "Services", text: "What services do you offer?" },
  { label: "Delivery", text: "Do you deliver, and how does it work?" },
  { label: "Visit us", text: "I'd like to visit the kennel. How do I book?" },
];

const VISITOR_KEY = "bk.visitor";
const CHAT_KEY = "bk.chat";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const greeting = (name?: string) =>
  `${name ? `Welcome, ${name.split(" ")[0]}. ` : ""}I'm Duke, the Buckingham Kennel sales agent. Tell me what you need a dog for — family, farm or protection — and roughly your budget, and I'll match you to one we actually have on the ground.`;

function newSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

function loadVisitor(): Visitor | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(VISITOR_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<Visitor>;
    return v.name && v.email ? { name: v.name, email: v.email, phone: v.phone } : null;
  } catch {
    return null;
  }
}

/** The conversation survives page changes and refreshes within the tab. */
function loadChat(): { id: string; messages: Msg[] } {
  const fresh = { id: "", messages: [{ role: "assistant", content: greeting() }] as Msg[] };
  if (typeof window === "undefined") return fresh;
  try {
    const raw = window.sessionStorage.getItem(CHAT_KEY);
    if (raw) {
      const v = JSON.parse(raw) as { id?: string; messages?: Msg[] };
      if (v.id && Array.isArray(v.messages) && v.messages.length) return { id: v.id, messages: v.messages };
    }
  } catch {
    /* fall through to a fresh chat */
  }
  return { ...fresh, id: newSessionId() };
}

const isNarrow = () => typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches;

export function ChatWidget() {
  const { chatOpen, setChat } = useUI();
  const [initial] = useState(loadChat);
  const [messages, setMessages] = useState<Msg[]>(initial.messages);
  const sessionId = useRef(initial.id || newSessionId());
  const [visitor, setVisitor] = useState<Visitor | null>(loadVisitor);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Signed in only once we have a visitor. The server enforces the same rule.
  const signedIn = visitor !== null;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, signedIn]);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(CHAT_KEY, JSON.stringify({ id: sessionId.current, messages: messages.slice(-40) }));
    } catch {
      /* private mode — the chat just won't survive a refresh */
    }
  }, [messages]);

  // Full-screen on phones, so the page behind must not scroll under it.
  useEffect(() => {
    if (!chatOpen || !isNarrow()) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [chatOpen]);

  /** Closing always collapses the menu too, so it never reopens on a stale menu. */
  const closeChat = useCallback(() => {
    setMenuOpen(false);
    setChat(false);
  }, [setChat]);

  useEffect(() => {
    if (!chatOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (menuOpen) setMenuOpen(false); else closeChat();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chatOpen, menuOpen, closeChat]);

  /** On a phone the panel covers the page, so following a link must close it. */
  const afterNavigate = useCallback(() => {
    setMenuOpen(false);
    if (isNarrow()) closeChat();
  }, [closeChat]);

  const send = async (text: string, who: Visitor | null = visitor) => {
    const q = text.trim();
    if (!q || loading || !who) return;
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setMenuOpen(false);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId.current,
          messages: next.map(({ role, content }) => ({ role, content })),
          visitor: who,
        }),
      });
      const data = await res.json();

      if (res.status === 429) {
        setMessages((m) => [...m, { role: "assistant", content: data.error ?? "You're sending messages very quickly. Please wait a moment." }]);
        return;
      }
      // The server decides who is signed in. If it did not accept our details,
      // send them back through the form rather than leaving them talking to nobody.
      if (data.gate) {
        setVisitor(null);
        setFormError("We couldn't verify those details — please check your name and email.");
        return;
      }
      setMessages((m) => [...m, { role: "assistant", content: data.reply, suggestions: data.suggestions }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `Apologies — I had trouble connecting. Please call us on ${phones[0].display} or WhatsApp us and we'll help right away.` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const signIn = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();
    if (name.length < 2) return setFormError("Could I take your name?");
    if (!EMAIL_RE.test(email)) return setFormError("That email doesn't look quite right.");
    if (phone && phone.replace(/\D/g, "").length < 7) return setFormError("That phone number looks too short — or leave it blank.");

    const who: Visitor = { name, email, ...(phone ? { phone } : {}) };
    setFormError(null);
    setVisitor(who);
    try {
      window.localStorage.setItem(VISITOR_KEY, JSON.stringify(who));
    } catch {
      /* private browsing — they'll just be asked again next visit */
    }
    // Personalise the opening line if nothing has been said yet.
    setMessages((m) => (m.length <= 1 ? [{ role: "assistant", content: greeting(name) }] : m));
  };

  const newConversation = () => {
    sessionId.current = newSessionId();
    setMessages([{ role: "assistant", content: greeting(visitor?.name) }]);
    setMenuOpen(false);
  };

  const signOut = () => {
    try { window.localStorage.removeItem(VISITOR_KEY); } catch { /* ignore */ }
    sessionId.current = newSessionId();
    setVisitor(null);
    setForm({ name: "", email: "", phone: "" });
    setMessages([{ role: "assistant", content: greeting() }]);
    setMenuOpen(false);
  };

  const whatsapp = `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent("Hello Buckingham Kennel 👋 I'd like to know more.")}`;

  const menuLinks = [
    { label: "Available puppies", href: "/puppies", icon: PawPrint },
    { label: "Shop all dogs", href: "/shop", icon: Dog },
    { label: "Our breeds", href: "/breeds", icon: Dna },
    { label: "Services — training, grooming, stands", href: "/services", icon: Scissors },
    { label: "Visit or contact us", href: "/contact", icon: CalendarCheck },
  ];

  const field =
    "h-12 w-full rounded-full border border-border bg-surface px-4 text-base outline-none focus:border-volt-400 sm:h-11 sm:text-sm";

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
            className="fixed bottom-5 right-5 z-[70] grid place-items-center rounded-full btn-accent shadow-soft animate-pulse-ring"
            style={{ height: 60, width: 60 }}
          >
            <MessageCircle size={26} />
            <span className="absolute -left-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-graphite-900 text-volt-400">
              <Sparkles size={12} />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel — a full-screen sheet on phones, a floating window from sm up. */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            role="dialog"
            aria-label="Chat with Duke, the Buckingham Kennel sales agent"
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className={cn(
              "fixed inset-0 z-[70] flex flex-col overflow-hidden bg-surface",
              "sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[min(680px,calc(100dvh-2.5rem))] sm:w-[400px] sm:rounded-3xl sm:border sm:border-border sm:shadow-soft"
            )}
          >
            {/* Header */}
            <div className="relative flex items-center gap-3 bg-graphite-900 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-graphite-50 sm:pt-3">
              <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-volt-400 text-graphite-900">
                <Crown size={20} />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-graphite-900 bg-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display font-semibold leading-tight">Duke · Sales Agent</p>
                <p className="truncate text-xs text-graphite-100/70">{signedIn ? `Chatting as ${visitor?.name}` : "Online · sees live stock"}</p>
              </div>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                className={cn("grid h-10 w-10 place-items-center rounded-full hover:bg-white/10", menuOpen && "bg-white/10")}
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <button onClick={closeChat} aria-label="Close chat" className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            {/* Menu */}
            <AnimatePresence>
              {menuOpen && (
                <motion.nav
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  aria-label="Chat menu"
                  className="absolute inset-x-0 top-[calc(4.25rem+env(safe-area-inset-top))] bottom-0 z-10 overflow-y-auto bg-surface p-3 sm:top-[4.25rem]"
                >
                  <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Explore the site</p>
                  {menuLinks.map((l) => (
                    <Link key={l.href} href={l.href} onClick={afterNavigate} className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm hover:bg-foreground/5">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-volt-400/12 text-accent-ink"><l.icon size={17} /></span>
                      <span className="flex-1">{l.label}</span>
                      <ChevronRight size={16} className="text-muted" />
                    </Link>
                  ))}

                  <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-muted">Talk to a person</p>
                  {phones.map((p) => (
                    <a key={p.tel} href={`tel:${p.tel}`} className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm hover:bg-foreground/5">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-volt-400/12 text-accent-ink"><Phone size={17} /></span>
                      <span className="flex-1">Call {p.display}</span>
                    </a>
                  ))}
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm hover:bg-foreground/5">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-volt-400/12 text-accent-ink"><MessageCircle size={17} /></span>
                    <span className="flex-1">Chat on WhatsApp</span>
                  </a>

                  <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-muted">This chat</p>
                  {signedIn && (
                    <button onClick={newConversation} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm hover:bg-foreground/5">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-surface-2"><RotateCcw size={17} /></span>
                      <span className="flex-1">Start a new conversation</span>
                    </button>
                  )}
                  {signedIn && (
                    <button onClick={signOut} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm hover:bg-foreground/5">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-surface-2"><LogOut size={17} /></span>
                      <span className="flex-1">Not {visitor?.name.split(" ")[0]}? Sign out</span>
                    </button>
                  )}
                  <button onClick={() => setMenuOpen(false)} className="mt-2 w-full rounded-full border border-border py-3 text-sm font-medium hover:border-volt-400">
                    Back to chat
                  </button>
                </motion.nav>
              )}
            </AnimatePresence>

            {/* Body: sign-in first, then the conversation. */}
            {!signedIn ? (
              <div className="flex-1 overflow-y-auto bg-surface-2/40 p-5">
                <div className="mx-auto max-w-sm">
                  <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-volt-400/15 text-accent-ink"><Crown size={22} /></div>
                  <h2 className="font-display text-xl font-bold">Welcome to Buckingham Kennel</h2>
                  <p className="mt-1 text-sm text-muted">
                    Tell us who you are and Duke can remember your conversation, and our team can follow up properly if you need a person.
                  </p>
                  <form onSubmit={signIn} className="mt-5 space-y-3">
                    <label className="block">
                      <span className="mb-1 block px-2 text-xs font-medium text-muted">Your name</span>
                      <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} autoComplete="name" autoFocus className={field} />
                    </label>
                    <label className="block">
                      <span className="mb-1 block px-2 text-xs font-medium text-muted">Email</span>
                      <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} type="email" inputMode="email" autoComplete="email" className={field} />
                    </label>
                    <label className="block">
                      <span className="mb-1 block px-2 text-xs font-medium text-muted">Phone / WhatsApp <span className="font-normal">(optional)</span></span>
                      <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} type="tel" inputMode="tel" autoComplete="tel" className={field} />
                    </label>
                    {formError && <p role="alert" className="px-2 text-xs text-red-400">{formError}</p>}
                    <button type="submit" className="btn-accent h-12 w-full rounded-full text-sm font-semibold">Start chatting</button>
                  </form>
                  <p className="mt-4 px-2 text-center text-[11px] leading-snug text-muted">
                    We only use this to follow up about dogs and services, you can stop it any time with one click, and we never pass it to anyone else. Chats are saved so our team can read them.
                  </p>
                  <div className="mt-5 flex items-center justify-center gap-4 text-xs">
                    <a href={`tel:${phones[0].tel}`} className="font-medium text-accent-ink hover:underline">Call us</a>
                    <span className="text-muted">·</span>
                    <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="font-medium text-accent-ink hover:underline">WhatsApp</a>
                    <span className="text-muted">·</span>
                    <Link href="/services" onClick={afterNavigate} className="font-medium text-accent-ink hover:underline">Services</Link>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto overscroll-contain bg-surface-2/40 p-4">
                  {messages.map((m, i) => (
                    <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                      <div className="max-w-[88%] space-y-2">
                        <div
                          className={cn(
                            "whitespace-pre-line break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                            m.role === "user" ? "rounded-br-sm bg-graphite-800 text-white" : "rounded-bl-sm glass-strong"
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
                                onClick={afterNavigate}
                                className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-2 transition hover:border-volt-400"
                              >
                                {s.image ? (
                                  <Image src={s.image} alt={s.label} width={44} height={44} className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                                ) : (
                                  <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-deep">
                                    <Crest tone="invert" className="h-6" />
                                  </span>
                                )}
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-sm font-semibold">{s.label}</span>
                                  <span className="text-xs text-muted">
                                    {s.breed}
                                    {s.status && s.status !== "available" && <span className="ml-1 capitalize text-accent-ink">· {s.status}</span>}
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

                {/* Quick replies: one tap instead of typing. Scrolls sideways. */}
                <div className="flex gap-2 overflow-x-auto border-t border-border px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {quickReplies.map((q) => (
                    <button
                      key={q.label}
                      onClick={() => send(q.text)}
                      disabled={loading}
                      className="shrink-0 rounded-full border border-border px-3.5 py-1.5 text-xs transition hover:border-volt-400 hover:text-accent-ink disabled:opacity-50"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={(e) => { e.preventDefault(); send(input); }}
                  className="flex items-center gap-2 border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Duke anything…"
                    aria-label="Your message"
                    className="h-12 flex-1 rounded-full border border-border bg-surface px-4 text-base outline-none focus:border-volt-400 sm:h-11 sm:text-sm"
                  />
                  <button type="submit" disabled={loading || !input.trim()} className="btn-accent grid h-12 w-12 shrink-0 place-items-center rounded-full sm:h-11 sm:w-11" aria-label="Send">
                    <Send size={17} />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
