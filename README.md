# Sayphora — Recruiter Demo

The \`demo\` branch is an isolated, database-free demonstration of the Sayphora luxury beauty commerce application. The production-oriented \`main\` branch remains unchanged.

## Start

\`\`\`bash
npm ci
npm run dev
\`\`\`

Open the Vite URL and use **Sign In → Fill demo sign-in**.

### Demo access

- Email: \`demo@sayphora.demo\`
- Password: \`SayphoraDemo2026!\`
- Role: Admin / Rouge workspace

The demo uses the real Sayphora catalogue and review seed data from the repository, but all account, commerce, admin, AI and boutique interactions are handled by the browser simulator.

## Demonstration flows

Catalogue: product search, category filters, quick views, shades, ingredient diagnostics, comparison and virtual try-on.

Commerce: seeded sign-in, wishlist, shopping bag, promo validation, checkout, generated order, order tracking and cancellation.

Customer experience: beauty profile, saved address, rewards redemption, review creation and helpful/unhelpful voting.

Beauty intelligence: shade matching, skincare routine guidance, beauty consultant responses and boutique directory.

Operations: admin portal, catalogue editing, inventory adjustments, order-status changes, review moderation, analytics and promo management.

## Data behavior

The simulator stores its state in \`localStorage\` and the active session in \`sessionStorage\`. Use a private browser session or remove the \`sayphora_demo_state_v1\` key to reset the demo.

The demo does **not**:

- connect to PostgreSQL;
- send email;
- charge payments;
- call Gemini or Google Maps;
- use production secrets;
- execute database migrations.

AI and boutique features return deterministic demonstration responses so a recruiter can evaluate the UX without third-party credentials or network-dependent integrations.

## Switch back to the real stack

Set \`VITE_DEMO_MODE=false\` before starting Vite. The existing \`/api\` Express/PostgreSQL integration remains in the codebase and is used when demo mode is disabled.

## Validation

\`\`\`bash
npm run typecheck
npm run build
\`\`\`

The demo branch includes a separate read-only GitHub Actions workflow for typechecking and building this branch.
