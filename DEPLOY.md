# Deploying to Vercel + Neon Postgres

The app runs on **SQLite locally** (zero setup) and **Postgres in production**. The two Prisma
schemas share identical models:

- `prisma/schema.prisma` — SQLite (local dev)
- `prisma/schema.postgres.prisma` — PostgreSQL (production, used by the Vercel build)

The Vercel build (`vercel.json`) automatically generates the Postgres client and applies migrations:

```
prisma generate  --schema=prisma/schema.postgres.prisma
prisma migrate deploy --schema=prisma/schema.postgres.prisma
next build
```

## 1. Create a Neon database

1. Sign up at [neon.tech](https://neon.tech) (or use Vercel → Storage → Postgres) and create a database.
2. Copy **two** connection strings:
   - **Pooled** (has `-pooler`, add `?sslmode=require&pgbouncer=true&connection_limit=1`) → `DATABASE_URL`
   - **Direct** (no `-pooler`, `?sslmode=require`) → `DIRECT_URL` (used only for migrations)

## 2. Push the project to GitHub

```bash
cd buckingham-web
git init && git add . && git commit -m "Buckingham Kennel web app"
git branch -M main
git remote add origin https://github.com/<you>/buckingham-web.git
git push -u origin main
```

`.gitignore` already excludes `.env*` and the local `*.db` files.

## 3. Import into Vercel

1. [vercel.com/new](https://vercel.com/new) → import the repo (framework auto-detected as Next.js).
2. Add **Environment Variables** (Production + Preview):

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | Neon **pooled** URL |
   | `DIRECT_URL` | Neon **direct** URL |
   | `AUTH_SECRET` | `openssl rand -base64 32` (or `npx auth secret`) |
   | `NEXT_PUBLIC_SITE_URL` | your production URL, e.g. `https://buckingham.vercel.app` |
   | `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth (optional) |
   | `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe (optional) |
   | `MPESA_*` | Safaricom Daraja (optional) |
   | `ANTHROPIC_API_KEY` | Duke, the AI sales agent (optional — see below) |
   | `ANTHROPIC_MODEL` | Defaults to `claude-opus-5` |
   | `RESEND_API_KEY` | Sends the one-time sign-in codes (see below) |
   | `OTP_FROM_EMAIL` | From-address for those codes |

3. **Deploy.** The build runs the migrations against Neon and ships the app.

### Two optional keys worth understanding

Both features work without their key, but in a degraded mode you would not want a client to see:

- **No `ANTHROPIC_API_KEY`** — the chat widget falls back from a tool-using agent to keyword
  matching over live inventory. It still answers and still recommends real dogs, but it cannot
  qualify a lead, log an enquiry to the admin inbox, or book a viewing.
- **No `RESEND_API_KEY`** — one-time sign-in codes are printed to the server log and returned
  to the browser instead of being emailed. Fine locally, **not acceptable in production**: anyone
  In production the API now **refuses to issue a code at all** without this key (503), and the sign-in
  form falls back to the password tab, so the deployment is safe either way — but the Email code option
  simply will not work until you set it.

## 4. Seed production data (one-time)

From your machine, pointed at Neon:

```bash
# generates the Postgres client, then seeds dogs + admin + demo data
DATABASE_URL="<neon-pooled-url>" DIRECT_URL="<neon-direct-url>" npm run db:seed:prod
# restore your local SQLite client afterwards:
npm run db:push
```

## 5. Post-deploy webhooks

- **Stripe:** Dashboard → Developers → Webhooks → add `https://<domain>/api/webhooks/stripe`
  (event `checkout.session.completed`), copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
- **M-Pesa:** set `MPESA_CALLBACK_URL=https://<domain>/api/mpesa/callback`.

Update the Google OAuth authorized redirect URI to `https://<domain>/api/auth/callback/google`.

## Switching local dev to Postgres (optional)

Point `DATABASE_URL` at a Neon dev branch and run everything with the Postgres schema:

```bash
npm run db:generate:prod
prisma migrate deploy --schema=prisma/schema.postgres.prisma
```
