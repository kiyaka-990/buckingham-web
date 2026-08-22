import { heroImages } from "@/lib/data/media";
import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { ShopView } from "@/components/shop/shop-view";
import { SpecialOffers } from "@/components/shop/special-offers";
import { getDogs, getPriceRange } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop Puppies",
  description:
    "Browse the puppies we have for sale, from $1,600, alongside the parent dogs behind every litter. Filter by breed, category and price.",
};

export default async function ShopPage() {
  const [dogs, priceRange] = await Promise.all([getDogs(), getPriceRange()]);
  return (
    <>
      <PageHero
        eyebrow="The Collection"
        title="Shop Our Puppies"
        subtitle="Puppies for sale from $1,600, shown alongside the parent dogs behind them. The adults are our breeding programme and are not for sale."
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
