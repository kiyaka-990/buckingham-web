import Link from "next/link";
import { ArrowRight, CakeSlice } from "lucide-react";
import { FadeImage } from "@/components/ui/fade-image";
import { Reveal } from "@/components/ui/reveal";
import { breedRegister, formatBorn } from "@/lib/data/breeds";

/**
 * The register — every breed we keep, and the dogs in it by birth name.
 *
 * This is the first thing a visitor should be able to read off the cover page:
 * what we breed, and which dogs we actually own. Names come off the dogs' own
 * papers; a birth date is only shown where we hold the vaccination record it
 * was transcribed from.
 */
export function BreedRegister() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {breedRegister.map((b, i) => (
        <Reveal key={b.slug} delay={i % 3}>
          <Link
            href={`/breeds/${b.slug}`}
            className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface card-hover"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <FadeImage
                src={b.heroImage}
                alt={b.name}
                fill
                sizes="(max-width:768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-clay-950/85 via-clay-950/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <p className="text-[11px] uppercase tracking-wider text-ochre-400">{b.group}</p>
                <h3 className="font-display text-xl font-bold leading-tight">{b.name}</h3>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
              <p className="text-sm text-muted">{b.tagline}</p>

              <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-accent-ink">
                Our {b.shortName}s
              </p>
              {/* A breed can be in the programme before its dogs' papers reach
                  us. We say so plainly rather than print a name we can't back. */}
              {b.residents.length === 0 && (
                <p className="mt-2 text-sm text-muted">
                  Names and dates published once we have the papers in hand — call us and
                  we&rsquo;ll walk you through this line today.
                </p>
              )}
              <ul className="mt-2 space-y-2">
                {b.residents.map((r) => (
                  <li
                    key={r.name}
                    className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 border-b border-border/60 pb-2 last:border-0"
                  >
                    <span className="font-display text-base font-semibold text-foreground">
                      {r.name}
                    </span>
                    <span className="text-xs text-muted">
                      {r.sex} · {r.role}
                    </span>
                    {r.born && (
                      <span className="flex w-full items-center gap-1 text-[11px] text-muted">
                        <CakeSlice size={11} className="text-accent-ink" />
                        Born {formatBorn(r.born)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent-ink">
                Explore the breed{" "}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
