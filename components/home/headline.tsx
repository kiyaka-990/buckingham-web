"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const LEAD = "Guardian puppies, bred here";

/** The half of the sentence that changes. Each must finish LEAD as a sentence. */
const TAILS = [
  "and ready to go home.",
  "and steady around your children.",
  "and papered, chipped, guaranteed.",
  "and delivered to your gate.",
  "from parents you can come and meet.",
];

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The shop-front headline.
 *
 * The first line is fixed; the second fades and lifts through the tails so the
 * sentence keeps re-finishing itself. Every tail is stacked in one grid cell,
 * which reserves the tallest and widest of them up front — the line below never
 * jumps as the words swap. Screen readers get one stable sentence via
 * aria-label, and nothing moves at all if the visitor asked for reduced motion.
 */
export function ShopFrontHeadline({
  puppyCount,
  from,
}: {
  puppyCount: number;
  from: string;
}) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI((v) => (v + 1) % TAILS.length), 3600);
    return () => clearInterval(t);
  }, [reduce]);

  // Staggered arrival for the block as a whole.
  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, ease: EASE, delay },
        };

  return (
    <div>
      <motion.p className="eyebrow" {...rise(0)}>
        Buckingham Kennel · Webuye, Kenya
      </motion.p>

      <motion.h1
        aria-label={`${LEAD} ${TAILS[0]}`}
        className="mt-2 max-w-2xl font-display text-4xl font-bold leading-[1.06] sm:text-5xl lg:text-6xl"
        {...rise(0.08)}
      >
        <span aria-hidden className="block">
          {LEAD}
        </span>

        <span aria-hidden className="mt-1 grid">
          {TAILS.map((t) => (
            <span key={t} className="invisible col-start-1 row-start-1">
              {t}
            </span>
          ))}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={i}
              className="col-start-1 row-start-1 text-brand-ink"
              initial={reduce ? false : { opacity: 0, y: 18, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduce ? undefined : { opacity: 0, y: -18, filter: "blur(8px)" }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              {TAILS[i]}
            </motion.span>
          </AnimatePresence>
        </span>
      </motion.h1>

      <motion.p className="mt-3 max-w-lg text-base text-muted" {...rise(0.16)}>
        {puppyCount} {puppyCount === 1 ? "puppy" : "puppies"} available today, from {from}. Our
        adult dogs are the breeding programme and are not for sale — come and meet them, then take
        a puppy home.
      </motion.p>
    </div>
  );
}
