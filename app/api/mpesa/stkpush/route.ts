import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stkPush } from "@/lib/mpesa";
import { stkEnabled } from "@/lib/payments";
import { rateLimit, clientKey, tooMany } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Start an M-Pesa STK push against an existing order.
 *
 * The amount is read from the order, not from the request. Taking it from the
 * caller would let anyone charge themselves a shilling for a puppy — the same
 * hole as trusting cart prices at checkout, one step further down the funnel.
 *
 * Only a pending order can be pushed, so a confirmed order cannot be replayed
 * into a second prompt, and an unknown reference is refused outright.
 */
export async function POST(req: Request) {
  const limit = await rateLimit("mpesa:stk", clientKey(req), 10, 30 * 60_000);
  if (!limit.ok) return tooMany(limit, "Too many payment attempts. Please wait before trying again.");

  let orderId = "";
  let phone = "";
  try {
    const body = (await req.json()) as { orderId?: unknown; phone?: unknown };
    orderId = String(body.orderId ?? "").trim().slice(0, 64);
    phone = String(body.phone ?? "").replace(/\D/g, "").slice(0, 15);
  } catch {
    return NextResponse.json({ configured: true, ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (!stkEnabled()) {
    // Graceful fallback — the checkout UI shows Paybill instructions instead.
    return NextResponse.json({ configured: false });
  }
  if (!orderId || phone.length < 9) {
    return NextResponse.json(
      { configured: true, ok: false, error: "Missing order or phone." },
      { status: 400 }
    );
  }

  const order = await db.order.findFirst({
    where: { ref: orderId, status: "pending" },
    select: { ref: true, deposit: true, total: true },
  });
  if (!order) {
    return NextResponse.json(
      { configured: true, ok: false, error: "That order can't be paid — it may already be settled." },
      { status: 404 }
    );
  }

  // The kennel takes a deposit up front, and it is whatever was recorded when
  // the order was created from database prices.
  const amount = Math.max(1, Math.round(order.deposit > 0 ? order.deposit : order.total));

  const result = await stkPush({
    phone,
    amount,
    accountRef: order.ref,
    description: "Kennel deposit",
  });

  if (result.ok && result.checkoutRequestId) {
    await db.order.updateMany({
      where: { ref: order.ref, status: "pending" },
      data: { mpesaCheckoutId: result.checkoutRequestId },
    });
  }

  return NextResponse.json({ configured: true, ...result });
}
