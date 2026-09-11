"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A soft light that follows the pointer.
 *
 * One fixed, pointer-events-none layer for the whole page rather than a glow
 * per section — the cursor crosses section boundaries constantly and a stack of
 * separate effects would flicker at every seam.
 *
 * Position is written to CSS custom properties inside a rAF, so a burst of
 * mousemove events costs one style write per frame instead of one per event.
 * Fades out when the pointer leaves the window, never appears for a coarse
 * pointer (a finger has no hover to track), and is skipped entirely for anyone
 * who has asked for reduced motion.
 */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const point = useRef({ x: 0, y: 0 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () =>
      setEnabled(
        fine.matches &&
          !still.matches &&
          !document.documentElement.classList.contains("a11y-reduce-motion")
      );
    read();
    fine.addEventListener("change", read);
    still.addEventListener("change", read);
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      fine.removeEventListener("change", read);
      still.removeEventListener("change", read);
      obs.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const paint = () => {
      frame.current = 0;
      el.style.setProperty("--gx", `${point.current.x}px`);
      el.style.setProperty("--gy", `${point.current.y}px`);
    };
    const onMove = (e: PointerEvent) => {
      point.current = { x: e.clientX, y: e.clientY };
      el.style.opacity = "1";
      if (!frame.current) frame.current = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      el.style.opacity = "0";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="cursor-glow pointer-events-none fixed inset-0 z-[60] opacity-0 transition-opacity duration-500"
    />
  );
}
