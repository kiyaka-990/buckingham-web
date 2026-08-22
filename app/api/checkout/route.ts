import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

type Item = { slug?: string; name: string; breedName: string; price: number; qty: number; image?: string };
type Customer = Record<string, string>;

async function persistOrder(ref: string, items: Item[], customer: Customer, total: number, method: string, stripeSessionId?: string) {
  await db.order.create({
    data: {
      ref,
      customerName: [customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.name || "Guest",
      email: customer.email || "",
      phone: customer.phone || null,
      address: customer.address || null,
      city: customer.city || null,
      county: customer.county || null,
      method,
      status: "pending",
      total,
      deposit: Math.round(total * 0.3),
      stripeSessionId: stripeSessionId ?? null,
      items: {
        create: items.map((i) => ({
          dogSlug: i.slug ?? "",
          name: i.name,
          breedName: i.breedName,
          price: i.price,
          qty: i.qty,
          image: i.image ?? null,
        })),
      },
    },
  });

  // Decrement stock for known dogs; mark reserved when depleted.
  for (const i of items) {
    if (!i.slug) continue;
    const dog = await db.dog.findUnique({ where: { slug: i.slug } });
    if (!dog) continue;
    const stock = Math.max(0, dog.stock - i.qty);
    await db.dog.update({ where: { slug: i.slug }, data: { stock, status: stock === 0 ? "reserved" : dog.status } });
  }
}

export async function POST(req: Request) {
  const { items, customer } = (await req.json()) as { items: Item[]; customer?: Customer };
  if (!items?.length) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

  // The kennel sells puppies only. The UI never offers an adult, but the cart
  // is client state — refuse here so a stale or hand-built cart cannot buy one.
  const slugs = items.map((i) => i.slug).filter((s): s is string => Boolean(s));
  if (slugs.length) {
    const rows = await db.dog.findMany({
      where: { slug: { in: slugs } },
      select: { slug: true, name: true, category: true },
    });
    const notForSale = rows.filter((r) => r.category !== "puppy");
    if (notForSale.length) {
      return NextResponse.json(
        {
          error: `${notForSale
            .map((r) => r.name)
            .join(", ")} ${notForSale.length === 1 ? "is" : "are"} part of our breeding programme and not for sale. We sell puppies only.`,
        },
        { status: 400 }
      );
    }
  }

  const total = items.reduce((n, i) => n + i.price * i.qty, 0);
  const orderId = "BK-" + Date.now().toString(36).toUpperCase();
  const method = customer?.method === "mpesa" ? "M-Pesa" : "Card (Stripe)";
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  // Real Stripe Checkout when configured.
  if (stripeKey && customer?.method !== "mpesa") {
    try {
      const { default: Stripe } = await import("stripe");
      const stripe = new Stripe(stripeKey);
      const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: items.map((i) => ({
          quantity: i.qty,
          price_data: { currency: "usd", unit_amount: Math.round(i.price * 100), product_data: { name: `${i.name} — ${i.breedName}` } },
        })),
        success_url: `${origin}/checkout/success?order=${orderId}`,
        cancel_url: `${origin}/checkout`,
        metadata: { orderId },
      });
      await persistOrder(orderId, items, customer ?? {}, total, method, session.id);
      return NextResponse.json({ url: session.url, orderId });
    } catch (err) {
      console.error("[checkout] stripe error", err);
      // fall through to persist + mock success
    }
  }

  await persistOrder(orderId, items, customer ?? {}, total, method);
  return NextResponse.json({ orderId, total, mock: !stripeKey });
}
