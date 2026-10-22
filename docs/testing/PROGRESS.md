# QA handoff notes

**Repository:** `faizansaiyed123/Sayphora`  
**Working branch:** `main`  
**Purpose:** Internal maintenance context. These notes are not the public product walkthrough.

## Presentation vs. engineering evidence

- The public-facing tour lives at [`docs/project-walkthrough/README.md`](../project-walkthrough/README.md).
- The product tour and all 51 inline-linked screenshots live together under `docs/project-walkthrough/` and `docs/project-walkthrough/screenshots/`.
- Do not rename the public walkthrough back to a testing-oriented title or copy internal Playwright captions into it. It is meant for visitors, recruiters and interviewers to understand the product and the way customer/staff flows work.
- Automated evidence remains inside GitHub Actions artifacts. The workflow uploads `test-results/` as `sayphora-ci-evidence` for 14 days; it does not republish screenshots into tracked documentation or overwrite the product tour.

## CI coverage

The workflow runs typecheck, unit/API integration checks against disposable PostgreSQL, Playwright against the production build, and a Docker image build. See [the latest CI run](https://github.com/faizansaiyed123/Sayphora/actions/workflows/ci.yml) rather than assuming a historical report is current.

Coverage includes catalog/search, account registration and session behavior, bag/promo/checkout, order creation and status, product reviews, saved lists, loyalty, beauty-tool fallbacks, boutique selection, mobile navigation/offline behavior, and staff product/inventory/order/review/promotion operations.

## Boundaries to retain in future claims

- Seeded catalogue and synthetic customer data are used by automated browser journeys.
- Live Gemini generation, Google Maps grounding and GPS, SMTP delivery, card settlement, real carrier APIs/webhooks, physical-device installation and production-domain deployment behavior need separate verification.
- Checkout currently supports pay on delivery rather than a live card gateway.

Before describing CI as green, check the current GitHub Actions run. Before describing an external capability as live, verify it with the corresponding real configuration and service.
