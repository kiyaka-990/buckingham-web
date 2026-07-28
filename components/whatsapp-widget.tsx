"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUI } from "@/lib/store/ui";
import { site } from "@/lib/site";

function WhatsAppGlyph({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden>
      <path d="M16.001 3.2C9.05 3.2 3.4 8.85 3.4 15.8c0 2.23.59 4.4 1.71 6.32L3.2 28.8l6.86-1.8a12.55 12.55 0 0 0 5.94 1.51h.005c6.95 0 12.6-5.65 12.6-12.6 0-3.37-1.31-6.53-3.69-8.91A12.5 12.5 0 0 0 16 3.2Zm0 22.87h-.004a10.45 10.45 0 0 1-5.32-1.46l-.38-.22-3.95 1.04 1.05-3.85-.25-.4a10.42 10.42 0 0 1-1.6-5.58c0-5.77 4.7-10.46 10.47-10.46 2.8 0 5.42 1.09 7.4 3.07a10.4 10.4 0 0 1 3.06 7.4c0 5.77-4.7 10.46-10.47 10.46Zm5.74-7.83c-.31-.16-1.86-.92-2.15-1.02-.29-.11-.5-.16-.71.16-.21.31-.82 1.02-1 1.23-.18.21-.37.24-.68.08-.31-.16-1.33-.49-2.53-1.56-.94-.83-1.57-1.86-1.75-2.17-.18-.31-.02-.48.14-.63.14-.14.31-.37.47-.55.16-.19.21-.32.31-.53.11-.21.05-.4-.03-.55-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.53-.71-.54-.18-.01-.4-.01-.61-.01-.21 0-.55.08-.84.4-.29.31-1.1 1.08-1.1 2.63 0 1.55 1.13 3.05 1.29 3.26.16.21 2.22 3.39 5.38 4.76.75.32 1.34.52 1.8.66.76.24 1.44.21 1.98.13.6-.09 1.86-.76 2.12-1.5.26-.73.26-1.36.18-1.49-.08-.13-.29-.21-.6-.37Z" />
    </svg>
  );
}

export function WhatsAppWidget() {
  const chatOpen = useUI((s) => s.chatOpen);
  const [showTooltip, setShowTooltip] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowTooltip(true), 4000);
    const t2 = setTimeout(() => setShowTooltip(false), 12000);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  const href = `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(
    "Hello Buckingham Kennel 👋 I'd like to know more about your dogs and puppies."
  )}`;

  return (
    <AnimatePresence>
      {!chatOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed bottom-[5.5rem] right-5 z-[69] flex items-center gap-2"
        >
          <AnimatePresence>
            {showTooltip && !dismissed && (
              <motion.div
                initial={{ opacity: 0, x: 10, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.9 }}
                className="relative rounded-2xl rounded-br-sm glass-strong px-3.5 py-2 pr-7 text-sm shadow-soft"
              >
                Chat with us on WhatsApp 🐾
                <button
                  onClick={() => setDismissed(true)}
                  aria-label="Dismiss"
                  className="absolute right-1.5 top-1.5 text-muted hover:text-foreground"
                >
                  <X size={12} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onMouseEnter={() => setShowTooltip(true)}
            className="relative grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-soft"
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30" />
            <WhatsAppGlyph />
          </motion.a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
