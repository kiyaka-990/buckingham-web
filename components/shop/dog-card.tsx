"use client";

import Link from "next/link";
import { Heart, ShoppingBag, MapPin, BadgeCheck } from "lucide-react";
import { FadeImage } from "@/components/ui/fade-image";
import { motion } from "framer-motion";
import { isForSale, PUPPY_PRICE_FLOOR, type Dog } from "@/lib/data/catalog";
import { formatPrice, cn } from "@/lib/utils";
import { useCart } from "@/lib/store/cart";
import { useWishlist } from "@/lib/store/wishlist";
import { Rating } from "@/components/ui/rating";
import { Tilt } from "@/components/ui/tilt";

const statusStyles: Record<Dog["status"], string> = {
  available: "bg-emerald-500/90 text-white",
  reserved: "bg-ochre-400 text-clay-900",
  sold: "bg-clay-900/80 text-white",
};

export function DogCard({ dog, index = 0 }: { dog: Dog; index?: number }) {
  const add = useCart((s) => s.add);
  const toggleWish = useWishlist((s) => s.toggle);
  const wished = useWishlist((s) => s.ids.includes(dog.id));
  const soldOut = dog.status === "sold";
  // Adults are the breeding programme: named and photographed, never priced.
  const forSale = isForSale(dog);

  return (
    <Tilt max={7} glare={false} className="h-full rounded-3xl">
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface card-hover"
    >
      <Link href={`/dogs/${dog.slug}`} className="relative block aspect-[4/5] overflow-hidden">
        <FadeImage
          src={dog.images[0]}
          alt={`${dog.name}, ${dog.breedName}`}
          fill
          sizes="(max-width:768px) 50vw, 25vw"
          className={cn(
            "object-cover duotone transition-transform duration-700 group-hover:scale-110",
            soldOut && "grayscale"
          )}
        />
        <span className="shine-hover absolute inset-0 z-10" />
        <span className="spotlight-overlay z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-clay-950/45 via-transparent to-transparent opacity-60" />

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide capitalize",
              forSale ? statusStyles[dog.status] : "bg-clay-900/85 text-white"
            )}
          >
            {forSale ? dog.status : "Breeding stock"}
          </span>
          {dog.bestseller && (
            <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-clay-900">
              Bestseller
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWish(dog.id);
          }}
          aria-label="Add to wishlist"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full glass-strong text-foreground transition hover:scale-110"
        >
          <Heart size={16} className={cn(wished && "fill-red-500 text-red-500")} />
        </button>

        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full glass-strong px-2.5 py-1 text-[11px] text-foreground">
          <MapPin size={12} className="text-ochre-400" /> {dog.location}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <Link href={`/breeds/${dog.breedSlug}`} className="text-xs font-medium uppercase tracking-wide text-accent-ink hover:underline">
            {dog.breedName}
          </Link>
          <Rating value={dog.rating} size={12} />
        </div>

        <Link href={`/dogs/${dog.slug}`}>
          <h3 className="font-display text-lg font-semibold leading-tight group-hover:text-accent-ink transition-colors">
            {dog.name}
          </h3>
        </Link>

        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted">
          <span>{dog.sex}</span>·<span>{dog.ageLabel}</span>·<span>{dog.color}</span>
        </p>

        <p className="flex items-center gap-1 text-[11px] text-muted">
          <BadgeCheck size={13} className="text-emerald-500" /> Health guaranteed · KUC registered
        </p>

        {forSale ? (
          <div className="mt-auto flex items-end justify-between gap-2 pt-2">
            <div>
              {dog.compareAt && (
                <span className="mr-1.5 text-xs text-muted line-through">
                  {formatPrice(dog.compareAt)}
                </span>
              )}
              <span className="font-display text-xl font-bold text-foreground">
                {formatPrice(dog.price)}
              </span>
            </div>
            <button
              disabled={soldOut}
              onClick={() =>
                add({
                  id: dog.id,
                  slug: dog.slug,
                  name: dog.name,
                  breedName: dog.breedName,
                  price: dog.price,
                  image: dog.images[0],
                })
              }
              aria-label={`Add ${dog.name} to cart`}
              className="btn-clay grid h-10 w-10 place-items-center rounded-full disabled:cursor-not-allowed disabled:bg-clay-800 disabled:text-white/50"
            >
              <ShoppingBag size={16} />
            </button>
          </div>
        ) : (
          <div className="mt-auto flex items-end justify-between gap-2 pt-2">
            <div>
              <span className="block font-display text-sm font-bold text-foreground">
                Not for sale
              </span>
              <span className="block text-[11px] text-muted">Our breeding stock</span>
            </div>
            <Link
              href="/puppies"
              className="shrink-0 rounded-full border border-ochre-400 px-3 py-1.5 text-[11px] font-semibold text-accent-ink transition hover:bg-ochre-400/10"
            >
              Puppies from {formatPrice(PUPPY_PRICE_FLOOR)}
            </Link>
          </div>
        )}
      </div>
    </motion.article>
    </Tilt>
  );
}
