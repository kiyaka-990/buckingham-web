"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ShieldCheck, Award, Truck, ChevronDown, Sparkles, PawPrint } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { RotatingText } from "@/components/ui/rotating-text";
import { site } from "@/lib/site";
import { availableCount } from "@/lib/data/catalog";

/** Drop a file at public/videos/hero.mp4 to enable the cinematic video background. */
const HERO_VIDEO = "/videos/hero.mp4";

const SLIDE_MS = 5000;

const slides = [
  { image: "/images/dog-06.jpg", breed: "Belgian Malinois", label: "Elite Protection", caption: "Handler-focused drive, trained to protect what matters most." },
  { image: "/images/dog-03.jpg", breed: "German Shepherd", label: "Champion Bloodlines", caption: "Titled European working stock with rock-solid temperaments." },
  { image: "/images/dog-45.jpg", breed: "Boerboel", label: "Estate Guardians", caption: "Giant-hearted protectors devoted to family and home." },
  { image: "/images/dog-70.jpg", breed: "Golden Retriever", label: "Family Companions", caption: "Gentle, radiant and wonderful with children." },
];

const rotatingWords = ["Guardian", "Companion", "Champion", "Protector", "Best Friend"];

export function Hero() {
  const [active, setActive] = useState(0);
  const [videoOk, setVideoOk] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // mouse parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const tx = useTransform(sx, [-0.5, 0.5], [-14, 14]);
  const ty = useTransform(sy, [-0.5, 0.5], [-14, 14]);

  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % slides.length), SLIDE_MS);
    return () => clearInterval(t);
  }, []);

  const onMove = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section className="relative min-h-[92vh] w-full overflow-hidden" onMouseMove={onMove}>
      {/* Background: image slides (always present) with subtle parallax */}
      <motion.div style={{ x: tx, y: ty }} className="absolute -inset-6">
        <AnimatePresence mode="sync">
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 1.12 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 1.2 }, scale: { duration: SLIDE_MS / 1000 + 1, ease: "linear" } }}
            className="absolute inset-0"
          >
            <Image src={slides[active].image} alt={slides[active].breed} fill priority className="object-cover" />
          </motion.div>
        </AnimatePresence>

        {/* Optional cinematic video — fades in over images only once it can play */}
        <video
          ref={videoRef}
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
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950/80 via-navy-950/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/75 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl text-white"
        >
          <span className="mb-5 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs font-medium">
            <Sparkles size={14} className="text-gold-400" />
            {site.tagline} · Est. {site.established}
          </span>

          <h1 className="font-display text-5xl font-bold leading-[1.05] sm:text-6xl md:text-7xl">
            Meet your next
            <br />
            <RotatingText words={rotatingWords} gradient className="mt-1 h-[1.1em] text-5xl sm:text-6xl md:text-7xl" />
          </h1>

          {/* Per-slide caption */}
          <div className="mt-6 h-14 max-w-xl">
            <AnimatePresence mode="wait">
              <motion.p
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="text-lg text-navy-50/85"
              >
                <span className="font-semibold text-gold-400">{slides[active].label}.</span> {slides[active].caption}
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
                className="flex items-center gap-2 rounded-full glass px-3.5 py-2 text-sm text-navy-50/90"
              >
                <c.icon size={15} className="text-gold-400" /> {c.label}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Slide indicator card with timed progress bars */}
      <div className="absolute bottom-8 right-6 hidden md:block">
        <motion.div
          key={active}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 rounded-2xl glass-strong px-4 py-3 text-white"
        >
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-gold-400">{slides[active].label}</p>
            <p className="font-display font-semibold">{slides[active].breed}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Slide ${i + 1}`}
                className="relative h-1.5 w-8 overflow-hidden rounded-full bg-white/25"
              >
                {i === active && (
                  <motion.span
                    key={`p-${active}`}
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: SLIDE_MS / 1000, ease: "linear" }}
                    className="absolute inset-y-0 left-0 bg-gold-400"
                  />
                )}
                {i < active && <span className="absolute inset-0 bg-gold-400/60" />}
              </button>
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
        <PawPrint size={14} className="text-gold-400" />
      </motion.div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60">
        <ChevronDown className="animate-bounce" />
      </div>
    </section>
  );
}
