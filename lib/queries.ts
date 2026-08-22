import { db } from "@/lib/db";
import { PUPPY_PRICE_FLOOR, type Dog } from "@/lib/data/catalog";

type DbDog = {
  id: string; slug: string; name: string; breedSlug: string; breedName: string;
  category: string; sex: string; ageLabel: string; color: string; price: number;
  compareAt: number | null; status: string; stock: number; featured: boolean;
  bestseller: boolean; weightKg: number; rating: number; reviews: number;
  location: string; description: string; images: string; traits: string;
  pedigree: string; health: string;
};

export function toDog(r: DbDog): Dog {
  return {
    id: r.id, slug: r.slug, name: r.name, breedSlug: r.breedSlug, breedName: r.breedName,
    category: r.category as Dog["category"], sex: r.sex as Dog["sex"], ageLabel: r.ageLabel,
    color: r.color, price: r.price, compareAt: r.compareAt ?? undefined,
    status: r.status as Dog["status"], stock: r.stock, featured: r.featured,
    bestseller: r.bestseller, weightKg: r.weightKg, rating: r.rating, reviews: r.reviews,
    location: r.location, description: r.description,
    images: JSON.parse(r.images), traits: JSON.parse(r.traits),
    pedigree: JSON.parse(r.pedigree), health: JSON.parse(r.health),
  };
}

export async function getDogs(): Promise<Dog[]> {
  const rows = await db.dog.findMany({ orderBy: [{ featured: "desc" }, { createdAt: "desc" }] });
  return rows.map(toDog);
}

export async function getDog(slug: string): Promise<Dog | null> {
  const row = await db.dog.findUnique({ where: { slug } });
  return row ? toDog(row) : null;
}

export async function getFeaturedDogs(): Promise<Dog[]> {
  const rows = await db.dog.findMany({ where: { featured: true }, orderBy: { rating: "desc" } });
  return rows.map(toDog);
}

export async function getPuppies(): Promise<Dog[]> {
  const rows = await db.dog.findMany({ where: { category: "puppy" } });
  return rows.map(toDog);
}

export async function getDogsByBreed(breedSlug: string): Promise<Dog[]> {
  const rows = await db.dog.findMany({ where: { breedSlug } });
  return rows.map(toDog);
}

/** Offers only ever run on puppies — adults are breeding stock and unpriced. */
export async function getDeals(): Promise<Dog[]> {
  const rows = await db.dog.findMany({
    where: { category: "puppy", NOT: { compareAt: null }, status: { not: "sold" } },
  });
  return rows.map(toDog).filter((d) => d.compareAt && d.compareAt > d.price);
}

export async function getRelated(dog: Dog, count = 4): Promise<Dog[]> {
  const rows = await db.dog.findMany({
    where: { slug: { not: dog.slug }, OR: [{ breedSlug: dog.breedSlug }, { category: dog.category }] },
    take: count,
  });
  return rows.map(toDog);
}

export async function getAvailableCount(): Promise<number> {
  return db.dog.count({ where: { status: "available" } });
}

/**
 * The price range shown in the shop filters.
 *
 * Puppies are the only thing we sell, so they are the only thing that has a
 * price — adults are stored at 0 and would otherwise drag the floor down.
 */
export async function getPriceRange(): Promise<{ min: number; max: number }> {
  const agg = await db.dog.aggregate({
    where: { category: "puppy" },
    _min: { price: true },
    _max: { price: true },
  });
  return { min: agg._min.price ?? PUPPY_PRICE_FLOOR, max: agg._max.price ?? 3000 };
}

/** The advertised "from" price — the cheapest puppy we actually hold. */
export async function getPuppyPriceFrom(): Promise<number> {
  const agg = await db.dog.aggregate({
    where: { category: "puppy", status: { not: "sold" } },
    _min: { price: true },
  });
  return agg._min.price ?? PUPPY_PRICE_FLOOR;
}
