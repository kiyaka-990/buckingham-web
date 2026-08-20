import type { Metadata } from "next";
import { Box, MousePointer2, ZoomIn, Sparkles } from "lucide-react";
import { ShowroomLoader } from "@/components/showroom/showroom-loader";
import { SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "3D Virtual Showroom",
  description: "Step into an immersive 3D gallery and meet our finest dogs in real-time — from anywhere in the world.",
};

const tips = [
  { icon: MousePointer2, label: "Drag to orbit the gallery" },
  { icon: ZoomIn, label: "Scroll to zoom in & out" },
  { icon: Box, label: "Click a portrait for details" },
];

export default function ShowroomPage() {
  return (
    <div className="pt-24">
      <section className="mx-auto max-w-7xl px-6">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs font-medium">
            <Sparkles size={14} className="text-ochre-400" /> Immersive Experience
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl md:text-6xl">
            The <span className="text-gradient-ochre">3D Showroom</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Wander through a living gallery of our champions in real-time 3D. Meet your next companion from anywhere.
          </p>
        </div>

        <ShowroomLoader />

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {tips.map((t) => (
            <span key={t.label} className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-muted">
              <t.icon size={15} className="text-accent-ink" /> {t.label}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <Reveal>
          <SectionHeading center title="Prefer the classic view?" subtitle="Browse our full collection in the traditional shop with detailed pedigrees and health records." />
          <ButtonLink href="/shop" size="lg" className="mt-6">Enter the Shop</ButtonLink>
        </Reveal>
      </section>
    </div>
  );
}
