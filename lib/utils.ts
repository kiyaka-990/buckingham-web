import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency: "USD" | "KES" = "USD") {
  const locale = currency === "KES" ? "en-KE" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Approx USD -> KES for display of Mpesa amounts */
export const KES_PER_USD = 129;
export const usdToKes = (usd: number) => Math.round((usd * KES_PER_USD) / 10) * 10;

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
