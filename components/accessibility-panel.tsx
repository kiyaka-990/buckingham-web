"use client";

import { useState, useEffect } from "react";
import { X, Sun, Moon, Type, Contrast, Zap, Volume2, Pause, RotateCcw, Accessibility } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUI } from "@/lib/store/ui";
import { usePreferences } from "@/lib/store/preferences";
import { cn } from "@/lib/utils";

export function AccessibilityPanel() {
  const { a11yOpen, setA11y } = useUI();
  const { theme, setTheme, fontScale, setFontScale, highContrast, toggleContrast, reduceMotion, toggleReduceMotion } =
    usePreferences();
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  const speak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const main = document.querySelector("main");
    const text = (main?.innerText || document.body.innerText).slice(0, 4000);
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  };

  const reset = () => {
    setTheme("dark");
    setFontScale(1);
    if (highContrast) toggleContrast();
    if (reduceMotion) toggleReduceMotion();
  };

  return (
    <AnimatePresence>
      {a11yOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setA11y(false)}
            className="fixed inset-0 z-[85] bg-leaf-950/50 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            role="dialog"
            aria-label="Accessibility settings"
            className="fixed right-0 top-0 z-[86] flex h-full w-full max-w-sm flex-col bg-surface shadow-soft"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                <Accessibility size={18} className="text-accent-ink" /> Accessibility
              </h2>
              <button onClick={() => setA11y(false)} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full hover:bg-foreground/5">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              {/* Theme */}
              <Group label="Appearance" icon={<Sun size={15} />}>
                <div className="grid grid-cols-2 gap-2">
                  {(["light", "dark"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm capitalize transition",
                        theme === t ? "border-sun-400 bg-sun-400/10 text-accent-ink" : "border-border hover:bg-foreground/5"
                      )}
                    >
                      {t === "light" ? <Sun size={16} /> : <Moon size={16} />} {t}
                    </button>
                  ))}
                </div>
              </Group>

              {/* Text size */}
              <Group label="Text size" icon={<Type size={15} />}>
                <div className="flex items-center gap-3">
                  <button onClick={() => setFontScale(fontScale - 0.1)} className="h-9 w-9 rounded-lg border border-border text-lg">A−</button>
                  <div className="flex-1">
                    <input
                      type="range"
                      min={0.9}
                      max={1.4}
                      step={0.1}
                      value={fontScale}
                      onChange={(e) => setFontScale(Number(e.target.value))}
                      className="w-full accent-sun-400"
                      aria-label="Text size"
                    />
                    <p className="text-center text-xs text-muted">{Math.round(fontScale * 100)}%</p>
                  </div>
                  <button onClick={() => setFontScale(fontScale + 0.1)} className="h-9 w-9 rounded-lg border border-border text-lg">A+</button>
                </div>
              </Group>

              {/* Toggles */}
              <Group label="Preferences" icon={<Contrast size={15} />}>
                <Toggle label="High contrast" icon={<Contrast size={16} />} active={highContrast} onClick={toggleContrast} />
                <Toggle label="Reduce motion" icon={<Zap size={16} />} active={reduceMotion} onClick={toggleReduceMotion} />
              </Group>

              {/* Speech */}
              <Group label="Read aloud" icon={<Volume2 size={15} />}>
                <button
                  onClick={speak}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm transition",
                    speaking ? "border-sun-400 bg-sun-400/10 text-accent-ink" : "border-border hover:bg-foreground/5"
                  )}
                >
                  {speaking ? <Pause size={16} /> : <Volume2 size={16} />}
                  {speaking ? "Stop reading" : "Read this page"}
                </button>
                <p className="text-xs text-muted">Uses your browser&apos;s built-in speech synthesis.</p>
              </Group>

              <button onClick={reset} className="flex items-center gap-2 text-sm text-muted hover:text-foreground">
                <RotateCcw size={14} /> Reset to defaults
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Group({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">{icon} {label}</p>
      {children}
    </div>
  );
}

function Toggle({ label, icon, active, onClick }: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between rounded-xl border border-border px-4 py-3 text-sm transition hover:bg-foreground/5">
      <span className="flex items-center gap-2">{icon} {label}</span>
      <span className={cn("relative h-6 w-11 rounded-full transition", active ? "bg-sun-400" : "bg-muted/30")}>
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all", active ? "left-[22px]" : "left-0.5")} />
      </span>
    </button>
  );
}
