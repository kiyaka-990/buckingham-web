"use client";

import { PawPrint } from "lucide-react";

export function Marquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div className="relative flex overflow-hidden border-y border-border bg-clay-900 py-4 text-clay-50">
      <div className="flex shrink-0 animate-marquee items-center gap-8 pr-8">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-8 whitespace-nowrap font-display text-lg">
            {item}
            <PawPrint size={18} className="text-ochre-400" />
          </span>
        ))}
      </div>
      <div className="flex shrink-0 animate-marquee items-center gap-8 pr-8" aria-hidden>
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-8 whitespace-nowrap font-display text-lg">
            {item}
            <PawPrint size={18} className="text-ochre-400" />
          </span>
        ))}
      </div>
    </div>
  );
}
