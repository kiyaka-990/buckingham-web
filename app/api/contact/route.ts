import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const data = await req.json();
  // In production: send an email / persist to CRM. For the demo we just log.
  console.log("[contact] new enquiry:", data);
  return NextResponse.json({ ok: true });
}
