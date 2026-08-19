import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();
  const cleanEmail = String(email ?? "").toLowerCase().trim();

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }
  if (String(password ?? "").length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email: cleanEmail } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  await db.user.create({
    data: {
      email: cleanEmail,
      name: String(name ?? "").trim() || cleanEmail.split("@")[0],
      role: "client",
      passwordHash: await bcrypt.hash(String(password), 10),
    },
  });

  return NextResponse.json({ ok: true });
}
