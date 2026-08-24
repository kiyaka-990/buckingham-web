import { createHash } from "node:crypto";
import { db } from "@/lib/db";

/**
 * Request throttling, in the database.
 *
 * An in-process Map is worthless here: every serverless invocation may be a
 * fresh instance, so a per-instance counter is trivially defeated by making
 * requests until one lands somewhere cold. The counters therefore live in the
 * same Postgres the rest of the app uses, keyed on a hash of the caller and
 * the bucket they are hitting.
 *
 * Fixed windows, not a sliding log: a caller gets `limit` requests per
 * `windowMs`, and the window resets wholesale. That permits a burst of up to
 * 2×limit across a window boundary, which is an acceptable trade for one
 * indexed row per caller per bucket instead of one row per request.
 *
 * The store fails **open** — if the database is unreachable the request is
 * allowed. A throttle that takes the whole site down when the database
 * hiccups is a worse outage than the abuse it prevents. Every route this
 * guards has its own authorisation and validation; this is a cost and volume
 * control, not an access control, and nothing downstream relies on it.
 */

export type RateLimitResult = {
  ok: boolean;
  /** Requests left in the current window. */
  remaining: number;
  /** When the current window resets. */
  resetAt: Date;
  limit: number;
};

/** Never store a raw IP or email — the key is only ever needed for equality. */
const keyHash = (bucket: string, caller: string) =>
  createHash("sha256").update(`${bucket}:${caller}`).digest("hex");

/**
 * Identify the caller.
 *
 * Behind Vercel, `x-forwarded-for` is set by the platform and the left-most
 * entry is the real client. It is spoofable in general, so this is a speed
 * bump against casual abuse rather than a defence against a determined
 * attacker with a proxy pool — pair it with the platform firewall for that.
 * Falls back to a constant so a request with no usable address still shares a
 * bucket rather than escaping the limit entirely.
 */
export function clientKey(req: Request, extra?: string): string {
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  const ip = fwd.split(",")[0]?.trim() || req.headers.get("x-real-ip")?.trim() || "unknown";
  return extra ? `${ip}|${extra.toLowerCase().trim()}` : ip;
}

export async function rateLimit(
  bucket: string,
  caller: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const key = keyHash(bucket, caller);
  const now = new Date();

  try {
    const existing = await db.rateLimit.findUnique({ where: { key } });

    // No window, or the previous one has run out: start a fresh one.
    if (!existing || existing.expiresAt.getTime() <= now.getTime()) {
      const expiresAt = new Date(now.getTime() + windowMs);
      await db.rateLimit.upsert({
        where: { key },
        create: { key, count: 1, expiresAt },
        update: { count: 1, expiresAt },
      });
      return { ok: true, remaining: limit - 1, resetAt: expiresAt, limit };
    }

    if (existing.count >= limit) {
      return { ok: false, remaining: 0, resetAt: existing.expiresAt, limit };
    }

    const updated = await db.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    });
    return {
      ok: true,
      remaining: Math.max(0, limit - updated.count),
      resetAt: updated.expiresAt,
      limit,
    };
  } catch (err) {
    console.error(`[rate-limit] store unavailable for ${bucket}, allowing:`, err);
    return { ok: true, remaining: limit, resetAt: new Date(now.getTime() + windowMs), limit };
  }
}

/** The 429 every throttled route returns, with the headers clients expect. */
export function tooMany(result: RateLimitResult, message = "Too many requests. Please slow down.") {
  const retryAfter = Math.max(1, Math.ceil((result.resetAt.getTime() - Date.now()) / 1000));
  return new Response(JSON.stringify({ error: message }), {
    status: 429,
    headers: {
      "content-type": "application/json",
      "retry-after": String(retryAfter),
      "x-ratelimit-limit": String(result.limit),
      "x-ratelimit-remaining": "0",
      "x-ratelimit-reset": String(Math.floor(result.resetAt.getTime() / 1000)),
    },
  });
}

/**
 * Drop expired rows. Nothing depends on this running — an expired row is
 * already treated as absent — it just stops the table growing without bound.
 */
export async function pruneRateLimits(): Promise<number> {
  try {
    const { count } = await db.rateLimit.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    return count;
  } catch {
    return 0;
  }
}
