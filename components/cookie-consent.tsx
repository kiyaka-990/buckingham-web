"use client";

import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!localStorage.getItem("bk-cookie-consent")) setShow(true);
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  const decide = (value: "all" | "essential") => {
    localStorage.setItem("bk-cookie-consent", value);
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: "spring", damping: 24 }}
          className="fixed bottom-4 left-4 right-4 z-[75] mx-auto max-w-md rounded-3xl glass-strong p-5 shadow-soft sm:left-6 sm:right-auto"
        >
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ochre-400/15 text-accent-ink">
              <Cookie size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold">We value your privacy 🐾</h3>
              <p className="mt-1 text-sm text-muted">
                We use cookies to personalise your experience, remember your cart and analyse traffic. You can choose which to allow.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => decide("all")}>Accept all</Button>
                <Button size="sm" variant="outline" onClick={() => decide("essential")}>Essential only</Button>
              </div>
            </div>
            <button onClick={() => decide("essential")} aria-label="Dismiss" className="text-muted hover:text-foreground">
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
