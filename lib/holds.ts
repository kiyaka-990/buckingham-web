import { db } from "@/lib/db";

/**
 * Soft reservations.
 *
 * Stock is the hard number and only a confirmed payment moves it — see
 * {@link ./fulfilment.ts}. A hold is the *soft* claim in between: the agent has
 * told a buyer "that one is yours while you pay", and for the next few minutes
 * nobody else should be offered the same puppy.
 *
 * Holds expire on their own. Nothing here can permanently remove a puppy from
 * sale, which is what makes it safe to let an agent place one.
 */

/** Long enough to finish a checkout, short enough that a dropped conversation
 *  does not park a puppy for the afternoon. */
export const HOLD_MINUTES = 30;

/** Nobody, human or agent, can hold more than this many puppies at once. */
const MAX_ACTIVE_HOLDS_PER_CONTACT = 3;

export type HoldResult =
  | { ok: true; expiresAt: Date; minutes: number }
  | { ok: false; reason: string };

const now = () => new Date();

/** Active = placed, not released, not expired. */
const activeWhere = () => ({ releasedAt: null, expiresAt: { gt: now() } });

/** Is this puppy currently held by someone other than `contact`? */
export async function heldByOther(dogSlug: string, contact?: string | null): Promise<boolean> {
  const hold = await db.hold.findFirst({
    where: { dogSlug, ...activeWhere() },
    orderBy: { createdAt: "desc" },
  });
  if (!hold) return false;
  if (contact && hold.contact && hold.contact === contact) return false;
  return true;
}

/**
 * Place a hold. Refuses if the dog is not a sellable, available puppy, or if
 * someone else already holds it — the checks are here rather than at the call
 * site so an agent tool cannot skip them.
 */
export async function placeHold(input: {
  dogSlug: string;
  contact?: string | null;
  source?: "agent" | "checkout";
  orderRef?: string | null;
}): Promise<HoldResult> {
  const dog = await db.dog.findUnique({
    where: { slug: input.dogSlug },
    select: { slug: true, name: true, category: true, status: true, stock: true },
  });

  if (!dog) return { ok: false, reason: "No puppy with that reference is listed." };
  if (dog.category !== "puppy")
    return { ok: false, reason: `${dog.name} is part of the breeding programme and is not for sale.` };
  if (dog.status !== "available" || dog.stock < 1)
    return { ok: false, reason: `${dog.name} is no longer available.` };

  if (await heldByOther(dog.slug, input.contact))
    return { ok: false, reason: `${dog.name} is already being held for another buyer right now.` };

  if (input.contact) {
    const mine = await db.hold.count({ where: { contact: input.contact, ...activeWhere() } });
    if (mine >= MAX_ACTIVE_HOLDS_PER_CONTACT)
      return { ok: false, reason: `There are already ${mine} puppies held against that contact.` };
  }

  const expiresAt = new Date(Date.now() + HOLD_MINUTES * 60_000);
  await db.hold.create({
    data: {
      dogSlug: dog.slug,
      contact: input.contact ?? null,
      source: input.source ?? "agent",
      orderRef: input.orderRef ?? null,
      expiresAt,
    },
  });

  return { ok: true, expiresAt, minutes: HOLD_MINUTES };
}

/** Let a puppy go — explicitly, rather than waiting for the clock. */
export async function releaseHold(dogSlug: string, contact?: string | null): Promise<number> {
  const { count } = await db.hold.updateMany({
    where: { dogSlug, ...(contact ? { contact } : {}), ...activeWhere() },
    data: { releasedAt: now() },
  });
  return count;
}

/** Attach an order reference to whatever hold a buyer is sitting on. */
export async function linkHoldToOrder(dogSlug: string, orderRef: string): Promise<void> {
  await db.hold.updateMany({
    where: { dogSlug, orderRef: null, ...activeWhere() },
    data: { orderRef },
  });
}

/** Slugs currently spoken for, so listings and agent search can skip them. */
export async function heldSlugs(): Promise<Set<string>> {
  const rows = await db.hold.findMany({ where: activeWhere(), select: { dogSlug: true } });
  return new Set(rows.map((r) => r.dogSlug));
}

/** Housekeeping for the cron: mark lapsed holds released so they stop counting. */
export async function expireStaleHolds(): Promise<number> {
  const { count } = await db.hold.updateMany({
    where: { releasedAt: null, expiresAt: { lte: now() } },
    data: { releasedAt: now() },
  });
  return count;
}
