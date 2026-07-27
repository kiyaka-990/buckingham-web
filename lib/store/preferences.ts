"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark";

type PrefState = {
  theme: Theme;
  fontScale: number; // 0.9 - 1.4
  highContrast: boolean;
  reduceMotion: boolean;
  hydrated: boolean;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setFontScale: (n: number) => void;
  toggleContrast: () => void;
  toggleReduceMotion: () => void;
  setHydrated: () => void;
};

export const usePreferences = create<PrefState>()(
  persist(
    (set) => ({
      theme: "dark",
      fontScale: 1,
      highContrast: false,
      reduceMotion: false,
      hydrated: false,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      setFontScale: (fontScale) => set({ fontScale: Math.min(1.4, Math.max(0.9, fontScale)) }),
      toggleContrast: () => set((s) => ({ highContrast: !s.highContrast })),
      toggleReduceMotion: () => set((s) => ({ reduceMotion: !s.reduceMotion })),
      setHydrated: () => set({ hydrated: true }),
    }),
    { name: "bk-prefs" }
  )
);

/** Apply preferences to <html>. Called from a client effect. */
export function applyPreferences(s: Pick<PrefState, "theme" | "fontScale" | "highContrast" | "reduceMotion">) {
  const root = document.documentElement;
  root.classList.toggle("dark", s.theme === "dark");
  root.classList.toggle("a11y-contrast", s.highContrast);
  root.classList.toggle("a11y-reduce-motion", s.reduceMotion);
  root.style.setProperty("--a11y-font-scale", String(s.fontScale));
}
