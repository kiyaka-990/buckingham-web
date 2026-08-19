import { heroImages, galleryImages } from "@/lib/data/media";
import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { GalleryGrid } from "@/components/gallery/gallery-grid";

export const metadata: Metadata = {
  title: "Gallery",
  description: "A visual journey through our kennel, our dogs and our champions.",
};

const images = galleryImages;

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Moments Captured"
        title="Gallery"
        subtitle="A window into life at Buckingham — our dogs, our champions, our family."
        image={heroImages.gallery}
        crumbs={[{ label: "Gallery" }]}
      />
      <section className="mx-auto max-w-7xl px-6 py-16">
        <GalleryGrid images={images} />
      </section>
    </>
  );
}
