"use client";

import { FadeImage } from "@/components/ui/fade-image";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { Dog } from "@/lib/data/catalog";
import { formatPrice } from "@/lib/utils";
import { Rating } from "@/components/ui/rating";

export function ShowroomOverlay({ dog, onClose }: { dog: Dog; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute bottom-4 right-4 w-[calc(100%-2rem)] max-w-xs overflow-hidden rounded-3xl glass-strong shadow-soft"
    >
      <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-clay-950/50 text-white">
        <X size={16} />
      </button>
      <div className="relative h-40">
        <FadeImage src={dog.images[0]} alt={dog.name} fill className="object-cover" />
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-accent-ink">{dog.breedName}</p>
        <h3 className="font-display text-xl font-bold">{dog.name}</h3>
        <div className="mt-1"><Rating value={dog.rating} reviews={dog.reviews} /></div>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-display text-lg font-bold text-accent-ink">{formatPrice(dog.price)}</span>
          <Link href={`/dogs/${dog.slug}`} className="btn-clay flex items-center gap-1 rounded-full px-4 py-2 text-sm">
            View <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
