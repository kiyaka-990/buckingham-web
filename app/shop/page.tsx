import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { ShopView } from "@/components/shop/shop-view";

export const metadata: Metadata = {
  title: "Shop Dogs & Puppies",
  description: "Browse our full collection of champion-bred dogs and puppies. Filter by breed, category and price.",
};

export default function ShopPage() {
  return (
    <>
      <PageHero
        eyebrow="The Collection"
        title="Shop Our Dogs"
        subtitle="Champion bloodlines, health-guaranteed and ready to become the pride of your home."
        image="/images/dog-34.jpg"
        crumbs={[{ label: "Shop" }]}
      />
      <Suspense fallback={<div className="py-24 text-center text-muted">Loading collection…</div>}>
        <ShopView />
      </Suspense>
    </>
  );
}
