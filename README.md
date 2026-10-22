# Sayphora — Luxury Beauty, Skincare & Cosmetics

A full-stack storefront: **React 19 + Vite + Tailwind 4** frontend, **Express 4 (TypeScript)** API, **PostgreSQL 16** database.
Everything the UI shows is backed by the API and database: accounts, catalogue, cart pricing, orders, stock, reviews,
wishlist, loyalty tiers & rewards, promo codes, AI beauty tools, admin console and analytics.

```
shared/commerce.ts      pricing, tiers, order-status rules — used by BOTH server (authoritative) and storefront (display)
server/                 Express API (routes/, services/, middleware/, db/ migrations + seed, cli.ts)
src/                    React storefront (context/AppContext.tsx talks to the API via src/lib/api.ts)
tests/                  Vitest: unit tests + API integration tests against real PostgreSQL
e2e/                    Playwright: browser tests against the production build
```

## Quick start (local development)

Requirements: **Node 22+** and **PostgreSQL 14+** (or Docker, see below).

```bash
cp .env.example .env                      # set DATABASE_URL and JWT_SECRET (>= 32 chars)
createdb sayphora_db                      # or: docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=sayphora_db postgres:16-alpine
npm install
SEED_DEMO=true ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='ChangeMe!2026xx' npm run db:seed
npm run dev                               # http://localhost:3000  (Vite HMR + API on one port)
```

`db:seed` applies migrations, loads the starter catalogue, and (if set) creates the admin. With `SEED_DEMO=true` it also
adds a demo customer (`demo@sayphora.test` / `DemoPassw0rd!2026`), promo codes (`SAYPHORA20`, `FREESHIP`, `BEAUTY10`,
`ROUGEVIP`) and sample reviews. **Never use `SEED_DEMO` in production.**

The admin console opens from the **Admin Portal** link (staff accounts only) or **Ctrl/⌘ + Shift + A**.

## Run with Docker (production-style)

```bash
cp .env.example .env
#   set: POSTGRES_PASSWORD (hex), JWT_SECRET, APP_URL, ADMIN_EMAIL, ADMIN_PASSWORD
#   for plain-http local testing also set COOKIE_SECURE=false
docker compose up -d --build              # db + app; migrations run automatically on boot
docker compose run --rm app node dist-server/cli.js seed   # starter catalogue + admin account
open http://localhost:3000
```

Data lives in the `pgdata` volume. Health: `GET /health` (200 when the database answers, else 503) — used by the Docker
healthchecks. Backups: `docker compose exec db pg_dump -U sayphora sayphora > backup.sql`.

## Deploying to production

1. Provision PostgreSQL (managed is best) and set `DATABASE_URL` (add `DATABASE_SSL=true` if your provider requires TLS).
2. Put the app behind **HTTPS** (Caddy, nginx, Traefik, or your PaaS router). Set `APP_URL=https://your-domain`,
   `TRUST_PROXY=1` (so rate limiting sees real client IPs) and keep `COOKIE_SECURE` at its production default (`true`).
3. Set a strong `JWT_SECRET` (`openssl rand -base64 48`). The server refuses to start in production with a placeholder.
4. Build & run: `docker compose up -d --build` — or without Docker: `npm ci && npm run build && npm start`.
5. Create the first admin: `docker compose run --rm app node dist-server/cli.js create-admin you@domain.com 'LongPassword!' "Your Name"`.
6. Configure SMTP (order/reset emails) and, optionally, `GEMINI_API_KEY`.

Migrations: `npm run db:migrate` (or automatic with `RUN_MIGRATIONS_ON_START=true`; guarded by a PostgreSQL advisory lock so
several replicas can start at once). `npm run db:status` lists applied/pending. To add a migration create
`server/db/migrations/00N_description.sql`; each file runs in its own transaction.

CI/CD: `.github/workflows/ci.yml` runs typecheck, unit + API tests on a Postgres service, Playwright E2E on the
production build, and a Docker image build.

## Visual showcase

**[Open the Sayphora visual showcase](docs/testing/VISUAL-TEST-WALKTHROUGH.md)** — 51 inline screenshots arranged into before/after customer journeys, product feature comparisons, mobile/PWA views and staff-console workflows. Each image opens full size, and the page documents which external integrations and production behaviors have not been verified.

## Testing

```bash
npm run typecheck
npm test                 # unit + API integration tests (needs PostgreSQL; uses database "sayphora_test")
npm run test:e2e         # builds the app, boots it on :4010 with database "sayphora_e2e", drives Chromium
```
Test databases default to `postgresql://postgres:postgres@localhost:5432/{sayphora_test,sayphora_e2e}`; create them first
and override with `TEST_DATABASE_URL` / `E2E_DATABASE_URL`. First-time E2E: `npx playwright install chromium`.

