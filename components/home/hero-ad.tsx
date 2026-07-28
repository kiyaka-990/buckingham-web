"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Gift, PawPrint, ShieldCheck, Truck, ArrowRight, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const INITIAL_DELAY = 2800; // before the first advert appears
const DURATION = 8000; // how long each advert stays
const GAP = 4500; // pause between adverts
const TICK = 50;

type Ad = {
  badge: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  text: string;
  cta: { label: string; href: string };
  accent: string;
  image?: string; // when set, renders a photo/banner-style advert
};

const ads: Ad[] = [
  { badge: "Grand Opening", icon: Gift, title: "10% off your first puppy", text: "Welcome offer for new families this month only.", cta: { label: "Shop Puppies", href: "/puppies" }, accent: "from-gold-500 to-gold-300" },
  { badge: "New Litter", icon: PawPrint, title: "Golden Retriever pups just arrived", text: "Health-checked & ready to reserve.", cta: { label: "Meet Them", href: "/puppies" }, accent: "from-amber-500 to-gold-300", image: "/images/dog-70.jpg" },
  { badge: "Limited", icon: ShieldCheck, title: "Trained protection dogs available", text: "Handler-ready Malinois & German Shepherds in stock.", cta: { label: "View Dogs", href: "/shop?category=trained" }, accent: "from-navy-500 to-gold-400", image: "/images/dog-06.jpg" },
  { badge: "This Month", icon: Truck, title: "Free delivery within Nairobi", text: "On every dog delivered across the city — limited time.", cta: { label: "Explore", href: "/shop" }, accent: "from-emerald-500 to-gold-300" },
];

export function HeroAd() {
  const [i, setI] = useState(0);
  const [show, setShow] = useState(false);
  const [closed, setClosed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0); // 0 → 1 over DURATION

  const pausedRef = useRef(false);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("bk-heroad-closed")) {
      setClosed(true);
      return;
    }
    let mounted = true;
    let interval: ReturnType<typeof setInterval>;
    let gapTimer: ReturnType<typeof setTimeout>;

    const startAd = () => {
      if (!mounted) return;
      setProgress(0);
      setShow(true);
      interval = setInterval(() => {
        if (pausedRef.current) return; // hover-to-pause freezes the countdown
        setProgress((p) => {
          const np = p + TICK / DURATION;
          if (np >= 1) {
            clearInterval(interval);
            setShow(false);
            gapTimer = setTimeout(() => {
              setI((idx) => (idx + 1) % ads.length);
              startAd();
            }, GAP);
            return 1;
          }
          return np;
        });
      }, TICK);
    };

    const startTimer = setTimeout(startAd, INITIAL_DELAY);
    return () => { mounted = false; clearTimeout(startTimer); clearTimeout(gapTimer); clearInterval(interval); };
  }, []);

  const close = () => {
    setShow(false);
    setClosed(true);
    try { sessionStorage.setItem("bk-heroad-closed", "1"); } catch {}
  };

  if (closed) return null;
  const ad = ads[i];
  const pauseHandlers = {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onFocusCapture: () => setPaused(true),
    onBlurCapture: () => setPaused(false),
  };

  return (
    <div className="pointer-events-none absolute inset-x-4 top-20 z-30 flex justify-center sm:inset-x-auto sm:right-6 sm:top-24 sm:justify-end">
      <AnimatePresence mode="wait">
        {show && (
          <motion.div
            key={i}
            {...pauseHandlers}
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="group pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-2xl glass-strong shadow-soft"
          >
            <button onClick={close} aria-label="Dismiss advert" className="absolute right-2.5 top-2.5 z-20 grid h-7 w-7 place-items-center rounded-full bg-navy-950/40 text-white/80 backdrop-blur transition hover:text-white">
              <X size={15} />
            </button>

            {/* paused indicator */}
            <AnimatePresence>
              {paused && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="absolute left-2.5 top-2.5 z-20 flex items-center gap-1 rounded-full bg-navy-950/50 px-2 py-1 text-[10px] font-medium text-white backdrop-blur"
                >
                  <Pause size={10} className="text-gold-400" /> Paused
                </motion.span>
              )}
            </AnimatePresence>

            {ad.image ? (
              /* ---- Banner / photo advert ---- */
              <Link href={ad.cta.href} className="block">
                <div className="relative h-44 w-full">
                  <Image src={ad.image} alt={ad.title} fill sizes="384px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-950/40 to-navy-950/10" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <span className={`inline-block rounded-full bg-gradient-to-r ${ad.accent} px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-navy-900`}>{ad.badge}</span>
                    <p className="mt-1.5 font-display text-lg font-bold leading-tight">{ad.title}</p>
                    <p className="text-xs text-white/75">{ad.text}</p>
                    <span className="mt-1.5 inline-flex items-center gap-1 text-sm font-semibold text-gold-400">
                      {ad.cta.label} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            ) : (
              /* ---- Compact icon advert ---- */
              <div className="flex items-start gap-3 p-4 pr-9 text-white">
                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${ad.accent} text-navy-900`}>
                  <ad.icon size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-400">{ad.badge}</span>
                  <p className="font-display text-base font-bold leading-tight">{ad.title}</p>
                  <p className="mt-0.5 text-xs text-white/70">{ad.text}</p>
                  <Link href={ad.cta.href} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-gold-400 transition-all hover:gap-2">
                    {ad.cta.label} <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}

            {/* countdown progress (freezes while paused) */}
            <div className="h-1 w-full bg-white/10">
              <div className="h-full bg-gradient-to-r from-gold-400 to-gold-200" style={{ width: `${(1 - progress) * 100}%`, transition: "width 50ms linear" }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
