import { NextResponse } from "next/server";
import { issueLoginCode, deliverLoginCode, otpDeliveryConfigured, OTP_TTL_MINUTES } from "@/lib/otp";
import { db } from "@/lib/db";
import { isProduction } from "@/lib/env";
import { rateLimit, clientKey, tooMany } from "@/lib/rate-limit";

export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  let email = "";
  let name: string | undefined;
  try {
    const body = (await req.json()) as { email?: string; name?: string };
    email = String(body.email ?? "").toLowerCase().trim();
    name = body.name?.trim() || undefined;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!EMAIL.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  // Without a mail provider we cannot deliver a code privately, and handing it
  // back to the browser would let anyone sign in as anyone. Refuse outright in
  // production rather than degrade into an open door.
  if (isProduction() && !otpDeliveryConfigured()) {
    return NextResponse.json(
      { error: "Email sign-in codes aren't available yet. Please use Google or your password.", unavailable: true },
      { status: 503 }
    );
  }

  // Two limits, both in the database so they survive a cold start: one that
  // stops a single address being spammed with codes, and one that stops a
  // single caller enumerating addresses across the whole site.
  const perAddress = await rateLimit("otp:addr", clientKey(req, email), 3, 15 * 60_000);
  if (!perAddress.ok) {
    return tooMany(perAddress, "A code was just sent. Please wait before asking for another.");
  }
  const perCaller = await rateLimit("otp:ip", clientKey(req), 10, 60 * 60_000);
  if (!perCaller.ok) return tooMany(perCaller, "Too many sign-in attempts. Please try again later.");

  // Signing in by code creates the account on first use, like Google sign-in does.
  await db.user.upsert({
    where: { email },
    update: name ? { name } : {},
    create: { email, name, role: "client" },
  });

  const { code } = await issueLoginCode(email);
  const { delivered } = await deliverLoginCode(email, code);

  return NextResponse.json({
    sent: true,
    expiresInMinutes: OTP_TTL_MINUTES,
    // The code only ever comes back to the caller on a developer machine.
    // Outside development it stays server-side whatever happens to delivery:
    // handing it to whoever asked for it is an account takeover, and a
    // provider outage must not silently become one.
    devCode: !isProduction() && !delivered ? code : undefined,
  });
}
