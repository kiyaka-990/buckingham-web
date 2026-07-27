"use client";

import { useSearchParams } from "next/navigation";

export function SuccessOrderId() {
  const order = useSearchParams().get("order");
  return <span className="font-semibold text-gold-500">{order || "confirmed"}</span>;
}
