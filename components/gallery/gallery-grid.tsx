"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function GalleryGrid({ images }: { images: string[] }) {
  const [open, setOpen] = useState<number | null>(null);

  const nav = (d: number) => {
    setOpen((o) => (o === null ? null : (o + d + images.length) % images.length));
  };

  return (
    <>
      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3">
        {images.map((src, i) => (
          <motion.button
            key={src}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: (i % 8) * 0.03 }}
            onClick={() => setOpen(i)}
            className="group relative block w-full overflow-hidden rounded-2xl"
          >
            <Image
              src={src}
              alt={`Buckingham dog ${i + 1}`}
              width={400}
              height={500}
              className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-navy-950/0 transition group-hover:bg-navy-950/20" />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-navy-950/90 p-4 backdrop-blur-sm"
            onClick={() => setOpen(null)}
          >
            <button className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full glass text-white" onClick={() => setOpen(null)} aria-label="Close">
              <X />
            </button>
            <button className="absolute left-4 grid h-12 w-12 place-items-center rounded-full glass text-white" onClick={(e) => { e.stopPropagation(); nav(-1); }} aria-label="Previous">
              <ChevronLeft />
            </button>
            <motion.div
              key={open}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative h-[80vh] w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={images[open]} alt="" fill className="rounded-2xl object-contain" />
            </motion.div>
            <button className="absolute right-4 grid h-12 w-12 place-items-center rounded-full glass text-white" onClick={(e) => { e.stopPropagation(); nav(1); }} aria-label="Next">
              <ChevronRight />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
