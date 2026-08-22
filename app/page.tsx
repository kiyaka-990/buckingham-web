import { ArrowRight } from "lucide-react";
import { ShopFront } from "@/components/home/shopfront";
import { Marquee } from "@/components/home/marquee";
import { Testimonials } from "@/components/home/testimonials";
import { FAQ } from "@/components/home/faq";
import { BreedRegister } from "@/components/home/breed-register";
import { PuppySlide } from "@/components/home/puppy-slide";
import {
  CategoryTiles,
  StatsBand,
  WhyUs,
  ProcessSteps,
  CtaBand,
} from "@/components/home/sections";
import { SectionHeading } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { DogCard } from "@/components/shop/dog-card";
import { getFeaturedDogs, getDogs, getPuppies } from "@/lib/queries";
import { breeds } from "@/lib/data/breeds";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredList, all, puppies] = await Promise.all([
    getFeaturedDogs(),
    getDogs(),
    getPuppies(),
  ]);
  const featured = featuredList.length ? featuredList : all.slice(0, 8);
  const puppiesAvailable = puppies.filter((d) => d.status === "available");

  // The window display leads with dogs we can actually show a photograph of.
  const displayDogs = [...featured, ...all]
    .filter((d, i, arr) => arr.findIndex((x) => x.slug === d.slug) === i)
    .filter((d) => d.images[0] && d.images[0] !== "photo-pending" && d.status !== "sold");

  return (
    <>
      <ShopFront dogs={displayDogs} puppyCount={puppiesAvailable.length} />

      <Marquee items={["Champion Bloodlines", "Health Guaranteed", "Global Delivery", "Puppies from $1,600", "Since " + site.established, "Royal Care"]} />

      {/* The register — every breed we keep, and our dogs by birth name.
          This is the client's cover-page requirement and leads the page. */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading
          eyebrow="Our Breeds"
          title={`The ${breeds.length} breeds we raise — and the dogs behind them`}
          subtitle="Guardians, working shepherds and one very dignified spitz. Every dog below lives at our Webuye kennel under the name on its own papers — these are the parents, not the puppies for sale."
          center
          className="mb-12"
        />
        <BreedRegister />
      </section>

      {/* The puppy slide — the only place on this page that carries a price. */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <PuppySlide puppies={puppies} />
      </section>

      {/* Categories */}
      <section className="bg-mesh py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="Shop by Purpose"
            title="Find your perfect match"
            subtitle="Whether you seek a devoted family friend or an elite protector, every Buckingham puppy is bred for excellence."
            center
            className="mb-12"
          />
          <CategoryTiles />
        </div>
      </section>

      {/* Featured carousel */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Handpicked" title="Featured Companions" />
          <ButtonLink href="/shop" variant="outline">View all <ArrowRight size={16} /></ButtonLink>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {featured.slice(0, 8).map((d, i) => (
            <DogCard key={d.id} dog={d} index={i} />
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <StatsBand />
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

      {/* Testimonials */}
      <section className="bg-mesh py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading eyebrow="Loved by Families" title="Words from our owners" center className="mb-12" />
          <Testimonials />
        </div>
      </section>

      {/* Quote */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="font-display text-2xl italic leading-relaxed text-muted sm:text-3xl">
          &ldquo;{site.quote.text}&rdquo;
        </p>
        <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-accent-ink">— {site.quote.author}</p>
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
