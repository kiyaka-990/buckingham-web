import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PUPPY_PRICE_CEILING } from "@/lib/data/catalog";
import { rateLimit, clientKey, tooMany } from "@/lib/rate-limit";
import { randomBytes } from "node:crypto";

export const runtime = "nodejs";

/**
 * Checkout.
 *
 * The cart is client state and every field in it is attacker-controlled, so
 * nothing the browser sends about a dog is trusted: the slug is the only thing
 * read out of the request, and the name, breed, price and sale status are all
 * re-read from the database. Pricing a Stripe line item from a number in the
 * request body would let anyone buy a puppy for a cent.
 *
 * Stock is *not* decremented here. An order is created pending and the dog is
 * only taken off the shelf once payment actually confirms, in the Stripe
 * webhook or the M-Pesa callback. Reserving on request would let an
 * unauthenticated caller mark the entire kennel sold with a handful of POSTs.
 */

/** Only the slug and quantity survive from the client. */
type CartLine = { slug?: unknown; qty?: unknown };
type Customer = Record<string, string>;

const MAX_LINES = 20;
const MAX_QTY_PER_LINE = 5;

const str = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

/** A positive whole number, or nothing. */
function positiveInt(v: unknown, max: number): number | null {
  const n = Number(v);
  if (!Number.isInteger(n) || n < 1 || n > max) return null;
  return n;
}

export async function POST(req: Request) {
  const limit = await rateLimit("checkout", clientKey(req), 10, 60 * 60_000);
  if (!limit.ok) return tooMany(limit, "Too many checkout attempts. Please try again shortly.");

  let raw: { items?: unknown; customer?: unknown };
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const lines = Array.isArray(raw.items) ? (raw.items as CartLine[]).slice(0, MAX_LINES) : [];
  if (!lines.length) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

  // Collapse to slug -> quantity, discarding anything malformed.
  const wanted = new Map<string, number>();
  for (const line of lines) {
    const slug = str(line.slug, 128);
    const qty = positiveInt(line.qty, MAX_QTY_PER_LINE);
    if (!slug || !qty) {
      return NextResponse.json({ error: "That cart isn't valid. Please rebuild it." }, { status: 400 });
    }
    wanted.set(slug, Math.min(MAX_QTY_PER_LINE, (wanted.get(slug) ?? 0) + qty));
  }

  // The authoritative record for every line.
  const dogs = await db.dog.findMany({
    where: { slug: { in: [...wanted.keys()] } },
    select: {
      slug: true, name: true, breedName: true, price: true,
      category: true, status: true, stock: true, images: true,
    },
  });

  if (dogs.length !== wanted.size) {
    return NextResponse.json({ error: "One of those puppies is no longer listed." }, { status: 400 });
  }

  // The kennel sells puppies only. The UI never offers an adult, but the cart
  // is client state — refuse here so a hand-built cart cannot buy one.
  const notForSale = dogs.filter((d) => d.category !== "puppy");
  if (notForSale.length) {
    return NextResponse.json(
      {
        error: `${notForSale.map((d) => d.name).join(", ")} ${
          notForSale.length === 1 ? "is" : "are"
        } part of our breeding programme and not for sale. We sell puppies only.`,
      },
      { status: 400 }
    );
  }

  const unavailable = dogs.filter((d) => d.status !== "available" || d.stock < (wanted.get(d.slug) ?? 0));
  if (unavailable.length) {
    return NextResponse.json(
      { error: `${unavailable.map((d) => d.name).join(", ")} is no longer available.` },
      { status: 409 }
    );
  }

  // Prices come from the database, never from the request.
  const items = dogs.map((d) => {
    const qty = wanted.get(d.slug) ?? 1;
    let image: string | null = null;
    try {
      const parsed = JSON.parse(d.images) as unknown;
      if (Array.isArray(parsed) && typeof parsed[0] === "string") image = parsed[0];
    } catch {
      /* a malformed images column is not worth failing a sale over */
    }
    return { slug: d.slug, name: d.name, breedName: d.breedName, price: d.price, qty, image };
  });

  // Belt and braces against a bad row in the catalogue: the kennel advertises
  // a hard ceiling, so refuse to charge above it whatever the database says.
  const overCeiling = items.filter((i) => i.price > PUPPY_PRICE_CEILING || i.price <= 0);
  if (overCeiling.length) {
    console.error("[checkout] refusing out-of-band price", overCeiling);
    return NextResponse.json({ error: "Pricing error — please contact us." }, { status: 500 });
  }

  const total = items.reduce((n, i) => n + i.price * i.qty, 0);
  // Unguessable on purpose. The reference is the only thing needed to look
  // up an order's status, and a timestamp-derived one can be enumerated by
  // anyone who knows roughly when an order was placed.
  const orderId = "BK-" + randomBytes(8).toString("base64url").toUpperCase().replace(/[-_]/g, "");

  const customerRaw = (raw.customer ?? {}) as Customer;
  const customer = {
    firstName: str(customerRaw.firstName, 80),
    lastName: str(customerRaw.lastName, 80),
    name: str(customerRaw.name, 160),
    email: str(customerRaw.email, 160).toLowerCase(),
    phone: str(customerRaw.phone, 40),
    address: str(customerRaw.address, 240),
    city: str(customerRaw.city, 80),
    county: str(customerRaw.county, 80),
    method: customerRaw.method === "mpesa" ? "mpesa" : "card",
  };

  const method = customer.method === "mpesa" ? "M-Pesa" : "Card (Stripe)";
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  // Real Stripe Checkout when configured.
  if (stripeKey && customer.method !== "mpesa") {
    try {
      const { default: Stripe } = await import("stripe");
      const stripe = new Stripe(stripeKey);
      const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: items.map((i) => ({
          quantity: i.qty,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(i.price * 100),
            product_data: { name: `${i.name} — ${i.breedName}` },
          },
        })),
        success_url: `${origin}/checkout/success?order=${orderId}`,
        cancel_url: `${origin}/checkout`,
        metadata: { orderId },
      });
      await persistOrder(orderId, items, customer, total, method, session.id);
      return NextResponse.json({ url: session.url, orderId });
    } catch (err) {
      // A Stripe failure must not fall through to "order placed" — that would
      // record an unpaid order as though money had changed hands.
      console.error("[checkout] stripe error", err);
      return NextResponse.json(
        { error: "We couldn't start the payment. Please try again or contact us." },
        { status: 502 }
      );
    }
  }

  await persistOrder(orderId, items, customer, total, method);
  return NextResponse.json({ orderId, total, mock: !stripeKey });
}

type PricedItem = {
  slug: string; name: string; breedName: string;
  price: number; qty: number; image: string | null;
};

async function persistOrder(
  ref: string,
  items: PricedItem[],
  customer: Record<string, string>,
  total: number,
  method: string,
  stripeSessionId?: string
) {
  await db.order.create({
    data: {
      ref,
      customerName:
        [customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.name || "Guest",
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
          dogSlug: i.slug,
          name: i.name,
          breedName: i.breedName,
          price: i.price,
          qty: i.qty,
          image: i.image,
        })),
      },
    },
  });
}
