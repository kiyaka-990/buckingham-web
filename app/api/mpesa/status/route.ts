import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, clientKey, tooMany } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Poll an order's payment state.
 *
 * The reference is the only credential here, which is why checkout mints an
 * unguessable one. Throttled anyway so the endpoint cannot be used to sweep
 * for valid references.
 */
export async function GET(req: Request) {
  const limit = await rateLimit("mpesa:status", clientKey(req), 120, 10 * 60_000);
  if (!limit.ok) return tooMany(limit);

  const orderId = new URL(req.url).searchParams.get("orderId")?.slice(0, 64);
  if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

  const order = await db.order.findUnique({ where: { ref: orderId }, select: { status: true, mpesaReceipt: true } });
  if (!order) return NextResponse.json({ status: "unknown" });
  return NextResponse.json({ status: order.status, receipt: order.mpesaReceipt });
}
