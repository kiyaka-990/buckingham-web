import { heroImages } from "@/lib/data/media";
import type { Metadata } from "next";
import { FadeImage } from "@/components/ui/fade-image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section";
import { breeds, breedGroups } from "@/lib/data/breeds";
import { dogs } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Our Breeds",
  description:
    "Explore the five guardian and working breeds raised at Buckingham Kennel — Caucasian Shepherd, White Long Coat Swiss Shepherd, Royal Black German Shepherd, American Akita and Kangal.",
};

export default function BreedsPage() {
  return (
    <>
      <PageHero
        eyebrow="Pedigrees We're Proud Of"
        title="Our Breeds"
        subtitle="Five distinguished breeds, each raised to the Buckingham standard of health, temperament and type. We keep the parents — the puppies go home with you, from $1,600."
        image={heroImages.breeds}
        crumbs={[{ label: "Breeds" }]}
      />

      <div className="mx-auto max-w-7xl space-y-16 px-6 py-16">
        {breedGroups.map((group) => {
          const list = breeds.filter((b) => b.group === group);
          if (!list.length) return null;
          return (
            <section key={group}>
              <SectionHeading eyebrow="Category" title={group} className="mb-8" />
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {list.map((b, i) => {
                  // Only puppies are for sale, so only puppies are "available".
                  const count = dogs.filter(
                    (d) => d.breedSlug === b.slug && d.category === "puppy" && d.status === "available"
                  ).length;
                  return (
                    <Reveal key={b.slug} delay={i % 3}>
                      <Link href={`/breeds/${b.slug}`} className="group block overflow-hidden rounded-3xl border border-border bg-surface card-hover">
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <FadeImage src={b.heroImage} alt={b.name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-clay-950/70 to-transparent" />
                          <span className="absolute left-3 top-3 rounded-full glass-strong px-3 py-1 text-xs text-white">{b.origin}</span>
                          {count > 0 && <span className="absolute right-3 top-3 rounded-full bg-ochre-400 px-3 py-1 text-xs font-semibold text-clay-900">{count} {count === 1 ? "puppy" : "puppies"}</span>}
                        </div>
                        <div className="p-5">
                          <h3 className="font-display text-xl font-bold group-hover:text-accent-ink">{b.name}</h3>
                          <p className="mt-1 text-sm text-muted">{b.tagline}</p>
                          <p className="mt-2 text-xs text-muted">
                            <span className="font-semibold text-accent-ink">Our dogs:</span>{" "}
                            {b.residents.map((r) => r.name).join(", ")}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {b.temperament.slice(0, 3).map((t) => (
                              <span key={t} className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs text-muted">{t}</span>
                            ))}
                          </div>
                          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent-ink">
                            Explore breed <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                          </span>
                        </div>
                      </Link>
                    </Reveal>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
