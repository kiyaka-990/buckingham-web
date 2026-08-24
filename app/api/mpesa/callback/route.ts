import { NextResponse } from "next/server";
import { confirmOrderPaid, cancelPendingOrder } from "@/lib/fulfilment";

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
        const { confirmed } = await confirmOrderPaid(
          { mpesaCheckoutId: checkoutId },
          { mpesaReceipt: receipt ? String(receipt) : undefined }
        );
        console.log(`[mpesa] ${checkoutId} ${confirmed ? "confirmed" : "already settled"} (${receipt})`);
      } else {
        await cancelPendingOrder({ mpesaCheckoutId: checkoutId });
        console.log(`[mpesa] payment failed/cancelled for ${checkoutId}: ${cb?.ResultDesc}`);
      }
    } catch (err) {
      console.error("[mpesa callback] db error", err);
    }
  }

  // Always acknowledge so Safaricom stops retrying.
  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
