import type { NextConfig } from "next";

/**
 * Response headers.
 *
 * The Content-Security-Policy is the load-bearing one: it is what turns a
 * stored-XSS bug somewhere in the admin inbox from "attacker runs script as an
 * administrator" into "attacker's script is refused by the browser".
 *
 * `script-src` allows 'unsafe-inline' because the app ships an inline theme
 * bootstrap in the document head — the snippet that reads the saved theme
 * before first paint, without which every visit flashes the wrong colours.
 * Doing that with a nonce requires per-request middleware on every route, and
 * `strict-dynamic` would break Next's own inlined bootstrap. The trade is
 * deliberate and worth naming rather than pretending the policy is stricter
 * than it is; everything else is locked down hard, and `object-src 'none'`
 * plus `base-uri 'none'` closes the classic escapes.
 *
 * Everything below is self-hosted: fonts are bundled by next/font, images come
 * out of /public, and the only third party the browser talks to is Stripe,
 * which needs its js host and a frame for Checkout.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.stripe.com",
  "media-src 'self'",
  "font-src 'self' data:",
  "connect-src 'self' https://api.stripe.com",
  "frame-src https://js.stripe.com https://hooks.stripe.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'none'",
  "object-src 'none'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Redundant with frame-ancestors for modern browsers, kept for old ones.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(self), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [50, 65, 75, 90],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Don't advertise the framework to anyone fingerprinting the stack.
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Nothing under the API should ever be cached by a shared cache: these
        // responses are per-caller and some are per-session.
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
};

export default nextConfig;
