import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { rateLimit, clientKey, tooMany } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** Long enough to survive an offline crack of a stolen hash. */
const MIN_PASSWORD = 10;

export async function POST(req: Request) {
  const limit = await rateLimit("register", clientKey(req), 5, 60 * 60_000);
  if (!limit.ok) return tooMany(limit, "Too many sign-up attempts. Please try again later.");

  let name: unknown, email: unknown, password: unknown;
  try {
    ({ name, email, password } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const cleanEmail = String(email ?? "").toLowerCase().trim().slice(0, 160);

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }
  const pw = String(password ?? "");
  if (pw.length < MIN_PASSWORD || pw.length > 200) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD} characters.` },
      { status: 400 }
    );
  }

  const existing = await db.user.findUnique({ where: { email: cleanEmail } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  await db.user.create({
    data: {
      email: cleanEmail,
      name: String(name ?? "").trim().slice(0, 120) || cleanEmail.split("@")[0],
      // Registration never grants privilege. The role is set here, not taken
      // from the request, so a "role":"admin" field in the body does nothing.
      role: "client",
      passwordHash: await bcrypt.hash(pw, 12),
    },
  });

  return NextResponse.json({ ok: true });
}
