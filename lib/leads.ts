import { db } from "@/lib/db";
import { randomBytes } from "node:crypto";

/**
 * The lead pipeline.
 *
 * Rules about who may be contacted live here rather than in the agent, because
 * an agent that can email people must not also be the thing that decides
 * whether emailing them is allowed. Everything outbound goes through
 * {@link dueForFollowUp} and {@link recordTouch}, and both refuse to bend.
 */

/** Nobody gets more than this many outbound emails from us, ever. */
export const MAX_TOUCHES = 3;

/** Minimum gap between touches. A lead that just heard from us waits. */
export const TOUCH_GAP_DAYS = 3;

/** A lead nobody has engaged with after this long is dead; stop contacting. */
export const LEAD_EXPIRY_DAYS = 45;

export type LeadStage =
  | "new" | "qualified" | "nurturing" | "hot" | "won" | "lost" | "unsubscribed";

const days = (n: number) => n * 24 * 60 * 60_000;

/**
 * Record a lead, or enrich the one that already exists for this email.
 *
 * Upsert rather than insert: the same person often chats twice before buying,
 * and a second conversation should sharpen the record we already hold rather
 * than create a duplicate that gets emailed twice.
 */
export async function captureLead(input: {
  name: string;
  email: string;
  phone?: string | null;
  source?: "chat" | "form" | "checkout";
  interest?: string | null;
  breedSlug?: string | null;
  dogSlug?: string | null;
  budgetUsd?: number | null;
  location?: string | null;
  notes?: string | null;
  score?: number | null;
}) {
  const email = input.email.trim().toLowerCase();
  const existing = await db.lead.findFirst({ where: { email } });

  // Never resurrect someone who opted out, and never reset their stage.
  if (existing?.unsubscribedAt) return existing;

  const score = Math.max(0, Math.min(100, input.score ?? 0));
  const common = {
    name: input.name.slice(0, 160),
    phone: input.phone ?? existing?.phone ?? null,
    interest: input.interest ?? existing?.interest ?? null,
    breedSlug: input.breedSlug ?? existing?.breedSlug ?? null,
    dogSlug: input.dogSlug ?? existing?.dogSlug ?? null,
    budgetUsd: input.budgetUsd ?? existing?.budgetUsd ?? null,
    location: input.location ?? existing?.location ?? null,
    notes: input.notes ?? existing?.notes ?? null,
  };

  if (existing) {
    return db.lead.update({
      where: { id: existing.id },
      data: {
        ...common,
        // A re-engaging lead is warmer by definition; never cool one down.
        score: Math.max(existing.score, score),
        stage: existing.stage === "new" ? "qualified" : existing.stage,
        nextTouchAt: existing.nextTouchAt ?? new Date(Date.now() + days(TOUCH_GAP_DAYS)),
      },
    });
  }

  return db.lead.create({
    data: {
      ...common,
      email,
      source: input.source ?? "chat",
      score,
      stage: score >= 70 ? "hot" : score >= 40 ? "qualified" : "new",
      optOutToken: randomBytes(16).toString("base64url"),
      nextTouchAt: new Date(Date.now() + days(TOUCH_GAP_DAYS)),
    },
  });
}

/**
 * Leads the marketing agent is allowed to contact right now.
 *
 * Everything that would make contact unwelcome is excluded in the query rather
 * than left to the agent's judgement: opted out, already emailed the maximum
 * number of times, contacted too recently, already bought, explicitly lost, or
 * simply too old to still be a live prospect.
 */
export async function dueForFollowUp(limit = 25) {
  const now = new Date();
  return db.lead.findMany({
    where: {
      unsubscribedAt: null,
      stage: { notIn: ["won", "lost", "unsubscribed"] },
      touches: { lt: MAX_TOUCHES },
      nextTouchAt: { lte: now },
      createdAt: { gt: new Date(Date.now() - days(LEAD_EXPIRY_DAYS)) },
      email: { not: "" },
      OR: [
        { lastTouchAt: null },
        { lastTouchAt: { lte: new Date(Date.now() - days(TOUCH_GAP_DAYS)) } },
      ],
    },
    orderBy: [{ score: "desc" }, { createdAt: "asc" }],
    take: limit,
  });
}

/** Mark a touch spent and schedule the next one further out each time. */
export async function recordTouch(leadId: string) {
  const lead = await db.lead.findUnique({ where: { id: leadId } });
  if (!lead) return null;

  const touches = lead.touches + 1;
  // Widening gaps: 3 days, then 7, then 14. Someone who has not replied twice
  // should be hearing from us less, not on the same drumbeat.
  const gap = [TOUCH_GAP_DAYS, 7, 14][Math.min(touches, 2)];

  return db.lead.update({
    where: { id: leadId },
    data: {
      touches,
      lastTouchAt: new Date(),
      nextTouchAt: touches >= MAX_TOUCHES ? null : new Date(Date.now() + days(gap)),
      stage: touches >= MAX_TOUCHES ? "lost" : "nurturing",
    },
  });
}

/** One-click opt-out. Irreversible on purpose. */
export async function unsubscribeByToken(token: string): Promise<boolean> {
  const { count } = await db.lead.updateMany({
    where: { optOutToken: token, unsubscribedAt: null },
    data: { unsubscribedAt: new Date(), stage: "unsubscribed", nextTouchAt: null },
  });
  return count > 0;
}

/** Close a lead out when they buy, so nurture stops immediately. */
export async function markWon(email: string, orderRef: string) {
  await db.lead.updateMany({
    where: { email: email.trim().toLowerCase(), stage: { notIn: ["won", "unsubscribed"] } },
    data: { stage: "won", orderRef, nextTouchAt: null },
  });
}

export const unsubscribeUrl = (token: string) =>
  `${process.env.NEXT_PUBLIC_SITE_URL || ""}/unsubscribe?t=${token}`;
