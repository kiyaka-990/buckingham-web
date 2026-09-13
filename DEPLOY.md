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
   - **Direct** (no `-pooler`, `?sslmode=require`) → `DATABASE_URL_UNPOOLED` (used only for migrations)

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
   | `DATABASE_URL_UNPOOLED` | Neon **direct** URL |
   | `AUTH_SECRET` | `openssl rand -base64 32` (or `npx auth secret`) |
   | `NEXT_PUBLIC_SITE_URL` | your production URL, e.g. `https://buckingham.vercel.app` |
   | `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth (optional) |
   | `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe (optional) |
   | `MPESA_*` | Safaricom Daraja (optional) |
   | `ANTHROPIC_API_KEY` | Duke, the AI sales agent (optional — see below) |
   | `ANTHROPIC_MODEL` | Defaults to `claude-opus-5` |
   | `RESEND_API_KEY` | Sends the one-time sign-in codes (see below) |
   | `OTP_FROM_EMAIL` | From-address for those codes |
   | `ORDER_FROM_EMAIL` | From-address for order receipts and follow-ups |
   | `OWNER_ALERT_EMAIL` | Where the kennel's own copy of every order lands (defaults to the published address) |
   | `CRON_SECRET` | Bearer token Vercel Cron uses to call `/api/cron/follow-up`. **Unset means the endpoint refuses every call.** |

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
DATABASE_URL="<neon-pooled-url>" DATABASE_URL_UNPOOLED="<neon-direct-url>" npm run db:seed:prod
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

---

## What production is still missing

`vercel env ls production` should list all of the following. Anything absent
here is a feature that is silently switched off on the live site:

| Variable | What breaks without it |
| --- | --- |
| `STRIPE_WEBHOOK_SECRET` | **Card payments never confirm.** The webhook returns 501, the order stays `pending` for ever, stock is never decremented and no receipt is sent. Money can arrive and the shop will not know. |
| `MPESA_*` (7 vars) | The entire M-Pesa rail is dead — the STK push endpoint cannot authenticate. |
| `RESEND_API_KEY` | No order receipts, no owner alerts, no follow-ups, and email sign-in refuses to issue codes. |
| `CRON_SECRET` | The daily follow-up job returns 401: stale holds are never released and stalled orders are never chased. |

Set them with:

```bash
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add RESEND_API_KEY production
vercel env add ORDER_FROM_EMAIL production
vercel env add OWNER_ALERT_EMAIL production
vercel env add CRON_SECRET production          # openssl rand -base64 32
vercel env add MPESA_ENV production            # and the other six MPESA_ vars
```

Redeploy afterwards — environment variables are read at build and boot.

## The scheduled follow-up job

`vercel.json` registers `/api/cron/follow-up` daily at 07:00 UTC (10:00 EAT).
Hobby plans allow one cron run per day; on Pro you can raise this to hourly by
changing the schedule to `0 * * * *`. Each run:

1. releases holds that have lapsed, putting those puppies back on sale;
2. emails a one-time nudge for orders that stalled mid-payment (older than 2
   hours, younger than 7 days);
3. cancels orders still unpaid after 7 days.

Every step is idempotent and logged to the `AgentAction` table, so a replayed
schedule cannot email the same buyer twice.
