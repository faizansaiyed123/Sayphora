# QA progress and resume notes

**Repository:** `faizansaiyed123/Sayphora`  
**Working branch:** `main` (no testing branch was created)  
**Purpose:** Durable handoff notes for the end-to-end testing and visual-evidence work. This is not a release certificate; use the linked CI runs for the latest actual result.

## Where the work stands

- The original CI pipeline covers TypeScript validation, 110 unit/API integration tests across 9 files against PostgreSQL 16, Playwright against the production build, and a Docker image build.
- The expanded browser suite covers the storefront and customer checkout, order tracking, verified reviews, staff order fulfilment, catalogue search, wishlist, formula comparison, shade match, skincare routine, boutique search/pickup, loyalty guest view, virtual try-on and ingredient diagnostics, plus offline/reconnection banners.
- The most recent failed run exposed an ambiguous Playwright heading locator: `getByRole('heading', { name: 'Shopping Bag' })` matched both the cart title and the “Added to Shopping Bag” toast. The exact-match fix is committed on `main` in both the feature test and the visual walkthrough.
- Latest CI run at the time of this note: [Run #39714770939](https://github.com/faizansaiyed123/Sayphora/actions/runs/39714770939). Check its current result before making further changes.
- A second concurrent run for the feature-test commit is [Run #39714655566](https://github.com/faizansaiyed123/Sayphora/actions/runs/39714655566). Earlier runs may still be executing on older commits; do not treat them as the latest branch result.
- The last recorded complete green browser run before the additional specialist journeys had 17 passing Playwright tests and 110 passing unit/API tests: [Run #39639468231](https://github.com/faizansaiyed123/Sayphora/actions/runs/39639468231). Newer failures were in added journeys/locators; the original checkout, account, review and staff flows continued passing.

## Visual evidence and publication

- The ordered walkthrough and individual PNGs live in [`VISUAL-TEST-WALKTHROUGH.md`](VISUAL-TEST-WALKTHROUGH.md) and [`visuals/`](visuals/).
- Screenshot publication runs only after the test suite and Docker job pass. Test failure screenshots and browser traces remain CI artifacts; they are not copied into the public visual walkthrough.
- The publishing workflow reads the E2E count from Playwright's JSON report, counts the PNGs dynamically, and removes older screenshots before copying a new successful set to avoid stale image files.
- The current published screenshots reflect the last successful publication. They should be refreshed automatically by CI after the expanded suite and image build pass.

## Test-data policy

Tests run against disposable PostgreSQL databases and the seeded catalog, prices, stock, promos and boutiques. Browser flows use plausible synthetic customer accounts and addresses (not production customer records). External actions such as live payment settlement and actual SMTP delivery are not attempted in CI.

## Still required before claiming full production end-to-end verification

1. Confirm the latest `main` CI run passes all unit/API tests, all Playwright tests, the Docker build, and the visual-publication job.
2. Review the newly generated walkthrough and manifest; confirm each screenshot is correctly ordered, captioned, readable, and from a successful checkpoint.
3. Separately verify a deployed environment and any live external credentials/integrations. The app's current payment provider is manual/pay-on-delivery, and live payment settlement, live email delivery, a configured Gemini provider, live map grounding, real carrier tracking, and production-domain HTTPS/cookie behavior are not proven by the isolated CI test run.

## Documentation follow-up

- `README.md` still says the Docker/Compose files were not built in the build environment. The CI workflow now contains a Docker image build job, and that job passed on earlier CI run [#39637423559](https://github.com/faizansaiyed123/Sayphora/actions/runs/39637423559). Once the latest expanded run is green, reconcile that README sentence with the actual evidence. Do not claim that a full Docker Compose deployment or live production startup was tested unless that separate check is performed.
