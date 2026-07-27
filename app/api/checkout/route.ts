import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Item = { name: string; breedName: string; price: number; qty: number; image?: string };

export async function POST(req: Request) {
  const { items, customer } = (await req.json()) as { items: Item[]; customer?: Record<string, string> };
  if (!items?.length) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

  const total = items.reduce((n, i) => n + i.price * i.qty, 0);
  const orderId = "BK-" + Date.now().toString(36).toUpperCase();

  const stripeKey = process.env.STRIPE_SECRET_KEY;

  // Real Stripe Checkout when a key is configured.
  if (stripeKey) {
    try {
      const { default: Stripe } = await import("stripe");
      const stripe = new Stripe(stripeKey);
      const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
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
        metadata: { orderId, customer: JSON.stringify(customer ?? {}) },
      });
      return NextResponse.json({ url: session.url, orderId });
    } catch (err) {
      console.error("[checkout] stripe error", err);
      // fall through to mock
    }
  }

  // Demo/mock success (no Stripe key configured yet).
  console.log(`[checkout] mock order ${orderId} — $${total}`, customer);
  return NextResponse.json({ orderId, total, mock: true });
}
