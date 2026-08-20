"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * A hairline reading-progress bar pinned above everything, including the
 * sticky navbar. Driven by scroll position and smoothed with a spring so it
 * glides rather than snapping on fast wheel scrolls.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const width = useSpring(scrollYProgress, { stiffness: 140, damping: 24, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX: width }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-[linear-gradient(90deg,var(--brand-ink),var(--accent-ink))]"
    />
  );
}
