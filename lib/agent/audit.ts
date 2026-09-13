import { db } from "@/lib/db";

/**
 * The agent's paper trail.
 *
 * An agent that can hold a puppy and raise an order is doing things a customer
 * would otherwise have to ask a human for, and every one of those needs to be
 * answerable later: what ran, for whom, against which dog, and on whose say-so.
 *
 * Recording is best-effort by design. Losing an audit row is bad; failing a
 * live customer conversation because the audit write failed is worse, and the
 * action itself is already recorded in the orders and messages tables.
 */

export type AgentActionInput = {
  action: string;
  summary: string;
  status?: "done" | "pending_approval" | "rejected" | "failed";
  agent?: string;
  sessionId?: string | null;
  orderRef?: string | null;
  dogSlug?: string | null;
  contact?: string | null;
  payload?: unknown;
};

export async function recordAgentAction(input: AgentActionInput): Promise<void> {
  try {
    await db.agentAction.create({
      data: {
        agent: input.agent ?? "duke",
        action: input.action,
        status: input.status ?? "done",
        sessionId: input.sessionId ?? null,
        orderRef: input.orderRef ?? null,
        dogSlug: input.dogSlug ?? null,
        contact: input.contact ?? null,
        summary: input.summary.slice(0, 500),
        payload: JSON.stringify(input.payload ?? {}).slice(0, 8000),
      },
    });
  } catch (err) {
    console.error("[agent-audit] failed to record", input.action, (err as Error).message);
  }
}

/** Has this agent already done `action` for this order? Keeps the cron idempotent. */
export async function alreadyDone(action: string, orderRef: string): Promise<boolean> {
  const hit = await db.agentAction.findFirst({
    where: { action, orderRef, status: "done" },
    select: { id: true },
  });
  return hit !== null;
}
