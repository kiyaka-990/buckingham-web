import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mpesaConfigured, stkPush } from "@/lib/mpesa";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { orderId, phone, amount } = (await req.json()) as { orderId: string; phone: string; amount: number };

  if (!mpesaConfigured()) {
    // Graceful fallback — the checkout UI shows Paybill instructions instead.
    return NextResponse.json({ configured: false });
  }
  if (!orderId || !phone) {
    return NextResponse.json({ configured: true, ok: false, error: "Missing order or phone." }, { status: 400 });
  }

  const result = await stkPush({ phone, amount, accountRef: orderId, description: "Kennel deposit" });

  if (result.ok && result.checkoutRequestId) {
    await db.order.updateMany({ where: { ref: orderId }, data: { mpesaCheckoutId: result.checkoutRequestId } });
  }

  return NextResponse.json({ configured: true, ...result });
}
