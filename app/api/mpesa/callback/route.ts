import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Safaricom posts the STK result here. Must always ack with 200. */
export async function POST(req: Request) {
  let body: {
    Body?: {
      stkCallback?: {
        CheckoutRequestID?: string;
        ResultCode?: number;
        ResultDesc?: string;
        CallbackMetadata?: { Item?: { Name: string; Value?: string | number }[] };
      };
    };
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  const cb = body?.Body?.stkCallback;
  const checkoutId = cb?.CheckoutRequestID;

  if (checkoutId) {
    try {
      if (cb?.ResultCode === 0) {
        const receipt = cb.CallbackMetadata?.Item?.find((i) => i.Name === "MpesaReceiptNumber")?.Value;
        await db.order.updateMany({
          where: { mpesaCheckoutId: checkoutId },
          data: { status: "confirmed", paidAt: new Date(), mpesaReceipt: receipt ? String(receipt) : null },
        });
        console.log(`[mpesa] payment confirmed for ${checkoutId} (${receipt})`);
      } else {
        await db.order.updateMany({ where: { mpesaCheckoutId: checkoutId, status: "pending" }, data: { status: "cancelled" } });
        console.log(`[mpesa] payment failed/cancelled for ${checkoutId}: ${cb?.ResultDesc}`);
      }
    } catch (err) {
      console.error("[mpesa callback] db error", err);
    }
  }

  // Always acknowledge so Safaricom stops retrying.
  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
