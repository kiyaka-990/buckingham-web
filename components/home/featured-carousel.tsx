"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Dog } from "@/lib/data/catalog";
import { DogCard } from "@/components/shop/dog-card";

export function FeaturedCarousel({ dogs }: { dogs: Dog[] }) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: -1 | 1) => {
    ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div className="absolute -top-16 right-0 hidden gap-2 sm:flex">
        <button onClick={() => scroll(-1)} aria-label="Previous" className="grid h-11 w-11 place-items-center rounded-full border border-border transition hover:border-gold-400 hover:text-gold-500">
          <ChevronLeft size={18} />
        </button>
        <button onClick={() => scroll(1)} aria-label="Next" className="grid h-11 w-11 place-items-center rounded-full border border-border transition hover:border-gold-400 hover:text-gold-500">
          <ChevronRight size={18} />
        </button>
      </div>

      <div
        ref={ref}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {dogs.map((dog, i) => (
          <div key={dog.id} className="w-[75vw] shrink-0 snap-start sm:w-[300px]">
            <DogCard dog={dog} index={i} />
          </div>
        ))}
      </div>
    </div>
  );
}
