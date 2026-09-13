import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { expireStaleHolds } from "@/lib/holds";
import { cancelPendingOrder } from "@/lib/fulfilment";
import { sendAbandonedOrderNudge, type OrderMail } from "@/lib/email";
import { recordAgentAction, alreadyDone } from "@/lib/agent/audit";
import { runNurturePass } from "@/lib/agent/marketing-agent";

export const runtime = "nodejs";

/**
 * The work that happens when nobody is on the site.
 *
 * Everything else in this app is request-scoped: when the visitor closes the
 * tab, it stops. Following up on a stalled payment, letting go of a puppy
 * somebody stopped paying for, and closing out orders that were never going to
 * complete all have to happen on a clock instead. Vercel Cron calls this.
 *
 * Every step is idempotent — the schedule can fire twice, or be replayed, and
 * a buyer still only ever gets one nudge.
 */

/** Give a real buyer time to finish paying before chasing them. */
const NUDGE_AFTER_HOURS = 2;
/** Past this, the order is not coming back. */
const ABANDON_AFTER_DAYS = 7;

const hoursAgo = (n: number) => new Date(Date.now() - n * 60 * 60_000);
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60_000);

/**
 * Vercel Cron signs its calls with CRON_SECRET. Without that check this is an
 * open endpoint that emails customers, so it fails closed: no secret set means
 * nobody may call it.
 */
function authorised(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!authorised(req)) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }

  const report = {
    holdsExpired: 0, nudged: 0, abandoned: 0, nurtured: 0,
    // Notes are informational ("nothing to write about today"); errors mean the
    // run actually failed. Conflating them would report a healthy quiet day as
    // a broken job.
    notes: [] as string[],
    errors: [] as string[],
  };

  // 1. Let go of lapsed holds so those puppies can be sold again.
  try {
    report.holdsExpired = await expireStaleHolds();
  } catch (err) {
    report.errors.push(`holds: ${(err as Error).message}`);
  }

  // 2. Nudge orders that stalled mid-payment — once each, never twice.
  try {
    const stalled = await db.order.findMany({
      where: {
        status: "pending",
        createdAt: { lt: hoursAgo(NUDGE_AFTER_HOURS), gt: daysAgo(ABANDON_AFTER_DAYS) },
        email: { not: "" },
      },
      include: { items: true },
      take: 50,
    });

    for (const order of stalled) {
      if (await alreadyDone("abandoned_nudge", order.ref)) continue;

      const mail: OrderMail = {
        ref: order.ref,
        customerName: order.customerName,
        email: order.email,
        phone: order.phone,
        total: order.total,
        deposit: order.deposit,
        method: order.method,
        items: order.items.map((i) => ({
          name: i.name, breedName: i.breedName, price: i.price, qty: i.qty,
        })),
      };

      const { delivered } = await sendAbandonedOrderNudge(mail);
      // Recorded either way: a failed send that is never marked would be
      // retried on every run, which is how a customer ends up with forty
      // emails the day the mail provider comes back.
      await recordAgentAction({
        agent: "follow-up-cron",
        action: "abandoned_nudge",
        status: delivered ? "done" : "failed",
        orderRef: order.ref,
        contact: order.email,
        summary: delivered
          ? `Nudged ${order.email} about stalled order ${order.ref}.`
          : `Nudge for ${order.ref} could not be delivered.`,
        payload: { total: order.total, ageHours: Math.round((Date.now() - order.createdAt.getTime()) / 3_600_000) },
      });
      if (delivered) report.nudged += 1;
    }
  } catch (err) {
    report.errors.push(`nudge: ${(err as Error).message}`);
  }

  // 3. Close out orders that were never paid. Stock was never touched, so this
  //    only tidies the pipeline — nothing is refunded or reversed here.
  try {
    const dead = await db.order.findMany({
      where: { status: "pending", createdAt: { lt: daysAgo(ABANDON_AFTER_DAYS) } },
      select: { ref: true },
      take: 100,
    });
    for (const { ref } of dead) {
      const count = await cancelPendingOrder({ ref });
      if (count > 0) {
        report.abandoned += 1;
        await recordAgentAction({
          agent: "follow-up-cron",
          action: "abandon_order",
          orderRef: ref,
          summary: `Cancelled unpaid order ${ref} after ${ABANDON_AFTER_DAYS} days.`,
        });
      }
    }
  } catch (err) {
    report.errors.push(`abandon: ${(err as Error).message}`);
  }

  // 4. Ivy works the leads nobody closed. Who may be contacted is decided by
  //    dueForFollowUp(), not by the agent.
  try {
    const nurture = await runNurturePass();
    report.nurtured = nurture.sent;
    if (nurture.reasons.length) report.notes.push(...nurture.reasons.slice(0, 5));
  } catch (err) {
    report.errors.push(`nurture: ${(err as Error).message}`);
  }

  console.log("[cron/follow-up]", JSON.stringify(report));
  return NextResponse.json({ ok: report.errors.length === 0, ...report });
}
