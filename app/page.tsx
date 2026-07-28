import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Tilt } from "@/components/ui/tilt";
import { FadeImage } from "@/components/ui/fade-image";
import { Hero } from "@/components/home/hero";
import { Marquee } from "@/components/home/marquee";
import { FeaturedCarousel } from "@/components/home/featured-carousel";
import { Testimonials } from "@/components/home/testimonials";
import { FAQ } from "@/components/home/faq";
import {
  CategoryTiles,
  StatsBand,
  WhyUs,
  ProcessSteps,
  ShowroomTease,
  CtaBand,
} from "@/components/home/sections";
import { SectionHeading } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { featuredDogs, dogs } from "@/lib/data/catalog";
import { breeds } from "@/lib/data/breeds";
import { site } from "@/lib/site";

export default function HomePage() {
  const featured = featuredDogs.length ? featuredDogs : dogs.slice(0, 8);

  return (
    <>
      <Hero />

      <Marquee items={["Champion Bloodlines", "Health Guaranteed", "Global Delivery", "Elite Training", "Since " + site.established, "Royal Care"]} />

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading
          eyebrow="Shop by Purpose"
          title="Find your perfect match"
          subtitle="Whether you seek a devoted family friend or an elite protector, every Buckingham dog is bred for excellence."
          center
          className="mb-12"
        />
        <CategoryTiles />
      </section>

      {/* Featured carousel */}
      <section className="bg-mesh py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Handpicked" title="Featured Companions" />
            <ButtonLink href="/shop" variant="outline">View all <ArrowRight size={16} /></ButtonLink>
          </div>
          <FeaturedCarousel dogs={featured} />
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <StatsBand />
      </section>

      {/* Breeds */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <SectionHeading
          eyebrow="Our Breeds"
          title="Nine world-class breeds"
          subtitle="From majestic guardians to gentle companions, explore the pedigrees we are proud to raise."
          center
          className="mb-12"
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {breeds.map((b, i) => (
            <Reveal key={b.slug} delay={i % 3}>
              <Tilt className="rounded-3xl" max={8}>
                <Link href={`/breeds/${b.slug}`} className="group relative block h-64 overflow-hidden rounded-3xl">
                  <FadeImage src={b.heroImage} alt={b.name} fill sizes="(max-width:768px) 50vw, 33vw" className="object-cover duotone transition-transform duration-700 group-hover:scale-110" />
                  <span className="shine-hover absolute inset-0 z-10" />
                  <span className="spotlight-overlay z-10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white [transform:translateZ(40px)]">
                    <p className="text-[11px] uppercase tracking-wider text-gold-400">{b.group}</p>
                    <h3 className="font-display text-xl font-bold">{b.name}</h3>
                    <p className="text-sm text-white/70">{b.tagline}</p>
                  </div>
                </Link>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Why us */}
      <section className="bg-mesh py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading eyebrow="The Buckingham Standard" title="Why families choose us" center className="mb-12" />
          <WhyUs />
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading eyebrow="Simple Process" title="From browse to belonging" center className="mb-12" />
        <ProcessSteps />
      </section>

      {/* 3D Showroom tease */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <ShowroomTease />
      </section>

      {/* Testimonials */}
      <section className="bg-mesh py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading eyebrow="Loved by Families" title="Words from our owners" center className="mb-12" />
          <Testimonials />
        </div>
      </section>

      {/* Quote */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <Reveal>
          <p className="font-display text-2xl italic leading-relaxed text-muted sm:text-3xl">
            “{site.quote.text}”
          </p>
          <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-gold-500">— {site.quote.author}</p>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <SectionHeading eyebrow="Good to Know" title="Frequently asked questions" center className="mb-12" />
        <FAQ />
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <CtaBand />
      </section>
    </>
  );
}
