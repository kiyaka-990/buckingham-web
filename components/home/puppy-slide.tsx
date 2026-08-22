import Link from "next/link";
import { ArrowRight, PawPrint, Syringe, ShieldCheck } from "lucide-react";
import { FadeImage } from "@/components/ui/fade-image";
import { Reveal } from "@/components/ui/reveal";
import { ButtonLink } from "@/components/ui/button";
import { PUPPY_PRICE_FLOOR, type Dog } from "@/lib/data/catalog";
import { formatPrice } from "@/lib/utils";

/**
 * The puppy slide — the only place on the cover page where money appears.
 *
 * The kennel sells puppies and nothing else, so this section carries the whole
 * price list: every available puppy, its breed, and what it costs. Sorted
 * cheapest first so the advertised "from" price is the first number read.
 */
export function PuppySlide({ puppies }: { puppies: Dog[] }) {
  const list = [...puppies]
    .filter((d) => d.status !== "sold")
    .sort((a, b) => a.price - b.price);

  const from = list.length ? list[0].price : PUPPY_PRICE_FLOOR;

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-clay-900 text-white">
      <div className="aurora pointer-events-none absolute inset-0 opacity-40" />

      <div className="relative p-6 sm:p-10">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ochre-400">
              <PawPrint size={14} /> For sale
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl md:text-5xl">
              Puppies from {formatPrice(from)}
            </h2>
            <p className="mt-3 max-w-xl text-clay-50/80">
              Puppies are the only dogs we sell. Every one leaves us vaccinated, dewormed,
              microchipped and vet-checked, with pedigree papers and a written health guarantee.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/puppies" size="lg">
              See all puppies <ArrowRight size={17} />
            </ButtonLink>
            <ButtonLink
              href="/contact"
              variant="outline"
              size="lg"
              className="border-white/40 text-white hover:bg-white/10"
            >
              Join the waitlist
            </ButtonLink>
          </div>
        </div>

        {/* The price list */}
        {list.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {list.map((d, i) => (
              <Reveal key={d.id} delay={i % 4}>
                <Link
                  href={`/dogs/${d.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-white/10 bg-clay-950/40 backdrop-blur"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <FadeImage
                      src={d.images[0]}
                      alt={`${d.name}, ${d.breedName} puppy`}
                      fill
                      sizes="(max-width:640px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {d.status === "reserved" && (
                      <span className="absolute left-2.5 top-2.5 rounded-full bg-ochre-400 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-clay-900">
                        Reserved
                      </span>
                    )}
                  </div>
                  <div className="p-3.5">
                    <p className="truncate text-[11px] uppercase tracking-wide text-ochre-400">
                      {d.breedName}
                    </p>
                    <p className="truncate font-display text-lg font-bold leading-tight">
                      {d.name}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-white/60">
                      {d.sex} · {d.ageLabel}
                    </p>
                    <p className="mt-2 font-display text-xl font-bold text-ochre-400">
                      {formatPrice(d.price)}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="mt-8 rounded-2xl border border-dashed border-white/20 p-8 text-center text-clay-50/70">
            Every puppy from the current litters is placed. Join the waitlist and we will call you
            first when the next one is born — prices start at {formatPrice(PUPPY_PRICE_FLOOR)}.
          </p>
        )}

        {/* What the price includes */}
        <ul className="mt-6 grid gap-2 sm:grid-cols-3">
          {[
            { icon: Syringe, text: "Vaccinated, dewormed & microchipped" },
            { icon: ShieldCheck, text: "Written health guarantee" },
            { icon: PawPrint, text: "Pedigree papers & lifetime support" },
          ].map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-2.5 rounded-2xl bg-white/8 px-4 py-3 text-sm font-medium"
            >
              <Icon size={17} className="shrink-0 text-ochre-400" />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
