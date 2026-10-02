import { db } from "@/lib/db";

/**
 * The chat transcript store.
 *
 * Every conversation is written here once the visitor has signed in, so the
 * owner can read what was actually said — not just the leads Duke decided were
 * worth capturing. Best-effort by design: a failed write must never fail a
 * live conversation.
 */

export type ChatTurn = { role: "user" | "assistant"; content: string; at: string };

/** Ids come from the browser, so they are checked before they touch the DB. */
const SESSION_RE = /^[A-Za-z0-9_-]{8,64}$/;
export const validSessionId = (v: unknown): v is string => typeof v === "string" && SESSION_RE.test(v);

const MAX_TURNS_KEPT = 200;
const MAX_TRANSCRIPT_CHARS = 60_000;

function parse(raw: string | null | undefined): ChatTurn[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? (v as ChatTurn[]) : [];
  } catch {
    return [];
  }
}

export async function logChat(input: {
  sessionId: string;
  visitor: { name: string; email: string; phone?: string | null } | null;
  userMessage: string;
  reply: string;
}): Promise<void> {
  try {
    const existing = await db.chatSession.findUnique({
      where: { id: input.sessionId },
      select: { transcript: true },
    });

    const at = new Date().toISOString();
    let turns = parse(existing?.transcript);
    turns.push({ role: "user", content: input.userMessage.slice(0, 2000), at });
    turns.push({ role: "assistant", content: input.reply.slice(0, 4000), at });
    if (turns.length > MAX_TURNS_KEPT) turns = turns.slice(-MAX_TURNS_KEPT);

    let transcript = JSON.stringify(turns);
    while (transcript.length > MAX_TRANSCRIPT_CHARS && turns.length > 2) {
      turns = turns.slice(2);
      transcript = JSON.stringify(turns);
    }

    const data = {
      name: input.visitor?.name ?? null,
      email: input.visitor?.email ?? null,
      phone: input.visitor?.phone ?? null,
      turns: turns.filter((t) => t.role === "user").length,
      lastUserMessage: input.userMessage.slice(0, 300),
      transcript,
    };

    await db.chatSession.upsert({
      where: { id: input.sessionId },
      create: { id: input.sessionId, ...data },
      update: data,
    });
  } catch (err) {
    console.error("[chat-log] failed to record", (err as Error).message);
  }
}