What is covered: pricing/tier/status rules; password hashing and JWT tampering; config validation; registration, login,
sessions, password change/reset, CSRF origin check, RBAC, login rate limiting; catalogue filters/search (incl. LIKE-injection);
admin CRUD; order placement (server-side pricing, stock decrement, idempotency, **concurrent checkouts never oversell**,
single-use promo codes can't be double-spent), cancellation/restock/points reversal, fulfilment lifecycle, analytics;
reviews (verified purchase, votes, aggregates); wishlist/addresses/rewards; AI endpoints (fake Gemini, malformed output,
prompt-injection attempts); migrations and DB constraints; and browser journeys (register → shop → promo → checkout →
track; admin advances an order; sold-out; staff console hidden from customers; CSP/console clean).

## Configuration

See `.env.example` (every variable is documented). Required: `DATABASE_URL`, `JWT_SECRET`. The server validates all
configuration at startup and exits with a readable message when something is wrong.

## Security model

- Passwords: scrypt (N=2^15) with per-user salt; login is timing-uniform for unknown emails; per-account+IP brute-force limiter.
- Sessions: HS256 JWT in an `HttpOnly`, `SameSite=Lax`, `Secure` (prod) cookie; `token_version` revokes all sessions on password change/reset.
- CSRF: SameSite + `Origin` check on every state-changing API call. Strict CSP, HSTS (over HTTPS), `nosniff`, Permissions-Policy.
- Authorization: `Customer` / `Staff` (orders, reviews, stock, analytics) / `Admin` (catalogue, promos, system). Customers only ever see their own orders.
- The server never trusts client prices/totals; every order is re-priced from the database inside a transaction with row locks.
- Input validated with zod everywhere; SQL is parameterised; rate limits on the API, auth, writes and AI endpoints; request-size limits.
- Secrets only via environment variables; logs redact cookies/authorization.

## API overview

All under `/api` (JSON). Auth: `POST /auth/register|login|logout|forgot-password|reset-password`, `GET /auth/me`.
Account: `PATCH /me`, `POST /me/password`, `/me/addresses`, `/me/wishlist`, `GET /me/orders`, `/me/rewards`.
Catalogue: `GET /products`, `/products/:id`, `/products/:id/reviews`, `/samples`, `/boutiques`, `/config`.
Commerce: `POST /promos/validate`, `POST /orders` (send `Idempotency-Key`), `GET /orders/:id`, `POST /orders/:id/cancel`,
`POST /products/:id/reviews`, `POST /reviews/:id/vote`.
AI: `POST /ai/shade-match|skincare-routine|beauty-consultant|store-locator`.
Staff/Admin: `/admin/products|orders|promos|reviews|analytics|system`.
Errors are `{ "error": { "code", "message", "details?" } }`.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Invalid environment configuration` on start | Read the listed variables; compare with `.env.example`. |
| `ECONNREFUSED :5432` | PostgreSQL isn't running / wrong `DATABASE_URL`. |
| Can't sign in on a plain-http deployment | Cookies are `Secure` in production. Use HTTPS, or `COOKIE_SECURE=false` for local testing only. |
| `Cross-origin request blocked` | Set `APP_URL` to the exact public origin (scheme + host). |
| Everyone gets rate-limited | Behind a proxy? set `TRUST_PROXY=1`. |
| Frontend shows "couldn't load the collection" | API unreachable or DB empty → run `db:seed`; check `/health`. |
| Port in use | Change `PORT`. |
| Windows: `npm start` fails | The script sets `NODE_ENV` POSIX-style; use WSL/Git Bash or set `NODE_ENV=production` yourself. |

## What changed from the original project (summary)

The original was a UI prototype with mock state. Notable fixes: the project did not install (esbuild/Vite peer conflict);
anyone was the hard-coded **Admin** and every admin endpoint was open; order totals were client-trusted; `/api/download-zip`
exposed the source and `.env`; Prisma schema couldn't store shades/sizes; `npm start` launched the dev server; the Compose file
referenced a missing Dockerfile and had no database; two competing service workers; fabricated analytics, AI metrics,
tracking numbers, "viewing now" counters and review counts; a fake card form claiming PCI compliance. All replaced by real logic.

**Prisma was replaced by `pg` + SQL migrations.** Prisma's engine binaries could not be downloaded in the environment used to
build this delivery, so Prisma code could not have been verified; plain SQL with explicit transactions and `SELECT … FOR UPDATE`
also suits the stock/promo concurrency requirements. The old `prisma/` folder is gone; the schema is in `server/db/migrations/`.

## Known limitations (please read)

- **Online card payment is not integrated.** Checkout supports *pay on delivery* (payment marked paid automatically on delivery, or via the staff API
  `PATCH /api/admin/orders/:id` with `paymentStatus`). Integrating a gateway needs your credentials and a verified provider flow; the `orders` table already has
  `payment_provider/payment_reference/payment_status` columns for it. Raw card data is never collected.
- **Tax is a flat configurable rate** (`TAX_RATE`) on all orders, and shipping fees/thresholds are fixed in `shared/commerce.ts`;
  use a tax service for real multi-jurisdiction compliance. Displayed currencies are *indicative* conversions; all orders are charged in USD.
- **Gemini and SMTP were not exercised against live services** (no credentials/network in the build environment). The Gemini
  integration is tested with a fake client (including malformed output and prompt-injection cases) and always falls back to
  catalogue-grounded rule-based answers; Maps grounding is untested live. Without SMTP, emails are logged, not sent.
- **Docker/Compose files were not built here** (no Docker daemon in the build environment). The Dockerfile's steps were replayed
  manually (clean `npm ci`, build, `npm ci --omit=dev`, boot with production settings, migrate, seed, health, login, SIGTERM) and
  the YAML files parse, but run `docker compose up --build` once to confirm on your host.
- Review photos accept https URLs only (no image upload storage); product images are URLs (admin enters them).
- Guests must sign in to check out; there is no guest order tracking. Product edit in the admin UI covers creation, stock and archiving;
  other fields can be changed through `PUT /api/admin/products/:id`.
- Starter catalogue, boutique directory, award text and marketing copy (returns policy, "authentic" claims) are **sample content** — replace/confirm before launch.
- The catalogue API returns up to 500 products per request and the storefront filters client-side; for very large catalogues add server-side pagination in the UI.
