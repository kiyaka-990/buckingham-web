"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ScrollToTop() {
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const top = el.scrollTop || document.body.scrollTop;
      setProgress(max > 0 ? top / max : 0);
      setShow(top > 500);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const R = 20;
  const C = 2 * Math.PI * R;

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0, y: 20 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll to top"
          className="fixed bottom-5 left-5 z-[68] grid h-12 w-12 place-items-center rounded-full glass-strong text-foreground shadow-soft"
        >
          {/* progress ring */}
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r={R} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2.5" />
            <circle
              cx="24" cy="24" r={R} fill="none"
              stroke="var(--color-sun-400)" strokeWidth="2.5" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - progress)}
            />
          </svg>
          <ArrowUp size={18} className="text-accent-ink" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
