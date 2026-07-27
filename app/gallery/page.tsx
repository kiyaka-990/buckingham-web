import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { GalleryGrid } from "@/components/gallery/gallery-grid";

export const metadata: Metadata = {
  title: "Gallery",
  description: "A visual journey through our kennel, our dogs and our champions.",
};

const images = Array.from({ length: 90 }, (_, i) => `/images/dog-${String(i + 1).padStart(2, "0")}.jpg`);

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Moments Captured"
        title="Gallery"
        subtitle="A window into life at Buckingham — our dogs, our champions, our family."
        image="/images/dog-40.jpg"
        crumbs={[{ label: "Gallery" }]}
      />
      <section className="mx-auto max-w-7xl px-6 py-16">
        <GalleryGrid images={images} />
      </section>
    </>
  );
}
