# Sayphora — Internal CI Coverage Notes

This document is for engineering and maintenance. For the visitor-facing project presentation, use the [Sayphora Product Walkthrough](../project-walkthrough/README.md).

**Current status:** [View the latest CI workflow run](https://github.com/faizansaiyed123/Sayphora/actions/workflows/ci.yml). This document describes what CI checks; it is not a live status badge or a release certificate.

## Automated checks

| Area | What the workflow checks |
|---|---|
| Static validation | Clean dependency installation and TypeScript type checking |
| Unit and API integration | Backend rules and endpoints against disposable PostgreSQL |
| Browser journeys | Playwright flows against the production build |
| Container build | Docker image build without publishing an image |
| Browser evidence | Run-specific Playwright reports and images uploaded as the `sayphora-ci-evidence` artifact for 14 days |

The codebase's automated coverage includes account/session rules, validation and access controls, catalogue discovery, cart and promotion behavior, checkout pricing, order state, reviews, wishlist, loyalty, admin actions, migrations and selected security rules.

## Data and environment limits

CI uses a disposable PostgreSQL database, seeded catalogue records and synthetic test accounts. It is not a live production-domain acceptance run and it does not use customer data.

A green CI run does not by itself prove live Gemini responses, live Maps grounding/GPS behavior, SMTP delivery, card payment settlement, carrier webhooks, physical-device installation, production-domain sessions, or backup/recovery procedures. Those capabilities require their own configuration and environment-specific checks.
