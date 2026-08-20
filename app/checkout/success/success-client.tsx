"use client";

import { useSearchParams } from "next/navigation";

export function SuccessOrderId() {
  const order = useSearchParams().get("order");
  return <span className="font-semibold text-accent-ink">{order || "confirmed"}</span>;
}
