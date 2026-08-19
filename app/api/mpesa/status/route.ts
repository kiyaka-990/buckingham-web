import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const orderId = new URL(req.url).searchParams.get("orderId");
  if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

  const order = await db.order.findUnique({ where: { ref: orderId }, select: { status: true, mpesaReceipt: true } });
  if (!order) return NextResponse.json({ status: "unknown" });
  return NextResponse.json({ status: order.status, receipt: order.mpesaReceipt });
}
