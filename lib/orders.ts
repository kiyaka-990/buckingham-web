import { db } from "@/lib/db";
import { PUPPY_PRICE_CEILING, depositFor } from "@/lib/data/catalog";
import { heldByOther, linkHoldToOrder } from "@/lib/holds";
import { randomBytes } from "node:crypto";

/**
 * Order creation, shared by the checkout endpoint and the sales agent.
 *
 * Both callers reach the same code on purpose. The rule that matters — a price
 * is whatever the database says and never what the caller says — has to hold
 * for an agent-raised order exactly as it does for a cart POST, and the only
 * way to guarantee that is to have one implementation of it.
 */

export type PricedItem = {
  slug: string;
  name: string;
  breedName: string;
  price: number;
  qty: number;
  image: string | null;
};

export type PriceFailure = { ok: false; error: string; status: number };
export type PriceSuccess = { ok: true; items: PricedItem[]; total: number };

/** An unguessable reference — the only token needed to look an order up. */
export const newOrderRef = () =>
  "BK-" + randomBytes(8).toString("base64url").toUpperCase().replace(/[-_]/g, "");

/**
 * Turn a slug → quantity map into priced lines, or explain why not.
 *
 * Every guard the checkout endpoint relied on lives here: the row must exist,
 * be a puppy, be available, have stock, and carry a price inside the
 * advertised band.
 */
export async function priceCart(
  wanted: Map<string, number>,
  opts: { contact?: string | null } = {}
): Promise<PriceSuccess | PriceFailure> {
  if (wanted.size === 0) return { ok: false, error: "Cart is empty", status: 400 };

  const dogs = await db.dog.findMany({
    where: { slug: { in: [...wanted.keys()] } },
    select: {
      slug: true, name: true, breedName: true, price: true,
      category: true, status: true, stock: true, images: true,
    },
  });

  if (dogs.length !== wanted.size)
    return { ok: false, error: "One of those puppies is no longer listed.", status: 400 };

  // The kennel sells puppies only. The UI never offers an adult, but the cart
  // is client state — refuse here so a hand-built cart cannot buy one.
  const notForSale = dogs.filter((d) => d.category !== "puppy");
  if (notForSale.length) {
    return {
      ok: false,
      status: 400,
      error: `${notForSale.map((d) => d.name).join(", ")} ${
        notForSale.length === 1 ? "is" : "are"
      } part of our breeding programme and not for sale. We sell puppies only.`,
    };
  }

  const unavailable = dogs.filter((d) => d.status !== "available" || d.stock < (wanted.get(d.slug) ?? 0));
  if (unavailable.length) {
    return {
      ok: false,
      status: 409,
      error: `${unavailable.map((d) => d.name).join(", ")} is no longer available.`,
    };
  }

  // Someone else is mid-purchase on this puppy.
  for (const d of dogs) {
    if (await heldByOther(d.slug, opts.contact)) {
      return {
        ok: false,
        status: 409,
        error: `${d.name} is being held for another buyer at the moment. Please try again shortly or ask us about a littermate.`,
      };
    }
  }

  // Prices come from the database, never from the request.
  const items: PricedItem[] = dogs.map((d) => {
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
    console.error("[orders] refusing out-of-band price", overCeiling);
    return { ok: false, error: "Pricing error — please contact us.", status: 500 };
  }

  return { ok: true, items, total: items.reduce((n, i) => n + i.price * i.qty, 0) };
}

export async function persistOrder(
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
      deposit: depositFor(total),
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

  // Whatever soft hold the buyer was sitting on now belongs to this order.
  for (const i of items) await linkHoldToOrder(i.slug, ref);
}

/**
 * A Stripe Checkout session for an order.
 *
 * Charges the deposit rather than the full amount, matching the M-Pesa rail and
 * what the site promises. Returns null when Stripe is not configured, so the
 * caller can fall back rather than fail.
 */
export async function createStripeSession(input: {
  ref: string;
  items: PricedItem[];
  total: number;
  origin: string;
  email?: string;
}): Promise<{ id: string; url: string | null } | null> {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return null;

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(stripeKey);

  const charge = depositFor(input.total);
  const chargingDeposit = charge > 0 && charge < input.total;
  const summary = input.items.map((i) => `${i.name} (${i.breedName})`).join(", ");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    ...(input.email ? { customer_email: input.email } : {}),
    line_items: chargingDeposit
      ? [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: Math.round(charge * 100),
              product_data: {
                name: `Reservation deposit — ${summary}`.slice(0, 250),
                description: `Deposit of ${charge} USD against a total of ${input.total} USD. Balance of ${
                  input.total - charge
                } USD due on collection or before delivery.`.slice(0, 250),
              },
            },
          },
        ]
      : input.items.map((i) => ({
          quantity: i.qty,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(i.price * 100),
            product_data: { name: `${i.name} — ${i.breedName}` },
          },
        })),
    success_url: `${input.origin}/checkout/success?order=${input.ref}`,
    cancel_url: `${input.origin}/checkout`,
    metadata: { orderId: input.ref },
  });

  return { id: session.id, url: session.url };
}
