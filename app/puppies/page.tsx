import type { Metadata } from "next";
import { Baby, Syringe, HeartHandshake, Sparkles } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { DogCard } from "@/components/shop/dog-card";
import { SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { ButtonLink } from "@/components/ui/button";
import { puppies } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Available Puppies",
  description: "Adorable, health-guaranteed puppies from champion bloodlines. Raised underfoot with early neurological stimulation. From $1,600.",
};

const perks = [
  { icon: Syringe, title: "Vet-Ready", desc: "Vaccinated, dewormed & microchipped before they leave us." },
  { icon: Baby, title: "ENS Raised", desc: "Early neurological stimulation for confident, stable pups." },
  { icon: HeartHandshake, title: "Lifetime Support", desc: "Guidance on feeding, training and health for life." },
  { icon: Sparkles, title: "Health Guarantee", desc: "Written genetic health guarantee up to 36 months." },
];

export default function PuppiesPage() {
  return (
    <>
      <PageHero
        eyebrow="New Litters"
        title="Available Puppies"
        subtitle="Bundles of royal joy, ready to fill your home with love — from $1,600."
        image="/images/dog-70.jpg"
        crumbs={[{ label: "Puppies" }]}
      />

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {perks.map((p, i) => (
            <Reveal key={p.title} delay={i} className="rounded-3xl border border-border bg-surface p-5">
              <p.icon className="mb-3 text-gold-500" />
              <h3 className="font-display font-semibold">{p.title}</h3>
              <p className="mt-1 text-sm text-muted">{p.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <SectionHeading eyebrow="Meet the Little Ones" title={`${puppies.length} puppies looking for a home`} className="mb-8" />
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {puppies.map((d, i) => (
            <DogCard key={d.id} dog={d} index={i} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24 text-center">
        <Reveal className="rounded-3xl border border-border bg-surface p-10">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Don&apos;t see the one? Join our waitlist.</h2>
          <p className="mx-auto mt-3 max-w-lg text-muted">New litters arrive regularly. Tell us your preferred breed and we&apos;ll notify you first.</p>
          <ButtonLink href="/contact" className="mt-6">Join the Waitlist</ButtonLink>
        </Reveal>
      </section>
    </>
  );
}
