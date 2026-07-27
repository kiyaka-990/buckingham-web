import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section";
import { breeds, breedGroups } from "@/lib/data/breeds";
import { dogs } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Our Breeds",
  description: "Explore the nine world-class breeds raised at Buckingham Kennel — from guardians to gentle companions.",
};

export default function BreedsPage() {
  return (
    <>
      <PageHero
        eyebrow="Pedigrees We're Proud Of"
        title="Our Breeds"
        subtitle="Nine distinguished breeds, each raised to the Buckingham standard of health, temperament and type."
        image="/images/dog-03.jpg"
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
                  const count = dogs.filter((d) => d.breedSlug === b.slug && d.status !== "sold").length;
                  return (
                    <Reveal key={b.slug} delay={i % 3}>
                      <Link href={`/breeds/${b.slug}`} className="group block overflow-hidden rounded-3xl border border-border bg-surface card-hover">
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <Image src={b.heroImage} alt={b.name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 to-transparent" />
                          <span className="absolute left-3 top-3 rounded-full glass-strong px-3 py-1 text-xs text-white">{b.origin}</span>
                          {count > 0 && <span className="absolute right-3 top-3 rounded-full bg-gold-400 px-3 py-1 text-xs font-semibold text-navy-900">{count} available</span>}
                        </div>
                        <div className="p-5">
                          <h3 className="font-display text-xl font-bold group-hover:text-gold-500">{b.name}</h3>
                          <p className="mt-1 text-sm text-muted">{b.tagline}</p>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {b.temperament.slice(0, 3).map((t) => (
                              <span key={t} className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs text-muted">{t}</span>
                            ))}
                          </div>
                          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gold-500">
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
