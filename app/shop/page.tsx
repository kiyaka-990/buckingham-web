import { heroImages } from "@/lib/data/media";
import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { ShopView } from "@/components/shop/shop-view";
import { SpecialOffers } from "@/components/shop/special-offers";
import { getDogs, getPriceRange } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop Dogs & Puppies",
  description: "Browse our full collection of champion-bred dogs and puppies. Filter by breed, category and price.",
};

export default async function ShopPage() {
  const [dogs, priceRange] = await Promise.all([getDogs(), getPriceRange()]);
  return (
    <>
      <PageHero
        eyebrow="The Collection"
        title="Shop Our Dogs"
        subtitle="Champion bloodlines, health-guaranteed and ready to become the pride of your home."
        image={heroImages.shop}
        crumbs={[{ label: "Shop" }]}
      />
      <SpecialOffers />
      <Suspense fallback={<div className="py-24 text-center text-muted">Loading collection…</div>}>
        <ShopView dogs={dogs} priceRange={priceRange} />
      </Suspense>
    </>
  );
}
