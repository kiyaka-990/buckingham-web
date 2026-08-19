"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/store/wishlist";
import { dogs } from "@/lib/data/catalog";
import { DogCard } from "@/components/shop/dog-card";
import { ButtonLink } from "@/components/ui/button";

export default function WishlistPage() {
  const ids = useWishlist((s) => s.ids);
  const list = dogs.filter((d) => ids.includes(d.id));

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-28">
      <div className="flex items-center gap-3">
        <Heart className="text-brass-500" />
        <h1 className="font-display text-4xl font-bold">My Wishlist</h1>
      </div>

      {list.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-24 text-center">
          <Heart size={44} className="mb-4 text-muted" />
          <p className="text-muted">Your wishlist is empty. Tap the heart on any dog to save it here.</p>
          <ButtonLink href="/shop" className="mt-6">Browse Dogs</ButtonLink>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {list.map((d, i) => <DogCard key={d.id} dog={d} index={i} />)}
        </div>
      )}
    </div>
  );
}
