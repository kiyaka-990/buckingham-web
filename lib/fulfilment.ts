import { db } from "@/lib/db";
import { sendOrderConfirmation, sendOwnerOrderAlert, type OrderMail } from "@/lib/email";
import { markWon } from "@/lib/leads";

/**
 * Taking a dog off the shelf.
 *
 * Checkout creates an order pending and touches no stock, because anyone can
 * call checkout. Stock moves here instead, once a payment provider has told us
 * money actually arrived.
 *
 * Both callers are webhooks, and webhooks retry: the same event may arrive
 * several times. The status transition is therefore the lock — stock is only
 * adjusted on the update that actually moves the order out of "pending", so a
 * replayed callback finds nothing to do and decrements nothing twice.
 */
export async function confirmOrderPaid(
  where: { ref: string } | { stripeSessionId: string } | { mpesaCheckoutId: string },
  extra: { stripeSessionId?: string; mpesaReceipt?: string } = {}
): Promise<{ confirmed: boolean; ref?: string }> {
  const order = await db.order.findFirst({
    where: { ...where, status: "pending" },
    include: { items: true },
  });

  // Already confirmed, cancelled, or unknown: nothing owed.
  if (!order) return { confirmed: false };

  const { count } = await db.order.updateMany({
    where: { id: order.id, status: "pending" },
    data: {
      status: "confirmed",
      paidAt: new Date(),
      ...(extra.stripeSessionId ? { stripeSessionId: extra.stripeSessionId } : {}),
      ...(extra.mpesaReceipt ? { mpesaReceipt: extra.mpesaReceipt } : {}),
    },
  });

  // Someone else won the race and already confirmed it. Leave stock alone.
  if (count === 0) return { confirmed: false, ref: order.ref };

  for (const item of order.items) {
    if (!item.dogSlug) continue;
    const dog = await db.dog.findUnique({ where: { slug: item.dogSlug } });
    if (!dog) continue;
    const stock = Math.max(0, dog.stock - item.qty);
    await db.dog.update({
      where: { slug: item.dogSlug },
      data: { stock, status: stock === 0 ? "reserved" : dog.status },
    });
  }

  // They bought — stop any nurture sequence immediately. Nothing is more
  // corrosive than a "still interested?" email to someone who already paid.
  if (order.email) await markWon(order.email, order.ref).catch((err) => console.error("[fulfilment] markWon failed", err));

  // Receipts go out only on the update that actually won the race above, so a
  // replayed webhook cannot email the buyer twice. Mail is best-effort: a
  // provider outage must not fail the webhook and trigger endless retries of
  // an order that is already settled.
  const mail: OrderMail = {
    ref: order.ref,
    customerName: order.customerName,
    email: order.email,
    phone: order.phone,
    total: order.total,
    deposit: order.deposit,
    method: order.method,
    items: order.items.map((i) => ({
      name: i.name,
      breedName: i.breedName,
      price: i.price,
      qty: i.qty,
    })),
  };
  const results = await Promise.allSettled([
    order.email ? sendOrderConfirmation(mail) : Promise.resolve({ delivered: false }),
    sendOwnerOrderAlert(mail),
  ]);
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`[fulfilment] ${i === 0 ? "buyer receipt" : "owner alert"} failed for ${order.ref}:`, r.reason);
    }
  });

  return { confirmed: true, ref: order.ref };
}

/** Release a pending order without touching stock — it was never taken. */
export async function cancelPendingOrder(
  where: { ref: string } | { stripeSessionId: string } | { mpesaCheckoutId: string }
): Promise<number> {
  const { count } = await db.order.updateMany({
    where: { ...where, status: "pending" },
    data: { status: "cancelled" },
  });
  return count;
}
