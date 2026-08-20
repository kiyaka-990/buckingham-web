"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Cycles through `words`, animating each in/out.
 * `axis="y"` slides vertically (good for headlines), `axis="x"` horizontally.
 */
export function RotatingText({
  words,
  interval = 2600,
  className,
  axis = "y",
  gradient = false,
}: {
  words: string[];
  interval?: number;
  className?: string;
  axis?: "x" | "y";
  gradient?: boolean;
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [words.length, interval]);

  const offset = axis === "y" ? { enter: 18, exit: -18 } : { enter: 24, exit: -24 };

  return (
    <span className={cn("relative inline-flex overflow-hidden align-bottom", className)}>
      {/* invisible sizer keeps layout width stable to the widest word */}
      <span aria-hidden className="pointer-events-none invisible whitespace-nowrap">
        {words.reduce((a, b) => (a.length > b.length ? a : b), "")}
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          initial={{ opacity: 0, [axis]: offset.enter, filter: "blur(6px)" }}
          animate={{ opacity: 1, [axis]: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, [axis]: offset.exit, filter: "blur(6px)" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={cn("absolute inset-0 whitespace-nowrap", gradient && "text-gradient-sun")}
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
