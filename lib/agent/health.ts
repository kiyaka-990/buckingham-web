import { db } from "@/lib/db";

/**
 * Is the sales agent actually working?
 *
 * This exists because of a real failure: the agent fell back to keyword
 * matching for weeks and nobody noticed. The fallback is deliberately good
 * enough to keep selling, which is exactly what makes the failure invisible —
 * the site looks healthy, every page returns 200, and visitors get plausible
 * answers written by a regex.
 *
 * So a failure has to leave a mark somewhere the owner will see it.
 */

const ACTION = "agent_unavailable";

/** Don't write a row per message during an outage — one every quarter hour. */
const THROTTLE_MS = 15 * 60_000;

/** How long a failure keeps the banner up once the agent recovers. */
const STALE_MS = 24 * 60 * 60_000;

/**
 * Record that the agent could not answer. Throttled and best-effort: this runs
 * on the failure path of a live customer conversation, and must never make
 * that path worse.
 */
export async function recordAgentFailure(reason: string): Promise<void> {
  try {
    const recent = await db.agentAction.findFirst({
      where: { action: ACTION, createdAt: { gt: new Date(Date.now() - THROTTLE_MS) } },
      select: { id: true },
    });
    if (recent) return;

    await db.agentAction.create({
      data: {
        agent: "duke",
        action: ACTION,
        status: "failed",
        summary: reason.slice(0, 300),
        payload: "{}",
      },
    });
  } catch {
    /* health reporting must never break the request it is reporting on */
  }
}

/** Clear the alert once the agent answers again. */
export async function recordAgentRecovered(): Promise<void> {
  try {
    const open = await db.agentAction.findFirst({
      where: { action: ACTION, status: "failed" },
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true },
    });
    // Only write a recovery row if something was actually broken recently.
    if (!open || Date.now() - open.createdAt.getTime() > STALE_MS) return;
    await db.agentAction.updateMany({
      where: { action: ACTION, status: "failed" },
      data: { status: "done" },
    });
  } catch {
    /* as above */
  }
}

export type AgentHealth = {
  healthy: boolean;
  reason: string | null;
  since: Date | null;
};

/**
 * What the admin dashboard shows.
 *
 * `since` is when the outage began (the oldest open failure), but `reason` is
 * the NEWEST failure. They used to both come from the oldest row, so after the
 * owner fixed one problem (a missing key) and hit the next (no credit), the
 * banner kept announcing the first one and sent them round in circles.
 */
export async function agentHealth(): Promise<AgentHealth> {
  try {
    const where = { action: ACTION, status: "failed", createdAt: { gt: new Date(Date.now() - STALE_MS) } };
    const [first, latest] = await Promise.all([
      db.agentAction.findFirst({ where, orderBy: { createdAt: "asc" } }),
      db.agentAction.findFirst({ where, orderBy: { createdAt: "desc" } }),
    ]);
    if (!first || !latest) return { healthy: true, reason: null, since: null };
    return { healthy: false, reason: latest.summary, since: first.createdAt };
  } catch {
    return { healthy: true, reason: null, since: null };
  }
}
