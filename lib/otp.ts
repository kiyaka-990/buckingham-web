import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";

/**
 * Email one-time passcodes.
 *
 * Codes are six digits, hashed before storage, valid for ten minutes, capped at
 * five verification attempts, and consumed on first success. Requesting a new
 * code invalidates any outstanding one for that address.
 */

export const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;

const normalise = (email: string) => email.toLowerCase().trim();
const hash = (code: string) => createHash("sha256").update(code).digest("hex");

/** Constant-time compare so a wrong code leaks nothing through timing. */
function sameHash(a: string, b: string) {
  const ab = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export async function issueLoginCode(email: string): Promise<{ code: string; expiresAt: Date }> {
  const addr = normalise(email);

  // Retire anything still outstanding for this address.
  await db.loginCode.updateMany({ where: { email: addr, consumed: false }, data: { consumed: true } });

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000);

  await db.loginCode.create({ data: { email: addr, codeHash: hash(code), expiresAt } });

  return { code, expiresAt };
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: "no-code" | "expired" | "too-many-attempts" | "mismatch" };

export async function verifyLoginCode(email: string, code: string): Promise<VerifyResult> {
  const addr = normalise(email);
  const supplied = code.replace(/\D/g, "");

  const record = await db.loginCode.findFirst({
    where: { email: addr, consumed: false },
    orderBy: { createdAt: "desc" },
  });
  if (!record) return { ok: false, reason: "no-code" };

  if (record.expiresAt.getTime() < Date.now()) {
    await db.loginCode.update({ where: { id: record.id }, data: { consumed: true } });
    return { ok: false, reason: "expired" };
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    await db.loginCode.update({ where: { id: record.id }, data: { consumed: true } });
    return { ok: false, reason: "too-many-attempts" };
  }
  if (supplied.length !== 6 || !sameHash(record.codeHash, hash(supplied))) {
    await db.loginCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    return { ok: false, reason: "mismatch" };
  }

  await db.loginCode.update({ where: { id: record.id }, data: { consumed: true } });
  return { ok: true };
}

/**
 * Deliver the code.
 *
 * Set RESEND_API_KEY (and optionally OTP_FROM_EMAIL) to send real mail. With no
 * key configured — local development — the code is logged to the server console
 * and returned to the caller so the flow stays testable.
 */
/** True when real email delivery is wired up. */
export const otpDeliveryConfigured = () => Boolean(process.env.RESEND_API_KEY);

export async function deliverLoginCode(email: string, code: string): Promise<{ delivered: boolean }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // Never echo a code anywhere in production — without a mail provider that
    // would let anyone sign in as any address. The route refuses to issue one
    // at all in that case; this is belt and braces.
    if (process.env.NODE_ENV === "production") return { delivered: false };
    console.info(`[otp] login code for ${email}: ${code} (valid ${OTP_TTL_MINUTES} min)`);
    return { delivered: false };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: process.env.OTP_FROM_EMAIL || "Buckingham Kennel <login@buckinghamkennel.co.ke>",
      to: [email],
      subject: `${code} is your Buckingham Kennel sign-in code`,
      text: `Your sign-in code is ${code}.\n\nIt expires in ${OTP_TTL_MINUTES} minutes. If you didn't ask for it, you can ignore this email.`,
    }),
  });

  if (!res.ok) {
    console.warn("[otp] delivery failed:", res.status, await res.text().catch(() => ""));
    return { delivered: false };
  }
  return { delivered: true };
}
