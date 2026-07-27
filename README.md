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

Set the **M-Pesa Paybill** number in `lib/site.ts` (`payments.mpesaPaybill`) once activated.

## 🗂️ Data

Dogs, breeds, pedigrees, orders and testimonials are mock data in `lib/data/`. Swap these modules
for a database (e.g. Vercel Postgres/Neon) to go fully live — the UI is already wired to the shapes.

## 🧱 Tech

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion ·
Zustand · Auth.js v5 · Stripe · React Three Fiber / drei · lucide-react.
