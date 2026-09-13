import { site, phones } from "@/lib/site";
import { formatPrice } from "@/lib/utils";

/**
 * Outbound mail.
 *
 * Resend over plain fetch, the same way {@link ../lib/otp.ts} sends login
 * codes — no extra dependency for what is one HTTP POST.
 *
 * Every function here is *fail-soft*. The only callers are the Stripe webhook
 * and the M-Pesa callback, and those must return 200 or the provider retries
 * the whole event. A mail outage must never roll back a confirmed sale, so
 * failures are logged and swallowed; the order is already safe in the
 * database and visible in the admin either way.
 */

const FROM = () => process.env.ORDER_FROM_EMAIL || "Buckingham Kennel <orders@buckinghamkennel.com>";

/** Where the kennel's own copies land. Falls back to the published address. */
const OWNER_TO = () => process.env.OWNER_ALERT_EMAIL || site.contact.email;

type Mail = {
  to: string | string[];
  subject: string;
  text: string;
  replyTo?: string;
};

async function send(mail: Mail): Promise<{ delivered: boolean }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn(`[email] RESEND_API_KEY unset — not sending "${mail.subject}"`);
    return { delivered: false };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: FROM(),
        to: Array.isArray(mail.to) ? mail.to : [mail.to],
        subject: mail.subject,
        text: mail.text,
        ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      console.warn("[email] delivery failed:", res.status, await res.text().catch(() => ""));
      return { delivered: false };
    }
    return { delivered: true };
  } catch (err) {
    console.warn("[email] delivery threw:", (err as Error).message);
    return { delivered: false };
  }
}

/* ------------------------------------------------------------------ */

export type OrderMail = {
  ref: string;
  customerName: string;
  email: string;
  phone?: string | null;
  total: number;
  deposit: number;
  method: string;
  items: { name: string; breedName: string; price: number; qty: number }[];
};

const lines = (o: OrderMail) =>
  o.items.map((i) => `  · ${i.name} — ${i.breedName}${i.qty > 1 ? ` ×${i.qty}` : ""}  ${formatPrice(i.price * i.qty)}`).join("\n");

const contactBlock = () =>
  `${phones.map((p) => p.display).join(" or ")}\n${site.contact.email}`;

/**
 * Receipt to the buyer, sent the moment a payment provider confirms money.
 *
 * States the balance explicitly when a deposit was taken — a buyer who has
 * paid 30% should never be able to say nobody told them the rest was owed.
 */
export async function sendOrderConfirmation(o: OrderMail) {
  const paid = o.deposit > 0 && o.deposit < o.total ? o.deposit : o.total;
  const balance = o.total - paid;

  const text = [
    `Hello ${o.customerName || "there"},`,
    ``,
    `Your payment has been received and your reservation at ${site.name} is confirmed.`,
    ``,
    `Order reference: ${o.ref}`,
    `Paid via: ${o.method}`,
    ``,
    `Reserved:`,
    lines(o),
    ``,
    `Total:    ${formatPrice(o.total)}`,
    `Paid now: ${formatPrice(paid)}`,
    balance > 0
      ? `Balance:  ${formatPrice(balance)} — due on collection or before delivery.`
      : `Balance:  none — paid in full.`,
    ``,
    `What happens next`,
    `We will call you within one working day to arrange collection or delivery`,
    `and to answer anything outstanding. Your puppy leaves us vaccinated,`,
    `dewormed, microchipped and vet-checked, with its vaccination record and`,
    `written health guarantee.`,
    ``,
    `Visits are by appointment at ${site.contact.address.street}, ${site.contact.address.locality}.`,
    ``,
    `Any questions, just reply to this email or call:`,
    contactBlock(),
    ``,
    `— ${site.name}`,
  ].join("\n");

  return send({
    to: o.email,
    subject: `Order ${o.ref} confirmed — ${site.shortName}`,
    text,
    replyTo: site.contact.email,
  });
}

