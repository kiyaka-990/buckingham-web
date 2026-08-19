import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/db";

export const runtime = "nodejs";
// Stripe needs the raw, unparsed body to verify the signature.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 501 });
  }

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(secret);

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe webhook] signature verification failed:", (err as Error).message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const ref = session.metadata?.orderId;
        if (ref && session.payment_status === "paid") {
          await db.order.updateMany({
            where: { ref },
            data: { status: "confirmed", paidAt: new Date(), stripeSessionId: session.id },
          });
          console.log(`[stripe webhook] order ${ref} marked paid.`);
        }
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const ref = session.metadata?.orderId;
        if (ref) {
          await db.order.updateMany({ where: { ref, status: "pending" }, data: { status: "cancelled" } });
        }
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const sessionId = typeof charge.payment_intent === "string" ? undefined : charge.payment_intent?.id;
        if (sessionId) {
          await db.order.updateMany({ where: { stripeSessionId: sessionId }, data: { status: "cancelled" } });
        }
        break;
      }
      default:
        // Unhandled event types are acknowledged so Stripe stops retrying.
        break;
    }
  } catch (err) {
    console.error("[stripe webhook] handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
