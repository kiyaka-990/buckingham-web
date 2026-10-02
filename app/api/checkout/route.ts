import { NextResponse } from "next/server";
import { rateLimit, clientKey, tooMany } from "@/lib/rate-limit";
import { cardEnabled, mpesaEnabled, mustRefuse } from "@/lib/payments";
import { priceCart, persistOrder, createStripeSession, newOrderRef } from "@/lib/orders";

export const runtime = "nodejs";

/**
 * Checkout.
 *
 * The cart is client state and every field in it is attacker-controlled, so
 * nothing the browser sends about a dog is trusted: the slug is the only thing
 * read out of the request, and the name, breed, price and sale status are all
 * re-read from the database in {@link priceCart}. Pricing a Stripe line item
 * from a number in the request body would let anyone buy a puppy for a cent.
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

  const priced = await priceCart(wanted, { contact: customer.email || customer.phone || null });
  if (!priced.ok) return NextResponse.json({ error: priced.error }, { status: priced.status });

  // Refuse a payment method the kennel cannot collect on, before any order is
  // written. Without this, a card order on a site with no live card rail was
  // saved unpaid and the buyer was sent to a success page.
  const wantsMpesa = customer.method === "mpesa";
  if (mustRefuse(wantsMpesa ? mpesaEnabled() : cardEnabled())) {
    return NextResponse.json(
      {
        error: wantsMpesa
          ? "M-Pesa payments aren't switched on yet. Please call or WhatsApp us to reserve."
          : "Card payments aren't available yet. Please pay by M-Pesa, or call or WhatsApp us to reserve.",
      },
      { status: 503 }
    );
  }

  const { items, total } = priced;
  const orderId = newOrderRef();
  const method = customer.method === "mpesa" ? "M-Pesa" : "Card (Stripe)";

  // Real Stripe Checkout when configured.
  if (customer.method !== "mpesa") {
    try {
      const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
      const session = await createStripeSession({
        ref: orderId,
        items,
        total,
        origin,
        email: customer.email || undefined,
      });
      if (session) {
        await persistOrder(orderId, items, customer, total, method, session.id);
        return NextResponse.json({ url: session.url, orderId });
      }
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
  return NextResponse.json({ orderId, total, mock: !process.env.STRIPE_SECRET_KEY });
}
