import { ArrowRight } from "lucide-react";
import { HeroCarousel, type HeroSlide } from "@/components/home/hero-carousel";
import { ParentsRail } from "@/components/home/parents-rail";
import { ShopFront } from "@/components/home/shopfront";
import { Marquee } from "@/components/home/marquee";
import { Testimonials } from "@/components/home/testimonials";
import { FAQ } from "@/components/home/faq";
import { BreedRegister } from "@/components/home/breed-register";
import { PuppySlide } from "@/components/home/puppy-slide";
import { HealthRecords } from "@/components/home/health-records";
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
import { isForSale, PUPPY_PRICE_CEILING, PUPPY_PRICE_FLOOR } from "@/lib/data/catalog";
import { breeds } from "@/lib/data/breeds";
import { formatPrice } from "@/lib/utils";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * The landing carousel.
 *
 * Footage first — the client wanted the AKC Marketplace treatment, where every
 * pane moves rather than sitting still. The Kangal pane is real footage shot at
 * the kennel and it leads. The other three are cut from the kennel's own
 * photographs: each is a three-shot sequence with a slow push, pull and lateral
 * track, cross-faded, rendered to mp4 by scripts/build-clips.sh.
 *
 * They are stand-ins, not a substitute for real footage. Swap any one of them
 * for a genuine clip the moment the kennel sends it — only the src and poster
 * change.
 */
const heroSlides: HeroSlide[] = [
  {
    kind: "video",
    src: "/media/kangal/clip-01.mp4",
    poster: "/media/kangal/pup-02.jpg",
    thumb: "/media/kangal/pup-02.jpg",
    eyebrow: "Filmed at the kennel",
    title: "Guardians raised in the open",
    copy: "Our Kangals grow up on open ground with stock and space, which is the only way this breed comes right. Watch them work, then come and meet them.",
    href: "/breeds/kangal",
    cta: "Meet the Kangals",
  },
  {
    kind: "video",
    src: "/media/clips/puppies.mp4",
    poster: "/media/gsd-black/pup-01.jpg",
    thumb: "/media/gsd-black/pup-01.jpg",
    eyebrow: "For sale now",
    title: `Puppies from ${formatPrice(PUPPY_PRICE_FLOOR)}`,
    copy: `Puppies are the only dogs we sell, and none of them costs more than ${formatPrice(PUPPY_PRICE_CEILING)}. Vaccinated, dewormed, microchipped, vet-checked and health-guaranteed before they leave us.`,
    href: "/puppies",
    cta: "See the puppies",
  },
  {
    kind: "video",
    src: "/media/clips/breeds.mp4",
    poster: "/media/white-shepherd/adult-02.jpg",
    thumb: "/media/white-shepherd/adult-02.jpg",
    eyebrow: "Our register",
    title: "Five breeds, one standard",
    copy: "Caucasian Shepherd, White Long Coat Swiss Shepherd, Royal Black German Shepherd, American Akita and Kangal — every one raised at our Webuye kennel.",
    href: "/breeds",
    cta: "Browse the breeds",
  },
  {
    kind: "video",
    src: "/media/clips/parents.mp4",
    poster: "/media/akita/adult-01.jpg",
    thumb: "/media/akita/adult-01.jpg",
    eyebrow: "Meet the mothers",
    title: "See the parents before you choose",
    copy: "Suzy, Euro, Romaine, Maya and Felly Atlas live here and are not for sale. Come and meet the mother behind a litter before you put a name to a puppy.",
    href: "/#parents",
    cta: "Meet our mothers",
  },
];

export default async function HomePage() {
  const [featuredList, all, puppies] = await Promise.all([
    getFeaturedDogs(),
    getDogs(),
    getPuppies(),
  ]);
  const featured = featuredList.length ? featuredList : all.slice(0, 8);
  const puppiesAvailable = puppies.filter((d) => d.status === "available");

  // The window is the shop, and the shop is puppies — nothing unpriced in it.
  const windowDogs = puppies.filter(
    (d) => d.images[0] && d.images[0] !== "photo-pending" && d.status !== "sold"
  );

  // The parent dogs, for the rail. Mothers first — that is what was asked for.
  const parents = all.filter(
    (d) => !isForSale(d) && d.images[0] && d.images[0] !== "photo-pending"
  );

  // Featured strip only ever advertises things a visitor can actually buy.
  const featuredPuppies = featured.filter(isForSale);

  return (
    <>
      <HeroCarousel slides={heroSlides} />

      <ShopFront dogs={windowDogs} puppyCount={puppiesAvailable.length} />

      <Marquee
        items={[
          "Imported Parent Dogs",
          "Health Guaranteed",
          "Global Delivery",
          `Puppies ${formatPrice(PUPPY_PRICE_FLOOR)}–${formatPrice(PUPPY_PRICE_CEILING)}`,
          "Since " + site.established,
          "Royal Care",
        ]}
      />

      {/* The register — every breed we keep, and our dogs by birth name.
          This is the client's cover-page requirement. */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading
          eyebrow="Our Breeds"
          title={`The ${breeds.length} breeds we raise — and the dogs behind them`}
          subtitle="Guardians, working shepherds and one very dignified spitz. Every dog below lives at our Webuye kennel under the name on its own vaccination record — these are the parents, not the puppies for sale."
          center
          className="mb-12"
        />
        <BreedRegister />
      </section>

      {/* The mothers, as a card rail — the AKC directory layout the client
          pointed at, with our dams in place of its groomers. */}
      <section id="parents" className="scroll-mt-24 bg-mesh py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="Meet The Mothers"
            title="The dams behind every litter"
            subtitle="These are the mothers — and the fathers standing behind them. None of them is for sale. They are here so you can see the parent before you choose the puppy, and you are welcome to visit them at the kennel."
            center
            className="mb-10"
          />
          <ParentsRail parents={parents} />
        </div>
      </section>

      {/* The puppy slide — the only place on this page that carries a price. */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <PuppySlide puppies={puppies} />
      </section>

      {/* The vaccination cards, shown rather than described — this is the
          evidence behind the health guarantee the puppy slide promises. */}
      <section id="records" className="scroll-mt-24 bg-mesh py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="Proof, Not Promises"
            title="Our vaccination records"
            subtitle="Every dog we keep is vaccinated, dewormed and vet-checked on a schedule, and we keep the card to prove it. Here are the originals — open any one to read it in full."
            center
            className="mb-12"
          />
          <HealthRecords />
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading
          eyebrow="Where To Next"
          title="Find your perfect match"
          subtitle="Whether you seek a devoted family friend or an elite protector, every Buckingham puppy is bred for excellence."
          center
          className="mb-12"
        />
        <CategoryTiles />
      </section>

      {/* Featured puppies */}
      {featuredPuppies.length > 0 && (
        <section className="bg-mesh py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
              <SectionHeading eyebrow="Handpicked" title="Featured puppies" />
              <ButtonLink href="/shop" variant="outline">
                View all <ArrowRight size={16} />
              </ButtonLink>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {featuredPuppies.slice(0, 8).map((d, i) => (
                <DogCard key={d.id} dog={d} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-6 py-20">
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
