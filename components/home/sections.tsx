import Link from "next/link";
import { ShieldCheck, Dna, Stethoscope, HeartHandshake, ArrowRight, PawPrint } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { FadeImage } from "@/components/ui/fade-image";
import { ButtonLink } from "@/components/ui/button";
import { stats } from "@/lib/data/content";
import { site } from "@/lib/site";

const categories = [
  { title: "Puppies", href: "/puppies", image: "/media/gsd-black/pup-01.jpg", desc: "9–13 week companions from $2,300" },
  { title: "Trained & Protection", href: "/shop?category=trained", image: "/media/gsd-sable/adult-01.jpg", desc: "Titled, handler-ready guardians" },
  { title: "Elite Bloodlines", href: "/shop?category=elite", image: "/media/gsd-black/adult-01.jpg", desc: "Champion pedigree, show quality" },
  { title: "Family Companions", href: "/shop?category=adult", image: "/media/white-shepherd/adult-02.jpg", desc: "Gentle, socialised, ready to love" },
];

export function CategoryTiles() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((c, i) => (
        <Reveal key={c.title} delay={i}>
          <Link href={c.href} className="group relative block h-72 overflow-hidden rounded-3xl">
            <FadeImage src={c.image} alt={c.title} fill sizes="(max-width:768px) 100vw, 25vw" className="object-cover duotone transition-transform duration-700 group-hover:scale-110" />
            <span className="shine-hover absolute inset-0 z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-clay-950/90 via-clay-950/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <h3 className="font-display text-xl font-bold">{c.title}</h3>
              <p className="text-sm text-white/75">{c.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-ochre-400 opacity-0 transition-all group-hover:opacity-100">
                Browse <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}

export function StatsBand() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((s, i) => (
        <Reveal key={s.label} delay={i} className="rounded-3xl border border-border bg-surface p-6 text-center">
          <p className="font-display text-4xl font-bold text-gradient-ochre sm:text-5xl">{s.value}</p>
          <p className="mt-2 text-sm text-muted">{s.label}</p>
        </Reveal>
      ))}
    </div>
  );
}

const pillars = [
  { icon: Dna, title: "Champion Genetics", desc: "Every litter comes from health-tested, titled parents with verifiable 5-generation pedigrees." },
  { icon: Stethoscope, title: "Health First", desc: "Fully vaccinated, dewormed, microchipped and vet-certified with a written health guarantee." },
  { icon: ShieldCheck, title: "Expert Training", desc: "From basic obedience to elite personal protection, delivered by certified handlers." },
  { icon: HeartHandshake, title: "Lifetime Support", desc: "Our relationship never ends at sale — nutrition, training and health guidance for life." },
];

export function WhyUs() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {pillars.map((p, i) => (
        <Reveal key={p.title} delay={i} className="group rounded-3xl border border-border bg-surface p-6 card-hover">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-ochre-400/12 text-accent-ink transition group-hover:bg-ochre-400 group-hover:text-clay-900">
            <p.icon size={26} />
          </div>
          <h3 className="font-display text-lg font-semibold">{p.title}</h3>
          <p className="mt-2 text-sm text-muted">{p.desc}</p>
        </Reveal>
      ))}
    </div>
  );
}

const steps = [
  { n: "01", title: "Browse & Discover", desc: "Explore breeds and dogs online or step into our 3D showroom." },
  { n: "02", title: "Reserve with a Deposit", desc: "Secure your companion via Stripe or M-Pesa in minutes." },
  { n: "03", title: "Health & Handover", desc: "We finalise vet checks, papers and microchipping." },
  { n: "04", title: "Delivered with Care", desc: "Safe delivery to your door — plus lifetime support." },
];

export function ProcessSteps() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => (
        <Reveal key={s.n} delay={i} className="relative">
          <span className="font-display text-6xl font-bold text-ochre-400/25">{s.n}</span>
          <h3 className="mt-2 font-display text-lg font-semibold">{s.title}</h3>
          <p className="mt-1 text-sm text-muted">{s.desc}</p>
          {i < steps.length - 1 && (
            <PawPrint className="absolute -right-3 top-6 hidden text-ochre-400/40 lg:block" size={20} />
          )}
        </Reveal>
      ))}
    </div>
  );
}


export function CtaBand() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-clay-900 p-10 text-center text-white sm:p-16">
      <div className="aurora absolute inset-0 opacity-50" />
      <div className="relative mx-auto max-w-2xl">
        <PawPrint className="mx-auto mb-4 text-ochre-400" size={36} />
        <h2 className="font-display text-3xl font-bold sm:text-4xl md:text-5xl">Ready to meet your royal companion?</h2>
        <p className="mx-auto mt-4 max-w-xl text-clay-50/80">
          Join hundreds of happy families across Kenya and beyond. Our concierge is ready to help you find the perfect match today.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/shop" size="lg">Find Your Dog</ButtonLink>
          <ButtonLink href={`https://wa.me/${site.contact.whatsapp}`} variant="outline" size="lg" className="border-white/40 text-white hover:bg-white/10">
            Chat on WhatsApp
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
