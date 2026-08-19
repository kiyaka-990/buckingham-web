/** Safaricom Daraja (M-Pesa) helper. Fully functional once credentials are set. */

export function mpesaConfigured() {
  return Boolean(
    process.env.MPESA_CONSUMER_KEY &&
      process.env.MPESA_CONSUMER_SECRET &&
      process.env.MPESA_SHORTCODE &&
      process.env.MPESA_PASSKEY
  );
}

function host() {
  return process.env.MPESA_ENV === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";
}

/** Normalise 07…, +2547…, 2547… to the 2547XXXXXXXX format Daraja expects. */
export function formatPhone(input: string): string {
  const digits = String(input).replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return "254" + digits.slice(1);
  if (digits.startsWith("7") || digits.startsWith("1")) return "254" + digits;
  return digits;
}

function timestamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

async function getToken(): Promise<string> {
  const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString("base64");
  const res = await fetch(`${host()}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`M-Pesa auth failed: ${res.status}`);
  const data = await res.json();
  return data.access_token as string;
}

export type StkResult = {
  ok: boolean;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  customerMessage?: string;
  error?: string;
};

export async function stkPush(opts: {
  phone: string;
  amount: number;
  accountRef: string;
  description?: string;
}): Promise<StkResult> {
  const shortcode = process.env.MPESA_SHORTCODE!;
  const passkey = process.env.MPESA_PASSKEY!;
  const ts = timestamp();
  const password = Buffer.from(`${shortcode}${passkey}${ts}`).toString("base64");
  const callbackUrl =
    process.env.MPESA_CALLBACK_URL ||
    `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/mpesa/callback`;

  try {
    const token = await getToken();
    const res = await fetch(`${host()}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: ts,
        TransactionType: process.env.MPESA_TX_TYPE || "CustomerPayBillOnline",
        Amount: Math.max(1, Math.round(opts.amount)),
        PartyA: formatPhone(opts.phone),
        PartyB: shortcode,
        PhoneNumber: formatPhone(opts.phone),
        CallBackURL: callbackUrl,
        AccountReference: opts.accountRef.slice(0, 12),
        TransactionDesc: (opts.description || "Buckingham Kennel").slice(0, 13),
      }),
    });
    const data = await res.json();
    if (data.ResponseCode === "0") {
      return { ok: true, checkoutRequestId: data.CheckoutRequestID, merchantRequestId: data.MerchantRequestID, customerMessage: data.CustomerMessage };
    }
    return { ok: false, error: data.errorMessage || data.ResponseDescription || "STK push failed" };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
