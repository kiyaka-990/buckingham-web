import { heroImages, kennel } from "@/lib/data/media";
import type { Metadata } from "next";
import Image from "next/image";
import { ShieldCheck, Heart, Award, Leaf } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section";
import { StatsBand } from "@/components/home/sections";
import { ButtonLink } from "@/components/ui/button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description: "The story, mission and values behind Buckingham Kennel Limited — Kenya's premier champion kennel.",
};

const values = [
  { icon: Heart, title: "Welfare First", desc: "Our dogs are family. Every decision starts with their health and happiness." },
  { icon: Award, title: "Uncompromising Quality", desc: "Only proven, health-tested bloodlines earn a place in our program." },
  { icon: ShieldCheck, title: "Integrity", desc: "Transparent pedigrees, honest guidance and written guarantees, always." },
  { icon: Leaf, title: "Ethical Breeding", desc: "Responsible, limited litters raised underfoot in a loving home environment." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Story"
        title="About Buckingham"
        subtitle="Where royal heritage meets Kenyan excellence in dog breeding."
        image={heroImages.about}
        crumbs={[{ label: "About" }]}
      />

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
            <Image src={kennel.team[1]} alt="Buckingham Kennel" fill className="object-cover" />
          </div>
        </Reveal>
        <Reveal delay={1} className="space-y-4">
          <SectionHeading eyebrow="Who We Are" title="A legacy of loyalty" />
          <p className="leading-relaxed text-muted">
            Buckingham Kennel Limited was founded on a simple belief: that a great dog can transform a home, a family
            and a life. From our facility in Webuye, Kenya, we keep five guardian and working breeds — the Caucasian
            Shepherd, the White Long Coat Swiss Shepherd, the Royal Black German Shepherd, the American Akita and the
            Kangal.
          </p>
          <p className="leading-relaxed text-muted">
            Our adult dogs are not for sale. They are the breeding programme, and you are welcome to come and meet
            them before you choose. What we sell is their puppies, from $1,600 — every one raised underfoot,
            health-tested, matched thoughtfully to its new family, and supported for life.
          </p>
          <div className="flex flex-wrap gap-4 pt-2 text-sm">
            <span className="rounded-full bg-surface-2 px-4 py-1.5">Reg. No. {site.registration}</span>
            <span className="rounded-full bg-surface-2 px-4 py-1.5">Webuye, Bungoma</span>
            <span className="rounded-full bg-surface-2 px-4 py-1.5">KUC / FCI Standards</span>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <StatsBand />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <SectionHeading eyebrow="What We Stand For" title="Our values" center className="mb-12" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i} className="rounded-3xl border border-border bg-surface p-6 text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-ochre-400/12 text-accent-ink">
                <v.icon size={24} />
              </div>
              <h3 className="font-display text-lg font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm text-muted">{v.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <Reveal>
          <p className="font-display text-2xl italic leading-relaxed text-muted sm:text-3xl">“{site.quote.text}”</p>
          <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-accent-ink">— {site.quote.author}</p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 text-center">
        <ButtonLink href="/puppies" size="lg">See Our Puppies</ButtonLink>
      </section>
    </>
  );
}
