"use client";

import { create } from "zustand";

type UIState = {
  a11yOpen: boolean;
  mobileNavOpen: boolean;
  searchOpen: boolean;
  chatOpen: boolean;
  setA11y: (v: boolean) => void;
  setMobileNav: (v: boolean) => void;
  setSearch: (v: boolean) => void;
  setChat: (v: boolean) => void;
};

export const useUI = create<UIState>((set) => ({
  a11yOpen: false,
  mobileNavOpen: false,
  searchOpen: false,
  chatOpen: false,
  setA11y: (a11yOpen) => set({ a11yOpen }),
  setMobileNav: (mobileNavOpen) => set({ mobileNavOpen }),
  setSearch: (searchOpen) => set({ searchOpen }),
  setChat: (chatOpen) => set({ chatOpen }),
}));
