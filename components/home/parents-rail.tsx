"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { FadeImage } from "@/components/ui/fade-image";
import { type Dog } from "@/lib/data/catalog";
import { cn } from "@/lib/utils";

/**
 * The mothers — and the fathers standing behind them.
 *
 * Same card rail the client pointed at on the AKC groomer directory, but the
 * profiles are our dams rather than groomers: a portrait, the dog's own name,
 * her breed and what she does here. None of them is for sale, so no card
 * carries a price — the link goes to the dog, not to a checkout.
 *
 * Dams lead, because those are the ones the client asked for by name.
 */
export function ParentsRail({ parents }: { parents: Dog[] }) {
  const rail = useRef<HTMLDivElement>(null);

  const ordered = [...parents].sort(
    (a, b) => Number(b.sex === "Female") - Number(a.sex === "Female")
  );

  const scroll = (dir: -1 | 1) => {
    const el = rail.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 640), behavior: "smooth" });
  };

  if (ordered.length === 0) return null;

  return (
    <div className="relative">
      <div className="mb-5 flex justify-end gap-2">
        <RailButton dir={-1} onClick={() => scroll(-1)} />
        <RailButton dir={1} onClick={() => scroll(1)} />
      </div>

      <div
        ref={rail}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 no-scrollbar"
      >
        {ordered.map((d) => (
          <article
            key={d.id}
            className="group w-[17rem] shrink-0 snap-start overflow-hidden rounded-3xl border border-border bg-surface shadow-plate transition hover:shadow-lift sm:w-[19rem]"
          >
            <Link href={`/dogs/${d.slug}`} className="block">
              <div className="relative aspect-[4/5] overflow-hidden bg-surface-2">
                <FadeImage
                  src={d.images[0]}
                  alt={`${d.name}, our ${d.breedName} ${d.sex === "Female" ? "dam" : "sire"}`}
                  fill
                  sizes="(max-width:640px) 70vw, 19rem"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                />
                <span
                  className={cn(
                    "absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide",
                    d.sex === "Female"
                      ? "bg-volt-400 text-graphite-950"
                      : "bg-graphite-600 text-white"
                  )}
                >
                  {d.sex === "Female" ? "Mother" : "Father"}
                </span>
                <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-graphite-900">
                  Not for sale
                </span>
              </div>

              <div className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-ink">
                  {d.breedName}
                </p>
                <h3 className="mt-1 font-display text-2xl font-bold leading-tight">{d.name}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                  <MapPin size={12} /> {d.location}, Kenya
                </p>

                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {d.traits.slice(0, 3).map((t) => (
                    <li
                      key={t}
                      className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] text-muted"
                    >
                      {t}
                    </li>
                  ))}
                </ul>

                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink">
                  Meet {d.name} <ArrowRight size={15} />
                </span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

function RailButton({ dir, onClick }: { dir: -1 | 1; onClick: () => void }) {
  const Icon = dir === -1 ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onClick}
      aria-label={dir === -1 ? "Scroll left" : "Scroll right"}
      className="grid h-10 w-10 place-items-center rounded-full border border-border bg-surface text-foreground transition hover:border-volt-400 hover:bg-surface-2"
    >
      <Icon size={18} />
    </button>
  );
}
