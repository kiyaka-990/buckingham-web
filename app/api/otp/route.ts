import { NextResponse } from "next/server";
import { issueLoginCode, deliverLoginCode, otpDeliveryConfigured, OTP_TTL_MINUTES } from "@/lib/otp";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Naive per-address throttle: one code per 30 seconds. */
const lastSent = new Map<string, number>();

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
  if (process.env.NODE_ENV === "production" && !otpDeliveryConfigured()) {
    return NextResponse.json(
      { error: "Email sign-in codes aren't available yet. Please use Google or your password.", unavailable: true },
      { status: 503 }
    );
  }

  const previous = lastSent.get(email);
  if (previous && Date.now() - previous < 30_000) {
    return NextResponse.json(
      { error: "A code was just sent. Please wait a moment before asking for another." },
      { status: 429 }
    );
  }
  lastSent.set(email, Date.now());

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
    // With no mail provider configured the code comes back so the flow is
    // still usable in development. Never happens once RESEND_API_KEY is set.
    devCode: delivered ? undefined : code,
  });
}
