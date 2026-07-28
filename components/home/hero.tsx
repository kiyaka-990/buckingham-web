"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Award, Truck, ChevronDown, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { site } from "@/lib/site";
import { availableCount } from "@/lib/data/catalog";

const slides = [
  { image: "/images/dog-06.jpg", breed: "Belgian Malinois", label: "Elite Protection" },
  { image: "/images/dog-03.jpg", breed: "German Shepherd", label: "Champion Bloodlines" },
  { image: "/images/dog-45.jpg", breed: "Boerboel", label: "Estate Guardians" },
  { image: "/images/dog-70.jpg", breed: "Golden Retriever", label: "Family Companions" },
];

export function Hero() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-[92vh] w-full overflow-hidden">
      {/* Background slides */}
      <AnimatePresence mode="sync">
        <motion.div
          key={active}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1.2 }, scale: { duration: 6, ease: "linear" } }}
          className="absolute inset-0"
        >
          <Image src={slides[active].image} alt={slides[active].breed} fill priority className="object-cover" />
        </motion.div>
      </AnimatePresence>

      {/* Lighter overlay — keeps text legible on the left/bottom while letting the photo stay clear */}
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
            Kenya&apos;s Premier Champion Kennel · Est. {site.established}
          </span>

          <h1 className="font-display text-5xl font-bold leading-[1.05] sm:text-6xl md:text-7xl">
            Royalty in
            <br />
            Every <span className="text-gradient-gold">Paw</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg text-navy-50/85">
            Ethically bred, health-guaranteed dogs and puppies from world-class bloodlines —
            from gentle family companions to elite trained protectors. Delivered with royal care.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/shop" size="lg">Explore the Kennel</ButtonLink>
            <ButtonLink href="/showroom" size="lg" variant="glass">
              Enter 3D Showroom
            </ButtonLink>
          </div>

          {/* Mini trust row */}
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-navy-50/80">
            <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-gold-400" /> Health Guaranteed</span>
            <span className="flex items-center gap-2"><Award size={16} className="text-gold-400" /> KUC / FCI Registered</span>
            <span className="flex items-center gap-2"><Truck size={16} className="text-gold-400" /> Global Delivery</span>
          </div>
        </motion.div>
      </div>

      {/* Slide indicator card */}
      <div className="absolute bottom-8 right-6 hidden md:block">
        <motion.div
          key={active}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 rounded-2xl glass-strong px-4 py-3 text-white"
        >
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-gold-400">{slides[active].label}</p>
            <p className="font-display font-semibold">{slides[active].breed}</p>
          </div>
          <div className="flex flex-col gap-1">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === active ? "w-6 bg-gold-400" : "w-3 bg-white/40"}`}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Available badge */}
      <div className="absolute bottom-8 left-6 hidden items-center gap-2 rounded-full glass-strong px-4 py-2 text-sm text-white sm:flex">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        {availableCount} dogs available now
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60">
        <ChevronDown className="animate-bounce" />
      </div>
    </section>
  );
}
