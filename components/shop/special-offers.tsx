import Link from "next/link";
import { Flame, ArrowRight, Tag } from "lucide-react";
import { getDeals } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";
import { FadeImage } from "@/components/ui/fade-image";

/** Auto-generated "Special Offers" strip from DB dogs on sale (compareAt set). */
export async function SpecialOffers() {
  const deals = await getDeals();
  if (deals.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 pt-10">
      <div className="relative overflow-hidden rounded-[2rem] border border-brass-400/30 bg-royal p-6 sm:p-8">
        <div className="aurora pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-white">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-red-500 to-brass-400 text-forest-900">
                <Flame size={22} />
              </span>
              <div>
                <h2 className="font-display text-2xl font-bold">Special Offers</h2>
                <p className="text-sm text-white/70">Limited-time deals on champion dogs — while they last.</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
              <Tag size={13} className="text-brass-400" /> {deals.length} on sale
            </span>
          </div>

          <div className="flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {deals.map((d) => {
              const pct = Math.round((1 - d.price / (d.compareAt as number)) * 100);
              return (
                <Link
                  key={d.id}
                  href={`/dogs/${d.slug}`}
                  className="group relative w-56 shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 bg-forest-900/40 backdrop-blur"
                >
                  <div className="relative h-40 overflow-hidden">
                    <FadeImage src={d.images[0]} alt={d.name} fill sizes="224px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow">-{pct}%</span>
                    <span className="shine-hover absolute inset-0 z-10" />
                  </div>
                  <div className="p-3 text-white">
                    <p className="text-[11px] uppercase tracking-wide text-brass-400">{d.breedName}</p>
                    <p className="font-display font-semibold leading-tight">{d.name}</p>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="font-display text-lg font-bold text-brass-400">{formatPrice(d.price)}</span>
                      <span className="text-xs text-white/50 line-through">{formatPrice(d.compareAt as number)}</span>
                    </div>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-white/80 transition-all group-hover:gap-2 group-hover:text-brass-400">
                      Grab the deal <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
