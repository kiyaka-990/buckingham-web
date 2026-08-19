# Buckingham Kennel Limited — E-Commerce Web App

A production-grade, modern e-commerce platform for **Buckingham Kennel Limited** (Webuye, Kenya) —
breeding & sale of world-class dogs and puppies. Built with **Next.js 16, React 19, Tailwind CSS v4,
Framer Motion, React Three Fiber, Auth.js and Stripe**.

> _"Royalty in Every Paw."_

## ✨ Features

- **Royal navy + gold theme** with glassmorphism, liquid UI, animated carousels & image effects
- **Multipage storefront** — home, shop, breeds, breed detail, dog detail (with pedigree & health),
  puppies, services, gallery (lightbox), about, contact (map + form), legal pages
- **3D Virtual Showroom** — immersive React Three Fiber gallery you can orbit, zoom & click
- **AI Concierge "Duke"** — agentic chatbot that recommends dogs, answers FAQs, quotes prices.
  Works out-of-the-box with a built-in rule engine; upgrades to **Claude** when `ANTHROPIC_API_KEY` is set
- **Full cart & checkout** — Zustand cart, wishlist, **Stripe** card checkout + **M-Pesa Paybill** flow
- **Secure auth** — Google OAuth + email/password (Auth.js v5), client & admin roles
- **Admin dashboard** — KPIs, revenue chart, orders, inventory, customers (role-protected)
- **Accessibility panel** — light/dark, text scaling, high contrast, reduced motion, **read-aloud (TTS)**
- **Cookie consent**, lazy loading, SEO (sitemap, robots, manifest, OG), PWA manifest
- Logo used for **favicon/app icons** and brand theme

## 🚀 Getting started

```bash
cd buckingham-web
npm install        # already installed
npm run dev        # http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

## 🔑 Demo access

| Role   | Email                              | Password         |
| ------ | ---------------------------------- | ---------------- |
| Admin  | `admin@buckinghamkennel.co.ke`     | `buckingham2026` |
| Client | any valid email                    | any 6+ chars     |

Admin dashboard lives at **/admin** (redirects to login if unauthenticated / non-admin).

## ⚙️ Environment (`.env.local`)

All features run without keys (demo/mock mode). Add keys to go live:

| Variable | Enables |
| --- | --- |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | "Sign in with Google" |
| `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Real Stripe Checkout (else mock success) |
| `ANTHROPIC_API_KEY` | Claude-powered chatbot (else built-in agent) |
| `AUTH_SECRET` | Session encryption (a dev secret is pre-filled) |
| `DATABASE_URL` | Database connection (defaults to local SQLite `file:./dev.db`) |

Set the **M-Pesa Paybill** number in `lib/site.ts` (`payments.mpesaPaybill`) once activated.

## 🗄️ Database (real persistence)

The app runs on **Prisma + SQLite** out of the box (zero setup). Models: `User`, `Dog`, `Order`,
`OrderItem`, `Message`, `Setting` (`prisma/schema.prisma`).

```bash
npm run db:push   # create / sync the schema (creates prisma/dev.db)
npm run db:seed   # seed dogs, admin user (hashed), demo orders & messages
```

What's **live and persisted** (not mock):

- **Auth** — users stored in the DB with **bcrypt-hashed passwords**; registration creates real accounts; Google upserts users.
- **Storefront** — shop, dog pages, puppies, breeds, home & special-offers read dogs from the DB.
- **Admin CRUD** — create / edit / delete dogs, update order status, mark messages read, save settings (Server Actions, admin-only, revalidate the storefront).
- **Checkout & Stripe webhook** — writes a real `Order` + items, **decrements stock**, and confirms payment via a **signature-verified webhook** (`/api/webhooks/stripe`): `checkout.session.completed` → order `confirmed` + `paidAt`; `checkout.session.expired` → `cancelled`.
- **Contact form** — saved as a `Message` in the admin inbox.
- **Account** — shows the signed-in customer's real orders.

**Going to Postgres (production):** change the `datasource` provider to `postgresql` and set
`DATABASE_URL` to a Neon/Vercel Postgres URL, then `npm run db:push && npm run db:seed`. No app code changes.

### Stripe payments + webhook

1. Add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (test keys) to `.env.local`.
2. Forward events locally with the Stripe CLI and copy the printed signing secret into `STRIPE_WEBHOOK_SECRET`:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
3. In production, add the endpoint `https://your-domain/api/webhooks/stripe` in the Stripe Dashboard
   and use its signing secret. The webhook verifies the signature and updates order status automatically.

Without keys, checkout falls back to a mock success (order still saved as `pending`).

### M-Pesa (Safaricom Daraja STK push)

For Kenyan customers, choosing **M-Pesa** at checkout triggers a **live STK push** (PIN prompt on the
customer's phone); the order auto-confirms when Safaricom posts the result.

1. Create an app at [developer.safaricom.co.ke](https://developer.safaricom.co.ke) and fill
   `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`, `MPESA_ENV`.
2. Expose a public callback (e.g. `ngrok http 3000`) and set `MPESA_CALLBACK_URL` to
   `https://<public>/api/mpesa/callback`.
3. Flow: `POST /api/mpesa/stkpush` initiates → phone prompt → Safaricom `POST /api/mpesa/callback`
   confirms the order (stores the M-Pesa receipt) → the checkout page polls `/api/mpesa/status`.

Without credentials, M-Pesa checkout falls back to **Paybill instructions** automatically.

Breeds & testimonials remain code-defined content in `lib/data/` (static marketing copy).

## 🧱 Tech

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion ·
Zustand · Auth.js v5 · Stripe · React Three Fiber / drei · lucide-react.
