import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, BadgeCheck, Search } from "lucide-react";
import { FadeImage } from "@/components/ui/fade-image";
import { ShopFrontHeadline } from "@/components/home/headline";
import { ButtonLink } from "@/components/ui/button";
import { isForSale, PUPPY_PRICE_FLOOR, type Dog } from "@/lib/data/catalog";
import { breeds } from "@/lib/data/breeds";
import { formatPrice } from "@/lib/utils";

/**
 * The shop front.
 *
 * A visitor landing here should feel they have walked through the door of a
 * shop: the goods are the first thing they see, with a way in. The kennel
 * sells puppies only, so puppies fill the window first and are the only panes
 * that carry a price — the parent dogs behind them come after, unpriced.
 */
export function ShopFront({ dogs, puppyCount }: { dogs: Dog[]; puppyCount: number }) {
  // Puppies lead the window; the parents fill in behind them.
  const ordered = [...dogs].sort((a, b) => Number(isForSale(b)) - Number(isForSale(a)));
  const [lead, ...rest] = ordered.slice(0, 5);
  const forSaleNow = dogs.filter(isForSale);
  const from = forSaleNow.length
    ? Math.min(...forSaleNow.map((d) => d.price))
    : PUPPY_PRICE_FLOOR;

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
      {/* Counter line — the greeting you get on walking in */}
      <div className="flex flex-col gap-5 pb-7 md:flex-row md:items-end md:justify-between">
        <ShopFrontHeadline puppyCount={puppyCount} from={formatPrice(from)} />

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <ButtonLink href="/puppies" size="lg" className="shadow-lift">
            Puppies for sale <ArrowRight size={17} />
          </ButtonLink>
          <ButtonLink href="/breeds" variant="outline" size="lg">
            Meet our breeds
          </ButtonLink>
        </div>
      </div>

      {/* The window display: one large, four small — all real stock, all priced */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
        {lead && <Pane dog={lead} large />}
        {rest.map((d) => (
          <Pane key={d.slug} dog={d} />
        ))}
      </div>

      {/* Breed rail — the aisles */}
      <nav aria-label="Shop by breed" className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-surface-2 px-4 py-2 text-sm text-muted">
          <Search size={14} /> Browse by breed
        </span>
        {breeds.map((b) => (
          <Link
            key={b.slug}
            href={`/breeds/${b.slug}`}
            className="shrink-0 rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:border-clay-500 hover:bg-clay-50 hover:text-clay-700 dark:hover:bg-clay-900/40 dark:hover:text-clay-300"
          >
            {b.shortName}
          </Link>
        ))}
      </nav>

      {/* Counter promises */}
      <ul className="mt-5 grid gap-2 sm:grid-cols-3">
        {[
          { icon: BadgeCheck, text: "Puppies only — we keep the parents" },
          { icon: ShieldCheck, text: "Vaccinated, chipped, papered & guaranteed" },
          { icon: Truck, text: "Delivered Kenya-wide & abroad" },
        ].map(({ icon: Icon, text }) => (
          <li
            key={text}
            className="flex items-center gap-2.5 rounded-2xl bg-surface-2 px-4 py-3 text-sm font-medium"
          >
            <Icon size={17} className="shrink-0 text-clay-600 dark:text-clay-400" />
            {text}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** One pane of the shop window. */
function Pane({ dog, large = false }: { dog: Dog; large?: boolean }) {
  return (
    <Link
      href={`/dogs/${dog.slug}`}
      className={`group relative block overflow-hidden rounded-2xl border border-border bg-surface-2 ${
        large ? "lg:col-span-2 lg:row-span-2 aspect-[4/3] lg:aspect-auto" : "aspect-[4/3]"
      }`}
    >
      <FadeImage
        src={dog.images[0]}
        alt={`${dog.name}, ${dog.breedName}`}
        fill
        sizes={large ? "(max-width:1024px) 100vw, 50vw" : "(max-width:640px) 100vw, 25vw"}
        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
      />
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-clay-950/80 via-clay-950/10 to-transparent" />

      {isForSale(dog) ? (
        dog.status !== "available" && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold capitalize text-clay-900">
            {dog.status}
          </span>
        )
      ) : (
        <span className="absolute left-3 top-3 rounded-full bg-clay-950/80 px-2.5 py-1 text-[11px] font-semibold text-white">
          Our breeding stock
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 text-white sm:p-4">
        <span className="min-w-0">
          <span className={`block truncate font-display font-bold ${large ? "text-2xl sm:text-3xl" : "text-lg"}`}>
            {dog.name}
          </span>
          <span className="block truncate text-xs text-white/80">
            {dog.breedName} · {dog.ageLabel}
          </span>
        </span>
        {/* Only puppies are sold, so only puppies show a price. */}
        <span
          className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-bold ${
            isForSale(dog) ? "bg-white text-clay-800" : "bg-white/15 text-white backdrop-blur"
          }`}
        >
          {isForSale(dog) ? formatPrice(dog.price) : "Not for sale"}
        </span>
      </div>
    </Link>
  );
}
