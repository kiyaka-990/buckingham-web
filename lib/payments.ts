import { isLiveDeployment, isProduction } from "@/lib/env";
import { mpesaConfigured } from "@/lib/mpesa";
import { site } from "@/lib/site";

/**
 * Which ways of paying are genuinely switched on.
 *
 * One answer, used by the checkout page, the checkout API and the sales agent,
 * so that a payment method the kennel cannot actually collect on is never
 * offered. The failure this prevents is quiet: with no live payment rail, a
 * buyer used to be sent to a success page for an order nobody had paid.
 */

/**
 * Card payments need a live Stripe key AND the webhook secret. The webhook is
 * what marks an order paid; a key without it takes money the shop never learns
 * about. A test key (sk_test_) is only honoured away from the live site, so
 * sandbox "payments" can never appear on the real storefront.
 */
export function cardEnabled(): boolean {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return false;
  if (!isLiveDeployment()) return true; // previews and local dev may use test keys
  const live = key.startsWith("sk_live_") || key.startsWith("rk_live_");
  return live && Boolean(process.env.STRIPE_WEBHOOK_SECRET);
}

/** A real Paybill/Till, as opposed to the "XXXXXX" placeholder in site.ts. */
const hasRealPaybill = () => /^\d{5,7}$/.test(site.payments.mpesaPaybill);

/**
 * M-Pesa is on when STK push is configured (and, on the live site, pointed at
 * Safaricom's production API rather than the sandbox), or when a real Paybill
 * exists so buyers can pay manually and the kennel confirms by hand.
 */
export function stkEnabled(): boolean {
  return mpesaConfigured() && (!isLiveDeployment() || process.env.MPESA_ENV === "production");
}

export function mpesaEnabled(): boolean {
  return stkEnabled() || hasRealPaybill();
}

export type PaymentMethods = { card: boolean; mpesa: boolean };

export const paymentMethods = (): PaymentMethods => ({ card: cardEnabled(), mpesa: mpesaEnabled() });

/**
 * On a developer's machine every rail stays usable (mock mode) so the shop can
 * be built without keys. Anywhere else, a method that is not enabled is refused.
 */
export const mustRefuse = (enabled: boolean) => isProduction() && !enabled;
