# Sayphora recruiter-demo hosting on Railway

## Runtime

Use one Railway application service from the `faizansaiyed123/Sayphora` GitHub repository plus one Railway PostgreSQL service.

The repository root contains the Dockerfile. Railway will use that Dockerfile for the application service. The image already listens on the Railway-provided `PORT`, exposes `/health`, runs the compiled Express server, and carries the SQL migrations into `dist-server/migrations`.

Railway deployment settings:

- Service source: GitHub → `faizansaiyed123/Sayphora` → `main`
- Builder: Dockerfile at repository root
- Healthcheck path: `/health`
- Healthcheck timeout: 300 seconds
- Restart policy: on failure
- Public networking: HTTP enabled for the application service

## PostgreSQL

Add a Railway PostgreSQL service and reference its connection string from the app service.

Required application variable:

- `DATABASE_URL=${{Postgres.DATABASE_URL}}` (use the actual Railway reference-variable picker rather than hard-coding a URL)

## Application variables

Set these on the Railway application service:

- `NODE_ENV=production`
- `PORT` is supplied by Railway; do not hard-code it
- `APP_URL=https://<the-final-public-sayphora-domain>`
- `COOKIE_SECURE=true`
- `TRUST_PROXY=true`
- `JWT_SECRET=<long-random-secret>`
- `RUN_MIGRATIONS_ON_START=true`
- `DEMO_SESSION_TTL_MINUTES=120`
- `RATE_LIMIT_DISABLED=false`
- `SEED_DEMO=false`

Optional features can stay disabled until explicitly configured:

- `GEMINI_API_KEY` empty unless AI integrations are intentionally enabled
- SMTP variables empty unless outbound email is intentionally enabled
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` should not be exposed to the public product and are not needed for recruiter access

## Recruiter demo behavior

The recruiter demo uses a disposable Customer row and the same production session cookie used by ordinary customers. Each visitor gets a unique temporary identity, a server-enforced expiry, real cart/order/reward ownership, and an explicit end-session deletion path.

Do not enable the old shared development demo account as the recruiter path.

Do not connect real payment settlement, real fulfilment, or customer data to this environment. The existing application uses its manual/test checkout path for the demo experience.

## Pre-deploy migration option

Railway supports a pre-deploy migration command. The compiled image contains the migration CLI, so the service can use:

`node dist-server/cli.js migrate`

Alternatively, the repository's `RUN_MIGRATIONS_ON_START=true` startup path runs migrations with an advisory lock. For a single-service recruiter demo, either is acceptable; do not run seed commands against production/customer data.

## Verification gate

Do not mark Sayphora `demoStatus` as live in the portfolio until a clean browser session has:

1. Opened the public site without an account.
2. Created the temporary recruiter workspace.
3. Loaded catalog data from the hosted API/PostgreSQL.
4. Added items and completed the real synthetic checkout flow.
5. Confirmed the resulting order is scoped to that temporary user.
6. Ended the demo and confirmed the temporary user is removed.
7. Reopened a new clean session and confirmed it receives a different user identity.

The public portfolio should continue to say `verification-pending` until all seven checks pass.