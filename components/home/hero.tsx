"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ShieldCheck, Award, Truck, ChevronDown, Sparkles, PawPrint } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Typewriter } from "@/components/ui/typewriter";
import { HeroAd } from "@/components/home/hero-ad";
import { site } from "@/lib/site";
import { availableCount } from "@/lib/data/catalog";

/** Drop a file at public/videos/hero.mp4 to enable the cinematic video background. */
const HERO_VIDEO = "/videos/hero.mp4";

/** Each rotating word is wired to its matching breed photo + caption. */
const items = [
  { word: "Guardian", image: "/media/caucasian/adult-04.jpg", breed: "Caucasian Shepherd", label: "Estate Guardian", caption: "Seventy kilos that decided your gate is its business." },
  { word: "Sentinel", image: "/media/kangal/adult-01.jpg", breed: "Kangal", label: "Livestock Protector", caption: "Türkiye's shepherd of the high plains — patient with stock, immovable at a boundary." },
  { word: "Champion", image: "/media/gsd-black/adult-01.jpg", breed: "Royal Black German Shepherd", label: "Champion Bloodlines", caption: "Solid black, straight back, long plush coat — the rarest stamp of the breed." },
  { word: "Protector", image: "/media/gsd-sable/adult-01.jpg", breed: "Sable German Shepherd", label: "Personal Protection", caption: "Working-line drive and the nerve to go with it." },
  { word: "Companion", image: "/media/white-shepherd/adult-02.jpg", breed: "White Swiss Shepherd", label: "Family Companion", caption: "A shepherd's brain and loyalty, without the hard edge." },
];

const words = items.map((i) => i.word);

export function Hero() {
  const [active, setActive] = useState(0);
  const [videoOk, setVideoOk] = useState(false);

  // mouse parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const tx = useTransform(sx, [-0.5, 0.5], [-16, 16]);
  const ty = useTransform(sy, [-0.5, 0.5], [-16, 16]);

  const onMove = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const handleIndex = useCallback((i: number) => setActive(i), []);
  const current = items[active];

  return (
    <section className="relative min-h-[92vh] w-full overflow-hidden" onMouseMove={onMove}>
      {/* Background: image swaps to match the typed word, with subtle parallax */}
      <motion.div style={{ x: tx, y: ty }} className="absolute -inset-8">
        <AnimatePresence mode="sync">
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 1.14 }}
            animate={{ opacity: 1, scale: 1.04 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 1 }, scale: { duration: 6, ease: "linear" } }}
            className="absolute inset-0"
          >
            <Image src={current.image} alt={current.breed} fill priority className="object-cover" />
          </motion.div>
        </AnimatePresence>

        {/* Optional cinematic video — fades in over images once it can play */}
        <video
          src={HERO_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          onCanPlay={() => setVideoOk(true)}
          onError={() => setVideoOk(false)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${videoOk ? "opacity-100" : "opacity-0"}`}
        />
      </motion.div>

      {/* Light overlay for legibility (kept clear so photos read true) */}
      <div className="absolute inset-0 bg-gradient-to-r from-forest-950/80 via-forest-950/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-forest-950/75 via-transparent to-transparent" />

      {/* Timed promotional advert */}
      <HeroAd />

      {/* Content */}
      <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl text-white"
        >
          <span className="mb-5 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs font-medium">
            <Sparkles size={14} className="text-brass-400" />
            {site.tagline} · Est. {site.established}
          </span>

          <h1 className="font-display text-5xl font-bold leading-[1.05] sm:text-6xl md:text-7xl">
            Meet your next
            <br />
            <Typewriter words={words} onIndexChange={handleIndex} className="text-5xl sm:text-6xl md:text-7xl" />
          </h1>

          {/* Per-word caption (synced to the typed word) */}
          <div className="mt-6 h-14 max-w-xl">
            <AnimatePresence mode="wait">
              <motion.p
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="text-lg text-forest-50/85"
              >
                <span className="font-semibold text-brass-400">{current.label}.</span> {current.caption}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/shop" size="lg">Explore the Kennel</ButtonLink>
            <ButtonLink href="/showroom" size="lg" variant="glass">Enter 3D Showroom</ButtonLink>
          </div>

          {/* Animated trust chips */}
          <div className="mt-10 flex flex-wrap gap-3">
            {[
              { icon: ShieldCheck, label: "Health Guaranteed" },
              { icon: Award, label: "KUC / FCI Registered" },
              { icon: Truck, label: "Global Delivery" },
            ].map((c, i) => (
              <motion.span
                key={c.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.15, duration: 0.5 }}
                className="flex items-center gap-2 rounded-full glass px-3.5 py-2 text-sm text-forest-50/90"
              >
                <c.icon size={15} className="text-brass-400" /> {c.label}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Slide indicator card synced to the word */}
      <div className="absolute bottom-8 right-6 hidden md:block">
        <motion.div
          key={active}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 rounded-2xl glass-strong px-4 py-3 text-white"
        >
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-brass-400">{current.label}</p>
            <p className="font-display font-semibold">{current.breed}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            {items.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? "w-8 bg-brass-400" : "w-3 bg-white/30"}`} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Available badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-6 hidden items-center gap-2 rounded-full glass-strong px-4 py-2 text-sm text-white sm:flex"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        {availableCount} dogs available now
        <PawPrint size={14} className="text-brass-400" />
      </motion.div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60">
        <ChevronDown className="animate-bounce" />
      </div>
    </section>
  );
}
