import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const data = await req.json();
  const email = String(data.email ?? "").toLowerCase().trim();
  const name = String(data.name ?? "").trim() || "Website Visitor";

  try {
    await db.message.create({
      data: {
        name,
        email,
        channel: "Web Form",
        subject: data.interest ? `Enquiry: ${data.interest}` : "General enquiry",
        body: `${data.message ?? ""}${data.phone ? `\n\nPhone: ${data.phone}` : ""}`.trim() || "(no message)",
        unread: true,
      },
    });
  } catch (err) {
    console.error("[contact] failed to save", err);
  }

  return NextResponse.json({ ok: true });
}
