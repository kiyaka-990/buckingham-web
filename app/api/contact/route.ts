import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, clientKey, tooMany } from "@/lib/rate-limit";

export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const cap = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

/**
 * The public enquiry form.
 *
 * Every field is capped before it reaches the database and the whole thing is
 * throttled per caller: this writes straight into the admin inbox, so without
 * a limit it is a free way to bury real enquiries under thousands of rows.
 */
export async function POST(req: Request) {
  const limit = await rateLimit("contact", clientKey(req), 5, 60 * 60_000);
  if (!limit.ok) return tooMany(limit, "You've sent several messages already. Please give us a moment to reply.");

  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = cap(data.email, 160).toLowerCase();
  const name = cap(data.name, 120) || "Website Visitor";

  if (!EMAIL.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  try {
    await db.message.create({
      data: {
        name,
        email,
        channel: "Web Form",
        subject: data.interest ? `Enquiry: ${cap(data.interest, 80)}` : "General enquiry",
        body:
          `${cap(data.message, 4000)}${data.phone ? `\n\nPhone: ${cap(data.phone, 40)}` : ""}`.trim() ||
          "(no message)",
        unread: true,
      },
    });
  } catch (err) {
    console.error("[contact] failed to save", err);
  }

  return NextResponse.json({ ok: true });
}
