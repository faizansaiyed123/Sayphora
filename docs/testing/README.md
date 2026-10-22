# Internal engineering checks

This directory is for project-maintenance notes, QA history and developer-only CI information.

The **public product tour is separate**: [Sayphora Product Walkthrough](../project-walkthrough/README.md). It presents the application's features and customer/staff journeys without internal test-report language.

## Where to see CI results

- [Current CI workflow runs](https://github.com/faizansaiyed123/Sayphora/actions/workflows/ci.yml) — use this page for the latest run and its status checks.
- Open a run and select **Artifacts** to inspect the temporary `sayphora-ci-evidence` bundle. It contains Playwright reports, screenshots and browser evidence from that run and is retained for 14 days.
- [CI coverage notes](TEST-REPORT.md) — the engineering scope and boundaries.
- [QA handoff notes](PROGRESS.md) — maintenance context and follow-up items.

CI evidence is no longer copied into the product walkthrough or committed to a testing-named screenshot gallery. That separation keeps the visitor-facing product tour stable and lets engineers inspect run-specific evidence independently.
