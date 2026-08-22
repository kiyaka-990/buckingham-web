/**
 * Sync the dog catalogue into a live database — and nothing else.
 *
 * `prisma/seed.ts` rebuilds the whole database, and on its way through it wipes
 * `orderItem`, `order` and `message` and replaces them with demo rows. That is
 * fine for a fresh dev database and destructive against production, where those
 * tables hold real customer orders and the leads Duke has captured. This script
 * exists so the catalogue can be corrected in production without touching them.
 *
 * It does three things:
 *   1. upserts every dog in `lib/data/catalog.ts`, keyed on `slug`;
 *   2. deletes the retired listings named in RETIRED, and only those;
 *   3. leaves orders, messages, users, settings and any dog an admin added
 *      through the portal completely alone.
 *
 * Keyed on slug rather than id deliberately: ids are positional
 * (`BK-${1000 + i}`), so removing a seed renumbers everything after it, whereas
 * a slug is derived from the dog's name and stays put. Order items also
 * reference dogs by slug.
 *
 *   npx tsx prisma/sync-dogs.ts            # apply
 *   npx tsx prisma/sync-dogs.ts --dry-run  # report only, no writes
 */

import { createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { dogs } from "../lib/data/catalog";

const db = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");

/**
 * Listings removed on 22 Aug 2026 as unevidenced — no vaccination card,
 * registration or photograph the kennel supplied names any of these dogs.
 * Spelled out rather than inferred by "anything not in the catalogue", so that
 * a dog added through the admin portal is never caught by this script.
 */
const RETIRED = [
  // Unevidenced adults, removed from the catalogue on 22 Aug 2026.
  "kazbek-caucasian-shepherd",
  "lada-caucasian-shepherd",
  "alba-white-swiss-shepherd",
  "aspen-white-swiss-shepherd",
  "neve-white-swiss-shepherd",
  "kaiser-royal-black-shepherd",
  "kenji-american-akita",
  "yuki-american-akita",
  "sivas-kangal",
  "aslan-kangal",

  // Breeds the kennel no longer lists. Production was last seeded before the
  // register was cut to five, so it is still selling these to the public even
  // though neither breed has a page, a photograph or a place in the register.
  "titan-boerboel",
  "duchess-boerboel",
  "rafiki-sable-german-shepherd",
  "nia-sable-german-shepherd",
  "simba-sable-german-shepherd",
  "tumaini-sable-german-shepherd",
  "zuri-sable-german-shepherd",

  // Same vintage, same problem as the ten above: no record names these dogs.
  "bogatyr-caucasian-shepherd",
  "zima-caucasian-shepherd",
  "zara-royal-black-shepherd",
];

/**
 * A primary key that depends on the dog, not on its position in the seed list.
 *
 * The catalogue's own ids are `BK-${1000 + i}`, so they are reassigned every
 * time a seed is added or removed: after the 22 Aug 2026 cull, Rocco inherited
 * BK-1000, which production was already using for Kaiser. Hashing the slug
 * gives an id that is stable across edits and cannot collide with a row that
 * happens to sit at the same index.
 */
const stableId = (slug: string) =>
  `BK-${createHash("sha1").update(slug).digest("hex").slice(0, 8).toUpperCase()}`;

async function main() {
  const target = process.env.DATABASE_URL ?? "";
  const host = target.match(/@([^/?:]+)/)?.[1] ?? "unknown host";
  console.log(`${dryRun ? "[dry run] " : ""}Syncing ${dogs.length} dogs -> ${host}\n`);

  const doomed = await db.dog.findMany({ where: { slug: { in: RETIRED } } });
  for (const d of doomed) console.log(`  delete  ${d.slug}`);
  if (!dryRun && doomed.length) {
    await db.dog.deleteMany({ where: { slug: { in: RETIRED } } });
  }

  let created = 0;
  let updated = 0;

  for (const d of dogs) {
    const data = {
      name: d.name,
      breedSlug: d.breedSlug,
      breedName: d.breedName,
      category: d.category,
      sex: d.sex,
      ageLabel: d.ageLabel,
      color: d.color,
      price: d.price,
      compareAt: d.compareAt ?? null,
      status: d.status,
      stock: d.stock,
      featured: d.featured,
      bestseller: d.bestseller,
      weightKg: d.weightKg,
      rating: d.rating,
      reviews: d.reviews,
      location: d.location,
      description: d.description,
      images: JSON.stringify(d.images),
      traits: JSON.stringify(d.traits),
      pedigree: JSON.stringify(d.pedigree),
      health: JSON.stringify(d.health),
    };

    const existing = await db.dog.findUnique({ where: { slug: d.slug } });
    if (existing) {
      updated++;
      if (!dryRun) await db.dog.update({ where: { slug: d.slug }, data });
      console.log(`  update  ${d.slug}`);
    } else {
      created++;
      if (!dryRun) await db.dog.create({ data: { id: stableId(d.slug), slug: d.slug, ...data } });
      console.log(`  create  ${d.slug}`);
    }
  }

  const [total, orders, messages] = await Promise.all([
    db.dog.count(),
    db.order.count(),
    db.message.count(),
  ]);
  console.log(
    `\n${dryRun ? "[dry run] would be" : "done:"} ${created} created, ${updated} updated, ` +
      `${doomed.length} deleted.\ndogs now ${total} · orders ${orders} (untouched) · messages ${messages} (untouched)`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
