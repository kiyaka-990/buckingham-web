import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { dogs } from "../lib/data/catalog";
import { orders as mockOrders } from "../lib/data/orders";
import { messages as mockMessages } from "../lib/data/admin";
import { site } from "../lib/site";

const db = new PrismaClient();

/**
 * Admin credentials come from the environment, never from the repository.
 *
 * They used to be constants in `lib/site.ts`, which meant the password was in
 * the git history, in the client bundle, and printed on the public login page.
 * Anyone who could read the site could sign in as an administrator. The seed
 * now refuses to run rather than invent a default, because a default admin
 * password is the same hole with a different name.
 */
const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "").toLowerCase().trim();
const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "";

function requireAdminCredentials() {
  if (!adminEmail || !adminPassword) {
    throw new Error(
      "Refusing to seed without SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD.\n" +
        "Set both in your environment, e.g.\n" +
        '  SEED_ADMIN_EMAIL="you@example.com" SEED_ADMIN_PASSWORD="<long random string>" npm run db:seed'
    );
  }
  if (adminPassword.length < 16) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 16 characters.");
  }
}

async function main() {
  console.log("Seeding database…");
  requireAdminCredentials();

  // Admin user (hashed)
  await db.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Kennel Admin",
      role: "admin",
      passwordHash: await bcrypt.hash(adminPassword, 12),
    },
  });

  // Dogs — clear first so retired v1 listings never linger in the shop
  await db.dog.deleteMany();

  // Dogs (upsert by id so re-seeding is safe)
  for (const d of dogs) {
    const data = {
      slug: d.slug,
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
    await db.dog.upsert({ where: { id: d.id }, update: data, create: { id: d.id, ...data } });
  }

  // Reset transactional/demo tables
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.message.deleteMany();

  for (const o of mockOrders) {
    await db.order.create({
      data: {
        ref: o.id,
        customerName: o.customer,
        email: o.email,
        city: o.location,
        county: o.location,
        method: o.payment,
        status: o.status,
        total: o.total,
        deposit: Math.round(o.total * 0.3),
        createdAt: new Date(o.date),
        items: {
          create: o.items.map((i) => ({
            dogSlug: i.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            name: i.name,
            breedName: i.breed,
            price: i.price,
            qty: i.qty,
          })),
        },
      },
    });
  }

  for (const m of mockMessages) {
    await db.message.create({
      data: {
        name: m.name,
        email: m.email,
        channel: m.channel,
        subject: m.subject,
        body: m.preview,
        unread: m.unread,
      },
    });
  }

  const [dogCount, orderCount, msgCount] = await Promise.all([db.dog.count(), db.order.count(), db.message.count()]);
  console.log(`Seeded: ${dogCount} dogs, ${orderCount} orders, ${msgCount} messages, 1 admin.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
