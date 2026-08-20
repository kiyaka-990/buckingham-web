import { heroImages } from "@/lib/data/media";
import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { Reveal } from "@/components/ui/reveal";
import { ButtonLink } from "@/components/ui/button";
import { services } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "Services",
  description: "Breeding, training, veterinary care, grooming, stud services, delivery and lifetime owner support.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Beyond the Sale"
        title="Our Services"
        subtitle="A full-service kennel — from ethical breeding and elite training to grooming, delivery and lifetime support."
        image={heroImages.services}
        crumbs={[{ label: "Services" }]}
      />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.slug} delay={i % 3}>
              <div className="group h-full rounded-3xl border border-border bg-surface p-7 card-hover">
                <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-sun-400/12 text-accent-ink transition group-hover:bg-sun-400 group-hover:text-leaf-900">
                  <s.icon size={26} />
                </div>
                <h3 className="font-display text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted">{s.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-leaf-900 p-10 text-center text-white sm:p-16">
          <div className="aurora absolute inset-0 opacity-50" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Tailored programs for every owner</h2>
            <p className="mx-auto mt-4 max-w-xl text-leaf-50/80">Talk to our team about a package combining the perfect dog, training and delivery for your needs.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/contact">Request a Consultation</ButtonLink>
              <ButtonLink href="/shop" variant="outline" className="border-white/40 text-white hover:bg-white/10">Browse Dogs</ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
