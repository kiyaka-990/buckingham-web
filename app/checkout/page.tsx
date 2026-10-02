import type { Metadata } from "next";
import { paymentMethods } from "@/lib/payments";
import CheckoutClient from "./checkout-client";

export const metadata: Metadata = { title: "Checkout" };
// Read at request time: which rails are live depends on environment variables,
// and a page cached at build would keep offering a method after it was switched off.
export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return <CheckoutClient methods={paymentMethods()} />;
}
