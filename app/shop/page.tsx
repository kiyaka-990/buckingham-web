import { heroImages } from "@/lib/data/media";
import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { ShopView } from "@/components/shop/shop-view";
import { SpecialOffers } from "@/components/shop/special-offers";
import { getPuppies, getPriceRange } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop Puppies",
  description:
    "Browse every puppy we have for sale, $1,300–$1,600. Filter by breed, price and availability.",
};

export default async function ShopPage() {
  const [dogs, priceRange] = await Promise.all([getPuppies(), getPriceRange()]);
  return (
    <>
      <PageHero
        eyebrow="The Collection"
        title="Shop Our Puppies"
subtitle="Puppies are the only thing we sell — $1,300 to $1,600, never more. The parent dogs live with us and are not for sale; you will find them on the home page and on each breed."
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
