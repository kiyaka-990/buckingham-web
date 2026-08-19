"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * Types each word out char-by-char, holds, deletes, then advances.
 * Calls onIndexChange when a new word begins so callers can sync (e.g. a bg image).
 */
export function Typewriter({
  words,
  onIndexChange,
  className,
  typeSpeed = 85,
  deleteSpeed = 40,
  hold = 1700,
}: {
  words: string[];
  onIndexChange?: (i: number) => void;
  className?: string;
  typeSpeed?: number;
  deleteSpeed?: number;
  hold?: number;
}) {
  const [i, setI] = useState(0);
  const [display, setDisplay] = useState("");
  const [phase, setPhase] = useState<"typing" | "deleting">("typing");

  useEffect(() => {
    onIndexChange?.(i);
  }, [i, onIndexChange]);

  useEffect(() => {
    const word = words[i];
    let t: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (display.length < word.length) {
        t = setTimeout(() => setDisplay(word.slice(0, display.length + 1)), typeSpeed);
      } else {
        t = setTimeout(() => setPhase("deleting"), hold);
      }
    } else {
      if (display.length > 0) {
        t = setTimeout(() => setDisplay(word.slice(0, display.length - 1)), deleteSpeed);
      } else {
        t = setTimeout(() => {
          setI((v) => (v + 1) % words.length);
          setPhase("typing");
        }, 220);
      }
    }
    return () => clearTimeout(t);
  }, [display, phase, i, words, typeSpeed, deleteSpeed, hold]);

  return (
    <span className={cn("text-gradient-brass", className)}>
      {display}
      <span className="ml-0.5 inline-block w-[3px] translate-y-1 self-stretch bg-brass-400 align-middle animate-pulse" style={{ height: "0.9em" }} aria-hidden />
    </span>
  );
}
