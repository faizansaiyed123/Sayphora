# Sayphora — CI Test Report

**Result:** PASS  
**Tested source commit:** [61d0e2076717f558f85000ba1b20183f734f58c4](https://github.com/faizansaiyed123/Sayphora/commit/61d0e2076717f558f85000ba1b20183f734f58c4)  
**CI run:** [Run #39714770939](https://github.com/faizansaiyed123/Sayphora/actions/runs/39714770939)  
**Branch:** main

| Check | Result |
|---|---|
| Clean dependency install (
added 581 packages in 5m

138 packages are looking for funding
  run `npm fund` for details) | PASS |
| TypeScript validation (
> sayphora@2.0.0 typecheck
> tsc --noEmit) | PASS |
| Unit and API integration suite | PASS — 110 tests across 9 files |
| Playwright browser suite | PASS — 21 tests |
| Docker image build | PASS — the required CI job must also succeed for the overall workflow to be green |
| Visual walkthrough | PASS — 21 curated screenshots |

The tests run in CI using a disposable PostgreSQL 16 service and Chromium. The visual journeys use the application's seeded catalog, prices, stock and promotions plus synthetic example.com customer accounts. No production customer accounts, production database, live payment, or live email delivery are used.

## Coverage

The suite checks catalogue rendering, registration, authentication and validation errors, cart persistence, stock rules, promotions, checkout, server-calculated order totals, order tracking, verified-purchase reviews, staff authorization, order status changes, API routing, migrations and selected security behaviors.

## Scope limits

This passing run does not by itself verify every production domain, every device/browser combination, live external AI providers, live email delivery, payment-provider settlement, real shipping carrier integrations, or the deployed production environment. Those need separate credentials and environment-specific checks.
