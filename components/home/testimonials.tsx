"use client";

import { useState, useEffect } from "react";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { testimonials } from "@/lib/data/content";

export function Testimonials() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);

  useEffect(() => {
    const t = setInterval(() => {
      setDir(1);
      setI((v) => (v + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  const go = (d: 1 | -1) => {
    setDir(d);
    setI((v) => (v + d + testimonials.length) % testimonials.length);
  };

  const t = testimonials[i];

  return (
    <div className="relative mx-auto max-w-3xl">
      <Quote className="mx-auto mb-6 text-sun-400" size={48} />
      <div className="relative min-h-[220px]">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.blockquote
            key={i}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <div className="mb-4 flex justify-center gap-1">
              {Array.from({ length: t.rating }).map((_, s) => (
                <Star key={s} size={18} className="fill-sun-400 text-sun-400" />
              ))}
            </div>
            <p className="font-display text-xl leading-relaxed sm:text-2xl">“{t.text}”</p>
            <footer className="mt-6">
              <p className="font-semibold">{t.name}</p>
              <p className="text-sm text-muted">{t.location} · {t.dog}</p>
            </footer>
          </motion.blockquote>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center justify-center gap-4">
        <button onClick={() => go(-1)} aria-label="Previous testimonial" className="grid h-10 w-10 place-items-center rounded-full border border-border transition hover:border-sun-400 hover:text-accent-ink">
          <ChevronLeft size={16} />
        </button>
        <div className="flex gap-1.5">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => { setDir(idx > i ? 1 : -1); setI(idx); }}
              aria-label={`Testimonial ${idx + 1}`}
              className={`h-2 rounded-full transition-all ${idx === i ? "w-6 bg-sun-400" : "w-2 bg-muted/40"}`}
            />
          ))}
        </div>
        <button onClick={() => go(1)} aria-label="Next testimonial" className="grid h-10 w-10 place-items-center rounded-full border border-border transition hover:border-sun-400 hover:text-accent-ink">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
