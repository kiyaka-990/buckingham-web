import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FadeImage } from "@/components/ui/fade-image";
import { Ruler, Weight, Clock, MapPin } from "lucide-react";
import { getBreed } from "@/lib/data/breeds";
import { getDogsByBreed } from "@/lib/queries";
import { DogCard } from "@/components/shop/dog-card";
import { BreedVideo } from "@/components/breeds/breed-video";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ breed: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { breed } = await params;
  const b = getBreed(breed);
  if (!b) return { title: "Breed not found" };
  return { title: b.name, description: b.description };
}

const statLabels: Record<string, string> = {
  energy: "Energy",
  trainability: "Trainability",
  family: "Family-friendly",
  guarding: "Guarding instinct",
  shedding: "Shedding",
};

export default async function BreedPage({ params }: Params) {
  const { breed } = await params;
  const b = getBreed(breed);
  if (!b) notFound();

  const breedDogs = await getDogsByBreed(b.slug);

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[60vh] items-end overflow-hidden">
        <FadeImage src={b.heroImage} alt={b.name} fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-leaf-950 via-leaf-950/70 to-leaf-950/30" />
        <div className="relative mx-auto w-full max-w-7xl px-6 pb-14 pt-32 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sun-400">{b.group}</p>
          <h1 className="mt-2 font-display text-5xl font-bold sm:text-6xl">{b.name}</h1>
          <p className="mt-3 max-w-xl text-lg text-white/85">{b.tagline}</p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <Spec icon={MapPin} label={b.origin} />
            <Spec icon={Ruler} label={b.height} />
            <Spec icon={Weight} label={b.weight} />
            <Spec icon={Clock} label={b.lifespan} />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1fr_360px]">
        {/* About */}
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl font-bold">About the {b.name}</h2>
            <p className="mt-3 leading-relaxed text-muted">{b.description}</p>
          </div>
          {b.video && (
            <BreedVideo
              src={b.video.src}
              poster={b.video.poster}
              caption={b.video.caption}
              breedName={b.name}
            />
          )}
          <div className="rounded-3xl border border-border bg-surface p-6">
            <h3 className="font-display text-lg font-semibold">Care &amp; Living</h3>
            <p className="mt-2 leading-relaxed text-muted">{b.care}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {b.temperament.map((t) => (
              <span key={t} className="rounded-full bg-sun-400/10 px-4 py-1.5 text-sm font-medium text-accent-ink">{t}</span>
            ))}
          </div>
        </div>

        {/* Stat card */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-border bg-surface p-6">
            <h3 className="font-display text-lg font-semibold">Breed Profile</h3>
            <div className="mt-4 space-y-4">
              {Object.entries(b.stats).map(([key, val]) => (
                <div key={key}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-muted">{statLabels[key]}</span>
                    <span className="font-medium">{val}/5</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-gradient-to-r from-sun-500 to-sun-300" style={{ width: `${(val / 5) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <ButtonLink href={`/shop?breed=${b.slug}`} className="mt-6 w-full">See available {b.name}s</ButtonLink>
          </div>
        </aside>
      </div>

      {/* Available dogs */}
      {breedDogs.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <SectionHeading eyebrow="Available Now" title={`${b.name}s at Buckingham`} className="mb-8" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {breedDogs.map((d, i) => (
              <DogCard key={d.id} dog={d} index={i} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function Spec({ icon: Icon, label }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string }) {
  return (
    <span className="flex items-center gap-2 rounded-full glass px-3 py-1.5">
      <Icon size={14} className="text-sun-400" /> {label}
    </span>
  );
}