/**
 * The kennel's own copy. This is the one that matters operationally: without
 * it a sale can complete overnight and nobody knows until someone opens the
 * admin.
 */
export async function sendOwnerOrderAlert(o: OrderMail) {
  const text = [
    `New confirmed order — ${o.ref}`,
    ``,
    `Customer: ${o.customerName}`,
    `Email:    ${o.email}`,
    `Phone:    ${o.phone || "not given"}`,
    `Method:   ${o.method}`,
    ``,
    lines(o),
    ``,
    `Total:    ${formatPrice(o.total)}`,
    `Paid now: ${formatPrice(o.deposit > 0 && o.deposit < o.total ? o.deposit : o.total)}`,
    `Balance:  ${formatPrice(Math.max(0, o.total - (o.deposit > 0 && o.deposit < o.total ? o.deposit : o.total)))}`,
    ``,
    `Open the order: ${process.env.NEXT_PUBLIC_SITE_URL || ""}/admin/orders`,
  ].join("\n");

  return send({
    to: OWNER_TO(),
    subject: `[Order] ${o.ref} — ${o.customerName} — ${formatPrice(o.total)}`,
    text,
    replyTo: o.email || undefined,
  });
}

/**
 * Nudge for an order that was created but never paid. Sent once, by the
 * follow-up cron, and only for card/M-Pesa attempts that stalled.
 */
export async function sendAbandonedOrderNudge(o: OrderMail) {
  const text = [
    `Hello ${o.customerName || "there"},`,
    ``,
    `You started reserving a puppy with us and the payment didn't finish.`,
    `Nothing has been charged, and the puppy is still available right now:`,
    ``,
    lines(o),
    ``,
    `Reference ${o.ref}. If you'd like to pick it back up, reply to this email`,
    `or call us and we'll take it from there — including M-Pesa if that's easier.`,
    ``,
    contactBlock(),
    ``,
    `If you've changed your mind, no problem at all — you can ignore this.`,
    ``,
    `— ${site.name}`,
  ].join("\n");

  return send({
    to: o.email,
    subject: `Still interested? Your reservation ${o.ref}`,
    text,
    replyTo: site.contact.email,
  });
}

/** A lead or viewing request Duke captured, pushed to the owner immediately. */
export async function sendLeadAlert(input: {
  kind: "lead" | "viewing";
  name: string;
  contact: string;
  detail: string;
  body: string;
}) {
  const label = input.kind === "viewing" ? "Viewing request" : "Lead";
  return send({
    to: OWNER_TO(),
    subject: `[${label}] ${input.name} — ${input.detail}`.slice(0, 160),
    text: [
      `${label} captured by Duke, the website sales agent.`,
      ``,
      `Name:    ${input.name}`,
      `Contact: ${input.contact}`,
      ``,
      input.body,
      ``,
      `Inbox: ${process.env.NEXT_PUBLIC_SITE_URL || ""}/admin/messages`,
    ].join("\n"),
    replyTo: input.contact.includes("@") ? input.contact : undefined,
  });
}

/**
 * A follow-up drafted by Ivy, the marketing agent.
 *
 * The unsubscribe line is appended here rather than left to the model — an
 * opt-out that depends on an LLM remembering to include it is not an opt-out.
 */
export async function sendMarketingFollowUp(input: {
  to: string;
  name: string;
  subject: string;
  body: string;
  unsubscribeUrl: string;
}) {
  const text = [
    input.body.trim(),
    ``,
    `— Ivy, ${site.shortName}`,
    contactBlock(),
    ``,
    `———`,
    `You're getting this because you asked us about a puppy. If you'd rather`,
    `not hear from us again, open this link and we'll stop immediately:`,
    input.unsubscribeUrl,
  ].join("\n");

  return send({
    to: input.to,
    subject: input.subject,
    text,
    replyTo: site.contact.email,
  });
}
