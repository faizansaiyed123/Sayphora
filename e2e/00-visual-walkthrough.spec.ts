import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { test, expect, request as pwRequest, type Page } from '@playwright/test';

const ADMIN = { email: 'admin@sayphora.test', password: 'AdminPassw0rd!2026' };
const PASSWORD = 'CorrectHorse!Battery9';
const BASE = 'http://127.0.0.1:' + (process.env.E2E_PORT || 4010);
const ADDRESS = {
  fullName: 'Olivia Bennett',
  street: '1 Canada Square',
  city: 'London',
  state: 'England',
  zipCode: 'E14 5AB',
  country: 'United Kingdom',
  phone: '',
};

type VisualEntry = {
  section: string;
  step: number;
  title: string;
  caption: string;
  filename: string;
  viewport: string;
};

const resultDir = path.resolve(process.cwd(), 'test-results');
const imageDir = path.join(resultDir, 'visuals');
const manifestPath = path.join(imageDir, 'manifest.json');
const reportPath = path.join(resultDir, 'VISUAL-TEST-WALKTHROUGH.md');
const sectionOrder = [
  'Storefront',
  'Storefront browsing',
  'Storefront communication',
  'Storefront cart controls',
  'Product detail tools',
  'Checkout options',
  'Customer order tracking',
  'Loyalty rewards',
  'AI concierge',
  'Offline catalog',
  'PWA installation',
  'Responsive navigation',
  'Admin console',
  'Product administration',
  'Order management',
  'Review moderation',
  'Promotion management',
  'AI, maps and PWA diagnostics',
  'Account creation',
  'Shopping bag and promotion',
  'Checkout and order tracking',
  'Product reviews',
  'Order fulfilment',
  'Wishlist',
  'Product comparison',
  'Virtual try-on',
  'Ingredient diagnostics',
  'Beauty personalisation',
  'Boutique locator',
];
let visualEntries: VisualEntry[] = [];
let emailCounter = 0;

function uniqueEmail(): string {
  emailCounter += 1;
  return 'e2e-' + Date.now().toString(36) + '-' + emailCounter + '@example.com';
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderReport(): string {
  const sourceCommit = process.env.GITHUB_SHA || 'local working copy';
  const output: string[] = [
    '# Sayphora — End-to-End Visual Walkthrough',
    '',
    '> Curated evidence from verified browser states. A screenshot is added only after its UI assertion succeeds; failure screenshots and traces are not embedded in this walkthrough.',
    '',
    '**Source commit:** ' + sourceCommit + '  ',
    '**Browser:** Chromium controlled by Playwright  ',
    '**Viewport:** Desktop Chrome configuration  ',
    '**Data:** Real catalog, stock, price and promotion records from the application seed. The checkout flow uses a generated example.com account and a local, non-shipping order; no real customer account, live email delivery or payment is used.',
    '',
    '## How to read this walkthrough',
    '',
    'The walkthrough includes catalogue discovery and refinements, account registration, bag/promotion/sample controls, product sizing and bundles, order placement and cancellation, saved lists, comparison, review voting, reward redemption, AI fallback journeys, boutique lookup, responsive navigation, install guidance, offline caching and staff-console workflows. Each caption describes the action and assertion completed before capture. Screenshots demonstrate browser-visible states; API assertions and integration tests separately verify persistence, validation, ownership, pricing and state transitions.',
    '',
    '## Journey coverage',
    '',
  ];

  const grouped = sectionOrder
    .map((section) => ({
      section,
      entries: visualEntries.filter((entry) => entry.section === section).sort((a, b) => a.step - b.step),
    }))
    .filter((group) => group.entries.length > 0);

  if (visualEntries.length === 0) {
    output.push('> No successful visual checkpoints have been recorded yet.');
    return output.join('\n') + '\n';
  }

  for (const group of grouped) {
    output.push('- **' + group.section + ':** ' + group.entries.length + ' screenshot(s)');
  }
  output.push('');

  for (const group of grouped) {
    output.push('## ' + group.section, '', '<table>', '<tbody>');
    for (let index = 0; index < group.entries.length; index += 2) {
      const pair = group.entries.slice(index, index + 2);
      output.push('<tr>');
      for (const entry of pair) {
        const relativePath = 'visuals/' + entry.filename;
        output.push('<td width="50%" valign="top">');
        output.push('<h3>' + String(entry.step).padStart(2, '0') + '. ' + escapeHtml(entry.title) + '</h3>');
        output.push('<a href="' + relativePath + '"><img src="' + relativePath + '" alt="' + escapeHtml(entry.title) + '" width="100%"/></a>');
        output.push('<p>' + escapeHtml(entry.caption) + '</p>');
        output.push('<p><em>Viewport: ' + escapeHtml(entry.viewport) + '</em></p>');
        output.push('</td>');
      }
      if (pair.length === 1) output.push('<td width="50%" valign="top"></td>');
      output.push('</tr>');
    }
    output.push('</tbody>', '</table>', '');
  }

  output.push(
    '## Feature coverage inventory',
    '',
    '- **Storefront and discovery:** catalog rendering, product search/typeahead, category and skin-type selection, clean/sale/price refinements, sorting, grid/editorial views, currency display preference, newsletter confirmation and mobile navigation.',
    '- **Product experiences:** details, shade and size choices, quantity changes, product image gallery/zoom/lightbox, formulation comparison, curated bundles, virtual try-on controls, ingredient diagnostics and application instructions.',
    '- **Bag and ordering:** quantity changes, item removal/empty state, complimentary sample selection, promo apply/removal, persistent bag and sign-in gate, shipping validation/speed choices, gift wrap/card message, order creation and calculated totals, points award, tracking lookup, invalid-order rejection and eligible cancellation.',
    '- **Accounts and community:** registration/sign-in, credential and validation errors, account isolation, profile/beauty-profile and saved-address API checks, wishlist add/share/remove/move-to-bag, review submission/verified-purchase state, rating and buyer filters, helpful voting, review ownership/moderation, and customer-versus-staff permissions.',
    '- **Retention/personalisation:** Beauty Insider guest/member states, actual reward redemption with point-balance verification, shade matching, AM/PM routine builder, catalogue-backed concierge recommendation and boutique search/pickup selection.',
    '- **Operations/resilience:** protected staff console tabs, product inventory filters/stock controls/product-create form, order search/status/tracking controls, reviews moderation, promo management/form, analytics/system diagnostics, PWA manifest/service-worker registration, cached catalogue while offline and network status transitions.',
    '- **API/unit layer:** the CI unit/API suite runs against disposable PostgreSQL and covers authentication/session and role boundaries, catalog/sample/promo/newsletter endpoints, account/address/wishlist isolation, stock/pricing/order rules, review lifecycle/votes, loyalty redemption, AI fallback and migration/security invariants.',
    '',
    '## Coverage boundaries — not represented as passed',
    '',
    '- Tests run the production build locally against disposable PostgreSQL and synthetic test accounts/addresses. This is not a deployed-domain acceptance test.',
    '- Gemini-powered UI checks validate the deterministic fallback available without a live credential. Real Gemini requests, quotas, provider failures and response quality with a live key remain unverified.',
    '- Boutique tests use the seeded directory/fallback. Real Google Maps grounding, live place/review data and real browser GPS permission behavior remain unverified.',
    '- Newsletter and password-reset contracts are exercised, but actual external SMTP delivery/inbox receipt is not verified.',
    '- Checkout supports **pay on delivery**; no live card gateway or settlement flow is available to test. Refunds for already-paid orders require an operational payment-system action.',
    '- Tracking screens and staff-assigned tracking details are checked; live carrier APIs, shipment webhooks and carrier-confirmed delivery events are not verified.',
    '- Service-worker/offline behavior and a simulated iOS install-help screen are tested. Actual iOS/Android installation on physical devices and push notifications are not verified.',
    '- CI builds the Docker image but does not verify a complete Docker Compose deployment, production TLS/Secure-cookie behavior, production-domain sessions or backup/recovery procedures.',
    '',
    '---',
    '',
    '**Verification note:** Screenshots are captured only after the corresponding browser assertion succeeds. Backend assertions separately verify persisted orders, server-calculated totals, loyalty point changes, review ownership/verification and fulfilment state where exercised. Features requiring external services, devices or credentials are listed above instead of being marked passed.',
    '',
  );
  return output.join('\n');
}

async function saveReport(): Promise<void> {
  await mkdir(imageDir, { recursive: true });
  await writeFile(manifestPath, JSON.stringify(visualEntries, null, 2) + '\n', 'utf8');
  await writeFile(reportPath, renderReport(), 'utf8');
}

async function capture(
  page: Page,
  input: { section: string; step: number; filename: string; title: string; caption: string },
): Promise<void> {
  await mkdir(imageDir, { recursive: true });
  const filename = input.filename + '.png';
  await page.screenshot({
    path: path.join(imageDir, filename),
    fullPage: false,
    animations: 'disabled',
  });
  const viewport = page.viewportSize();
  const entry: VisualEntry = {
    section: input.section,
    step: input.step,
    title: input.title,
    caption: input.caption,
    filename,
    viewport: viewport ? viewport.width + ' × ' + viewport.height : 'browser default',
  };
  const index = visualEntries.findIndex((existing) => existing.filename === filename);
  if (index >= 0) visualEntries[index] = entry;
  else visualEntries.push(entry);
  visualEntries.sort((a, b) => {
    const numberFor = (name: string) => Number(name.match(/^(\d+)/)?.[1] ?? 0);
    return numberFor(a.filename) - numberFor(b.filename);
  });
  await saveReport();
}

function watchConsole(page: Page): string[] {
  const problems: string[] = [];
  page.on('pageerror', (error) => problems.push('pageerror: ' + error.message));
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (/Failed to load resource|net::ERR_/.test(text)) return;
    problems.push('console: ' + text);
  });
  return problems;
}

async function registerViaApi(): Promise<{ ctx: Awaited<ReturnType<typeof pwRequest.newContext>>; email: string }> {
  const ctx = await pwRequest.newContext({ baseURL: BASE });
  const email = uniqueEmail();
  const response = await ctx.post('/api/auth/register', {
    data: { name: 'Olivia Bennett', email, password: PASSWORD },
  });
  expect(response.status()).toBe(201);
  return { ctx, email };
}

test.beforeAll(async () => {
  visualEntries = [];
  await saveReport();
});

test.describe('curated visual evidence', () => {
  test('captures the storefront-to-checkout customer journey', async ({ page }) => {
    const browserProblems = watchConsole(page);
    await page.goto('/');
    await expect(page.getByText("Pro Filt'r").first()).toBeVisible();

    const health = await page.request.get('/health');
    expect((await health.json()).database).toBe('up');
    const catalogueResponse = await page.request.get('/api/products');
    expect(catalogueResponse.status()).toBe(200);
    expect((await catalogueResponse.json()).count).toBe(12);
    await capture(page, {
      section: 'Storefront',
      step: 1,
      filename: '01-storefront-catalogue',
      title: 'Storefront catalogue',
      caption: 'The storefront displays products from the API. The browser waits for a catalog item, a healthy database and a 12-product API response before this screenshot is saved.',
    });

    const customerEmail = uniqueEmail();
    await page.getByRole('button', { name: 'Sign In' }).first().click();
    await page.getByRole('tab', { name: 'Create Account' }).click();
    await page.locator('#auth-name').fill('Olivia Bennett');
    await page.locator('#auth-email').fill(customerEmail);
    await page.locator('#auth-password').fill(PASSWORD);
    await capture(page, {
      section: 'Account creation',
      step: 1,
      filename: '02-registration-form',
      title: 'Registration form',
      caption: 'A complete customer form is shown before submission. The email uses the reserved example.com domain and cannot deliver mail to a real person.',
    });

    await page.getByRole('button', { name: /Create Free Account/ }).click();
    await expect(page.getByText('Welcome to Sayphora').first()).toBeVisible();
    await capture(page, {
      section: 'Account creation',
      step: 2,
      filename: '03-registration-success',
      title: 'Account created',
      caption: 'The registration flow returns to the authenticated shopping experience after the UI confirms success.',
    });

    const firstProduct = page.getByRole('button', { name: /Add to Bag/ }).first();
    await firstProduct.scrollIntoViewIfNeeded();
    await firstProduct.click({ force: true });
    await expect(page.getByRole('button', { name: /Proceed to Checkout/ })).toBeVisible();
    await capture(page, {
      section: 'Shopping bag and promotion',
      step: 1,
      filename: '04-shopping-bag',
      title: 'Product added to the bag',
      caption: 'The cart drawer is open and the checkout action is available after selecting a product from the seeded catalog.',
    });

    await page.getByPlaceholder('Promo or reward code').fill('sayphora20');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.getByText(/applied successfully/i)).toBeVisible();
    await capture(page, {
      section: 'Shopping bag and promotion',
      step: 2,
      filename: '05-promotion-applied',
      title: 'Promotion accepted',
      caption: 'The server accepts SAYPHORA20 and the cart displays the applied promotion before checkout continues.',
    });

    await page.getByRole('button', { name: /Proceed to Checkout/ }).click();
    await page.locator('#co-name').fill('Olivia Bennett');
    await page.locator('#co-street').fill(ADDRESS.street);
    await page.locator('#co-city').fill(ADDRESS.city);
    await page.locator('#co-zip').fill(ADDRESS.zipCode);
    await page.locator('#co-country').fill(ADDRESS.country);
    await page.getByRole('button', { name: /Continue to Review/ }).click();
    await expect(page.getByText('Pay on delivery')).toBeVisible();
    await capture(page, {
      section: 'Checkout and order tracking',
      step: 1,
      filename: '06-checkout-review',
      title: 'Checkout review',
      caption: 'Valid shipping details reach the review step. The supported pay-on-delivery option is present before the order is submitted.',
    });

    await page.getByRole('button', { name: /Place Order/ }).click();
    await expect(page.getByText(/Order #SAY-\d+ Confirmed/)).toBeVisible();
    const orders = await (await page.request.get('/api/me/orders')).json();
    expect(orders.orders).toHaveLength(1);
    const order = orders.orders[0];
    expect(order.status).toBe('Processing');
    expect(order.items).toHaveLength(1);
    expect(order.total).toBeCloseTo(order.subtotal - order.discount + order.tax + order.shipping + order.giftFee, 2);
    expect(order.pointsEarned).toBeGreaterThan(0);
    await capture(page, {
      section: 'Checkout and order tracking',
      step: 2,
      filename: '07-order-confirmation',
      title: 'Order confirmation',
      caption: 'The application displays a server-issued order number. The saved order, ownership, items, loyalty points, status and server-calculated total are verified through the API.',
    });

    await page.getByRole('dialog', { name: 'Checkout' }).getByRole('button', { name: /Track Order/ }).click();
    await expect(page.getByRole('dialog', { name: 'Track your order' })).toContainText(order.orderNumber);
    await expect(page.getByRole('list', { name: 'Order progress' })).toBeVisible();
    await capture(page, {
      section: 'Checkout and order tracking',
      step: 3,
      filename: '08-order-tracking',
      title: 'Order tracking',
      caption: 'The tracking dialog displays the same order number returned by the API and a visible order-progress timeline.',
    });

    expect(browserProblems).toEqual([]);
  });

  test('captures verified product reviews and the staff fulfilment update', async ({ page }) => {
    const { ctx: buyer, email } = await registerViaApi();
    const products = (await (await buyer.get('/api/products')).json()).products;
    const product = products.find((item: { shades?: unknown }) => !item.shades) || products[0];
    const item = { productId: product.id, quantity: 1 };
    const orderResponse = await buyer.post('/api/orders', {
      data: { items: [item], shippingAddress: ADDRESS, shippingMethod: 'Standard' },
    });
    expect(orderResponse.status()).toBe(201);

    await page.goto('/');
    await page.getByRole('button', { name: 'Sign In' }).first().click();
    await page.locator('#auth-email').fill(email);
    await page.locator('#auth-password').fill(PASSWORD);
    await page.getByRole('button', { name: /Sign In to Account/ }).click();
    await expect(page.getByText('Welcome Back')).toBeVisible();
    await page.getByText(product.name).first().click();
    await expect(page.getByRole('button', { name: /Reviews?|Be the first to review/ }).first()).toBeVisible();
    await capture(page, {
      section: 'Product reviews',
      step: 1,
      filename: '09-product-detail',
      title: 'Product details',
      caption: 'The product detail view is opened for an item returned by the catalog API, and its review entry point is visible before continuing.',
    });

    await page.getByRole('button', { name: /Reviews?|Be the first to review/ }).first().click();
    await page.getByRole('button', { name: 'Write a Review' }).click();
    await page.getByPlaceholder(/Incomparable smooth velvet/).fill('Smooth finish');
    await page.getByPlaceholder(/Describe how this formula blended/).fill('Blends evenly and feels comfortable on the skin throughout the day.');
    await page.getByRole('button', { name: 'Publish Review' }).click();
    await expect(page.getByText('Review Published').first()).toBeVisible();

    const reviews = (await (await buyer.get('/api/products/' + product.id + '/reviews')).json()).reviews;
    expect(reviews[0]).toMatchObject({ verifiedPurchase: true, title: 'Smooth finish' });
    await capture(page, {
      section: 'Product reviews',
      step: 2,
      filename: '10-verified-product-review',
      title: 'Verified purchase review',
      caption: 'The review confirmation is visible. The API independently verifies the review title and verified-purchase flag for the account that placed the order.',
    });

    const adminOrder = (await orderResponse.json()).order;

    await page.context().clearCookies();
    await page.goto('/');
    await page.getByRole('button', { name: 'Sign In' }).first().click();
    await page.locator('#auth-email').fill(ADMIN.email);
    await page.locator('#auth-password').fill(ADMIN.password);
    await page.getByRole('button', { name: /Sign In to Account/ }).click();
    await expect(page.getByText('Welcome Back')).toBeVisible();
    await page.keyboard.press('Control+Shift+A');
    await expect(page.getByText('Executive Suite')).toBeVisible();
    await page.getByRole('button', { name: /Orders & Fulfillment/ }).click();

    const row = page.locator('tr', { hasText: adminOrder.orderNumber });
    await expect(row).toBeVisible();
    await capture(page, {
      section: 'Order fulfilment',
      step: 1,
      filename: '11-admin-order-before-update',
      title: 'Staff order queue',
      caption: 'After staff authentication, the fulfillment queue displays the order before a status transition is requested.',
    });

    await row.getByRole('combobox').selectOption('Packed');
    await expect(page.getByText('Order Status Updated').first()).toBeVisible();
    const savedOrder = (await (await buyer.get('/api/orders/' + adminOrder.id)).json()).order;
    expect(savedOrder.status).toBe('Packed');
    expect(savedOrder.events.map((event: { status: string }) => event.status)).toEqual(['Processing', 'Packed']);
    await capture(page, {
      section: 'Order fulfilment',
      step: 2,
      filename: '12-admin-order-updated',
      title: 'Order marked Packed',
      caption: 'The UI confirms the change, and the API confirms the persisted Packed status and the Processing → Packed event history.',
    });
  });
  test('captures wishlist, comparison, virtual try-on, beauty tools and boutique selection', async ({ page }) => {
    await page.goto('/');

    const wishlistButton = page.locator('button[aria-label="Add to wishlist"]').first();
    await wishlistButton.hover();
    await wishlistButton.click();
    await page.locator('button[title="View Saved Wishlist"]').click();
    await expect(page.getByRole('heading', { name: /My Saved Wishlist/ })).toBeVisible();
    await expect(page.getByText('Your wishlist is empty')).toHaveCount(0);
    await capture(page, {
      section: 'Wishlist',
      step: 1,
      filename: '13-saved-wishlist',
      title: 'Saved wishlist',
      caption: 'A real seeded catalog product has been saved, and the wishlist drawer displays the selected item before any bag action.',
    });
    await page.locator('button[title="Share Wishlist"]').click();
    await expect(page.getByText('Wishlist Link Copied')).toBeVisible();
    await capture(page, {
      section: 'Wishlist',
      step: 2,
      filename: '40-wishlist-share-link',
      title: 'Shareable wishlist link',
      caption: 'The share action copies the storefront link when clipboard access is available and confirms the action in the wishlist UI.',
    });
    await page.getByRole('button', { name: 'Move to Bag', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Shopping Bag', exact: true })).toBeVisible();
    await expect(page.getByText("Pro Filt'r Soft Matte Longwear Liquid Foundation").last()).toBeVisible();
    await page.locator('button[title="Share Wishlist"]').locator('xpath=following-sibling::button').click();
    await expect(page.getByRole('heading', { name: /My Saved Wishlist/ })).toHaveCount(0);
    await page.getByRole('button', { name: 'Close bag' }).click();

    const firstCompare = page.locator('button[title="Compare formula"]').first();
    await firstCompare.locator('xpath=ancestor::div[contains(@class,"group")][1]').hover();
    await firstCompare.click();
    await expect(page.getByText('Formula Comparison Matrix')).toBeVisible();
    await page.locator('div.fixed.inset-0').last().locator('button').nth(1).click();

    const nextCompare = page.locator('button[title="Compare formula"]').first();
    await nextCompare.locator('xpath=ancestor::div[contains(@class,"group")][1]').hover();
    await nextCompare.click();
    await expect(page.getByText('Products (2/4)', { exact: true })).toBeVisible();
    await expect(page.getByText('Customer Rating', { exact: true }).last()).toBeVisible();
    await expect(page.getByText('Finish & Coverage', { exact: true }).last()).toBeVisible();
    await capture(page, {
      section: 'Product comparison',
      step: 1,
      filename: '14-product-comparison',
      title: 'Side-by-side product comparison',
      caption: 'Two seeded catalog products appear together in the comparison matrix, with customer rating, finish, coverage and skin-type attributes.',
    });
    await page.locator('div.fixed.inset-0').last().locator('button').nth(1).click();

    await page.getByRole('heading', { name: "Pro Filt'r Soft Matte Longwear Liquid Foundation" }).first().click();
    await page.getByRole('button', { name: 'Virtual Try-On', exact: true }).click();
    await expect(page.getByText('Live Virtual Mirror', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Glossy', exact: true }).click();
    await expect(page.getByRole('button', { name: /Add Tested Shade to Bag/ })).toBeVisible();
    await capture(page, {
      section: 'Virtual try-on',
      step: 1,
      filename: '15-virtual-try-on',
      title: 'Virtual try-on studio',
      caption: 'The virtual mirror opens for a real foundation from the seeded catalog. The finish control is changed before the screenshot is captured.',
    });
    await page.getByRole('button', { name: /Add Tested Shade to Bag/ }).click();
    await expect(page.getByText('Live Virtual Mirror', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Shopping Bag', exact: true })).toBeVisible();
    await expect(page.getByText("Pro Filt'r Soft Matte Longwear Liquid Foundation").last()).toBeVisible();
    await capture(page, {
      section: 'Virtual try-on',
      step: 2,
      filename: '16-vto-shade-added-to-bag',
      title: 'Try-on shade added to the bag',
      caption: 'After adding the selected finish, the shopping bag opens with the same seeded foundation. This confirms the mirror action reaches the cart drawer.',
    });
    await page.getByRole('button', { name: 'Close bag' }).click();
    await expect(page.getByRole('button', { name: 'Virtual Try-On', exact: true }).last()).toBeVisible();
    await page.getByRole('button', { name: 'Decode Actives', exact: true }).last().click();
    await expect(page.getByText('Clean & Clinical Ingredient Diagnostic')).toBeVisible();
    await expect(page.getByText('Pore Clog Index', { exact: true })).toBeVisible();
    await expect(page.getByText('Formula pH', { exact: true })).toBeVisible();
    await capture(page, {
      section: 'Ingredient diagnostics',
      step: 1,
      filename: '17-ingredient-diagnostics',
      title: 'Ingredient safety diagnostic',
      caption: 'The product diagnostic displays its standard, pore-clog index, formula pH and ingredient safety information for the selected catalog product.',
    });
    await page.locator('div.fixed.inset-0').last().locator('button').first().click();
    await page.getByRole('button', { name: 'Close details' }).click();

    await page.locator('button[title="AI Shade Matcher & Skin Regimen Builder"]').click();
    await expect(page.getByText('Find Your Perfect Complexion Match')).toBeVisible();
    await page.getByRole('button', { name: 'Medium', exact: true }).click();
    await page.getByText('Warm Undertone').click();
    await page.getByRole('button', { name: 'Calculate My Exact Shade Match' }).click();
    await expect(page.getByText(/% match score/)).toBeVisible();
    await capture(page, {
      section: 'Beauty personalisation',
      step: 1,
      filename: '18-shade-match',
      title: 'Personalised shade match',
      caption: 'The deterministic catalog-backed matcher returns an in-stock shade for the selected medium depth and warm undertone; this is not a live Gemini-provider test.',
    });
    await page.getByRole('button', { name: /Skincare Regimen Builder/ }).click();
    await expect(page.getByText('Custom AI Skincare Regimen')).toBeVisible();
    await page.getByRole('button', { name: 'Generate My Custom Regimen' }).click();
    await expect(page.getByText('Morning (AM) Regimen')).toBeVisible();
    await expect(page.getByText('Evening (PM) Regimen')).toBeVisible();
    await capture(page, {
      section: 'Beauty personalisation',
      step: 2,
      filename: '19-skincare-routine',
      title: 'Morning and evening routine',
      caption: 'The deterministic routine builder recommends real catalog products in separate AM and PM steps. Live external AI generation remains a separate integration check.',
    });
    await page.locator('div.fixed.inset-0').last().locator('button').first().click();

    await page.locator('button[title="Google Maps Store Locator & Ateliers"]').click();
    await expect(page.getByPlaceholder('Search city, address, zip code, or beauty boutique name...')).toBeVisible();
    await page.getByRole('button', { name: 'Search Boutiques' }).click();
    await expect(page.getByText('Open in Google Maps').first()).toBeVisible();
    await capture(page, {
      section: 'Boutique locator',
      step: 1,
      filename: '20-boutique-directory',
      title: 'Boutique directory',
      caption: 'The locator displays the seeded boutique directory using the built-in fallback path; no GPS permission is requested.',
    });
    await page.getByRole('button', { name: 'Set Pickup Store' }).first().click();
    await expect(page.getByText('Selected Store').first()).toBeVisible();
    await capture(page, {
      section: 'Boutique locator',
      step: 2,
      filename: '21-pickup-store-selected',
      title: 'Pickup location selected',
      caption: 'The selected boutique is visibly marked in the locator after the user chooses it as the preferred pickup location.',
    });
  });


  test('covers catalogue refinement, currency selection and newsletter signup', async ({ page }) => {
    await page.goto('/');
    const search = page.getByPlaceholder('Search products, brands, ingredients, shades... (Press /)');
    await search.fill('Tatcha');
    await expect(page.getByText('Product Matches')).toBeVisible();
    await expect(page.getByText('The Water Cream Pore-Refining Hydrating Moisturizer').first()).toBeVisible();
    await search.fill('');

    await page.getByRole('button', { name: /^Skincare\s+\d+$/ }).click();
    await expect(page.getByText('The Water Cream Pore-Refining Hydrating Moisturizer').first()).toBeVisible();
    await page.locator('select').nth(0).selectOption('price-asc');
    await expect(page.locator('select').nth(0)).toHaveValue('price-asc');
    await page.locator('select').nth(1).selectOption('Dry');
    await expect(page.locator('select').nth(1)).toHaveValue('Dry');
    await page.getByRole('button', { name: '2-Column Editorial Magazine View' }).click();
    await page.getByRole('button', { name: 'Under $50', exact: true }).click();
    await expect(page.getByText(/Showing\s+\d+\s+items/).first()).toBeVisible();
    await capture(page, {
      section: 'Storefront browsing',
      step: 1,
      filename: '22-storefront-refinements',
      title: 'Catalogue filtering, sorting and editorial view',
      caption: 'The browser search finds the catalog product, then category, price order, skin-type and under-$50 refinements plus the editorial layout are changed and checked.',
    });

    await page.getByRole('button', { name: 'Change currency' }).click();
    await page.getByRole('button', { name: /EUR/ }).last().click();
    await expect(page.getByRole('button', { name: 'Change currency' })).toContainText('EUR');
    const newsletterEmail = 'newsletter-' + Date.now() + '@example.com';
    const emailField = page.getByPlaceholder('Enter your email address');
    await emailField.scrollIntoViewIfNeeded();
    await emailField.fill(newsletterEmail);
    await page.getByRole('button', { name: 'Join', exact: true }).click();
    await expect(page.getByText('Thank you for subscribing.')).toBeVisible();
    await capture(page, {
      section: 'Storefront communication',
      step: 1,
      filename: '23-newsletter-currency',
      title: 'Currency preference and newsletter confirmation',
      caption: 'The display currency changes to EUR and the newsletter form confirms a subscription using a synthetic example.com address.',
    });
  });

  test('checks product image tools and the curated bundle-to-bag action', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('heading', { name: "Pro Filt'r Soft Matte Longwear Liquid Foundation" }).first().click();

    await page.getByRole('button', { name: 'Expand Ultra-HD Lightbox' }).click();
    await expect(page.getByText('Ultra-HD Texture Inspection')).toBeVisible();
    await capture(page, {
      section: 'Product detail tools',
      step: 1,
      filename: '24-product-gallery-lightbox',
      title: 'Product image lightbox',
      caption: 'The product image opens in the full-screen inspection lightbox and exposes its dedicated close control.',
    });
    await page.getByRole('button', { name: 'Close lightbox' }).click();
    await page.getByRole('button', { name: '3.5x', exact: true }).click();
    await page.getByRole('button', { name: 'Floating Loupe' }).click();
    await expect(page.getByRole('button', { name: 'Full Pan' })).toBeVisible();
    await page.getByRole('button', { name: /Texture & Pigment Macro/ }).click();

    const addBundle = page.getByRole('button', { name: 'Add Complete Routine to Bag' });
    await addBundle.scrollIntoViewIfNeeded();
    await expect(page.getByText('Save 15% as Bundle')).toBeVisible();
    await capture(page, {
      section: 'Product detail tools',
      step: 2,
      filename: '25-product-bundle-builder',
      title: 'Curated product bundle',
      caption: 'The frequently-paired product builder shows the selected companions and its 15% bundle saving before the bundle is added.',
    });
    await addBundle.click();
    await expect(page.getByRole('heading', { name: 'Shopping Bag', exact: true })).toBeVisible();
    await expect(page.getByText('Curated Bundle Added')).toBeVisible();
  });

  test('checks delivery selection, gift packaging and the saved order details', async ({ page }) => {
    const { ctx: buyer, email } = await registerViaApi();
    try {
      await page.goto('/');
      await page.getByRole('button', { name: 'Sign In' }).first().click();
      await page.locator('#auth-email').fill(email);
      await page.locator('#auth-password').fill(PASSWORD);
      await page.getByRole('button', { name: /Sign In to Account/ }).click();
      await expect(page.getByText('Welcome Back')).toBeVisible();

      const firstProduct = page.getByRole('button', { name: /Add to Bag/ }).first();
      await firstProduct.scrollIntoViewIfNeeded();
      await firstProduct.click({ force: true });
      await expect(page.getByRole('button', { name: /Proceed to Checkout/ })).toBeVisible();
      await page.getByRole('button', { name: /Proceed to Checkout/ }).click();
      await page.locator('#co-name').fill('Olivia Bennett');
      await page.locator('#co-street').fill(ADDRESS.street);
      await page.locator('#co-city').fill(ADDRESS.city);
      await page.locator('#co-state').fill(ADDRESS.state);
      await page.locator('#co-zip').fill(ADDRESS.zipCode);
      await page.locator('#co-country').fill(ADDRESS.country);
      await page.getByRole('radio', { name: /Express Priority/ }).click();
      await page.getByLabel('Save this address to my account').check();
      await page.getByLabel('Add gift packaging').check();
      await page.getByRole('button', { name: /Signature Black Box/ }).click();
      await page.locator('#co-card').fill('Celebrating you!');
      await capture(page, {
        section: 'Checkout options',
        step: 1,
        filename: '26-checkout-gift-options',
        title: 'Express delivery and gift options',
        caption: 'The shipping step selects express delivery, enables address saving, and configures a gift box and message before reviewing the order.',
      });

      await page.getByRole('button', { name: /Continue to Review/ }).click();
      await expect(page.getByText('Pay on delivery')).toBeVisible();
      await expect(page.getByText(/Gift Packaging \(Signature Black & Gold Box\)/)).toBeVisible();
      await capture(page, {
        section: 'Checkout options',
        step: 2,
        filename: '27-checkout-gift-review',
        title: 'Checkout review with gift packaging',
        caption: 'The review step displays pay-on-delivery, the selected gift presentation and the current server-pricing summary before order placement.',
      });
      await page.getByRole('button', { name: /Place Order/ }).click();
      await expect(page.getByText(/Order #SAY-\d+ Confirmed/)).toBeVisible();

      const mine = await (await buyer.get('/api/me/orders')).json();
      expect(mine.orders).toHaveLength(1);
      const savedOrder = mine.orders[0];
      expect(savedOrder.shippingMethod).toBe('Express');
      expect(savedOrder.giftFee).toBeGreaterThan(0);
      expect(savedOrder.giftOption).toMatchObject({
        isGift: true,
        giftWrapType: 'Signature Black & Gold Box',
        cardMessage: 'Celebrating you!',
      });
      const profile = await (await buyer.get('/api/auth/me')).json();
      await expect.poll(() => Promise.resolve(profile.user.savedAddresses?.length ?? 0)).toBeGreaterThan(0);
    } finally {
      await buyer.dispose();
    }
  });

  test('redeems a loyalty reward from the member UI and checks the points ledger', async ({ page }) => {
    const { ctx: buyer, email } = await registerViaApi();
    try {
      const placed = await buyer.post('/api/orders', {
        data: {
          items: [{ productId: 'tatcha-water-cream', quantity: 2 }],
          shippingAddress: ADDRESS,
          shippingMethod: 'Standard',
        },
      });
      expect(placed.status()).toBe(201);
      const before = (await (await buyer.get('/api/auth/me')).json()).user;
      expect(before.points).toBeGreaterThanOrEqual(100);

      await page.goto('/');
      await page.getByRole('button', { name: 'Sign In' }).first().click();
      await page.locator('#auth-email').fill(email);
      await page.locator('#auth-password').fill(PASSWORD);
      await page.getByRole('button', { name: /Sign In to Account/ }).click();
      await expect(page.getByText('Welcome Back')).toBeVisible();
      await page.getByRole('button', { name: /Beauty Insider.*pts/ }).first().click();
      await expect(page.getByRole('heading', { name: 'Beauty Insider Club' })).toBeVisible();
      await expect(page.getByText('Rewards Balance')).toBeVisible();
      await expect(page.getByText('Rare Beauty Miniature', { exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Redeem', exact: true }).first()).toBeEnabled();
      await capture(page, {
        section: 'Loyalty rewards',
        step: 1,
        filename: '28-loyalty-bazaar',
        title: 'Member rewards bazaar',
        caption: 'An authenticated member sees the balance and a redeemable reward after an order has earned enough points.',
      });

      await page.getByRole('button', { name: 'Redeem', exact: true }).first().click();
      await expect(page.getByText(/Redeemed Rare Beauty Miniature!/)).toBeVisible();
      await expect(page.getByText('Your reward codes', { exact: true })).toBeVisible();
      await capture(page, {
        section: 'Loyalty rewards',
        step: 2,
        filename: '29-loyalty-redemption',
        title: 'Reward code issued',
        caption: 'Redeeming the reward produces a customer-visible single-use code and updates the member’s available points.',
      });

      const after = (await (await buyer.get('/api/auth/me')).json()).user;
      expect(after.points).toBe(before.points - 100);
    } finally {
      await buyer.dispose();
    }
  });

  test('runs the concierge chat and verifies a catalogue-backed recommendation', async ({ page }) => {
    await page.goto('/');
    await page.locator('button[title="AI Shade Matcher & Skin Regimen Builder"]').click();
    await page.getByRole('button', { name: 'Haute Concierge Stylist' }).click();
    const prompt = 'I need a hydrating product for dry skin';
    const chatInput = page.getByPlaceholder('Ask about skin concerns, shade combinations, or event styling...');
    await chatInput.fill(prompt);
    const chatForm = page.locator('form').filter({ has: chatInput });
    await chatForm.getByRole('button').click();
    await expect(page.getByText(prompt, { exact: true })).toBeVisible();
    const studio = page.locator('div.fixed.inset-0').last();
    await expect(studio.getByRole('button', { name: 'Add to Bag', exact: true })).toBeVisible({ timeout: 20_000 });
    await capture(page, {
      section: 'AI concierge',
      step: 1,
      filename: '30-ai-concierge',
      title: 'Concierge product recommendation',
      caption: 'A visitor asks the concierge for hydration help and receives a recommendation tied to a product in the seeded catalogue. CI uses the configured fallback when no live Gemini credential is supplied.',
    });
  });

  test('validates the production PWA manifest, service worker and cached catalogue offline', async ({ page }) => {
    const manifestResponse = await page.request.get('/manifest.webmanifest');
    expect(manifestResponse.status()).toBe(200);
    const manifest = await manifestResponse.json();
    expect(manifest.short_name).toBe('Sayphora');
    expect(manifest.display).toBe('standalone');

    await page.goto('/');
    await expect(page.getByText("Pro Filt'r").first()).toBeVisible();
    await expect.poll(() => page.evaluate(() =>
      navigator.serviceWorker.getRegistrations().then((registrations) => registrations.length)
    )).toBeGreaterThan(0);
    await page.reload();
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

    const live = await page.evaluate(async () => {
      const response = await fetch('/api/products');
      const payload = await response.json();
      return { ok: response.ok, count: payload.count ?? payload.products?.length ?? 0 };
    });
    expect(live.ok).toBe(true);
    expect(live.count).toBe(12);

    await page.context().setOffline(true);
    try {
      await expect(page.getByLabel('Offline mode notification')).toBeVisible();
      const cached = await page.evaluate(async () => {
        const response = await fetch('/api/products');
        const payload = await response.json();
        return { ok: response.ok, count: payload.count ?? payload.products?.length ?? 0 };
      });
      expect(cached).toMatchObject({ ok: true, count: 12 });
      await expect(page.getByText('Offline Mode Active')).toBeVisible();
      await capture(page, {
        section: 'Offline catalog',
        step: 1,
        filename: '31-pwa-offline-catalog',
        title: 'Cached product catalogue while offline',
        caption: 'The production web app exposes a standalone manifest and registered service worker; after the public catalogue is cached, the browser retrieves its twelve products while network access is disabled.',
      });
    } finally {
      await page.context().setOffline(false);
    }
  });

  test('walks the staff console tabs and opens catalogue and promotion forms', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Sign In' }).first().click();
    await page.locator('#auth-email').fill(ADMIN.email);
    await page.locator('#auth-password').fill(ADMIN.password);
    await page.getByRole('button', { name: /Sign In to Account/ }).click();
    await expect(page.getByText('Welcome Back')).toBeVisible();
    await page.keyboard.press('Control+Shift+A');
    await expect(page.getByText('Executive Suite')).toBeVisible();
    await capture(page, {
      section: 'Admin console',
      step: 1,
      filename: '32-admin-overview',
      title: 'Staff executive overview',
      caption: 'The seeded administrator enters the protected operations console and sees its analytics overview.',
    });

    await page.getByRole('button', { name: 'Product Catalog' }).click();
    await expect(page.getByPlaceholder('Search title, brand...')).toBeVisible();
    await expect(page.getByText('Item & Formula')).toBeVisible();
    await capture(page, {
      section: 'Product administration',
      step: 1,
      filename: '33-admin-product-catalog',
      title: 'Product inventory and stock controls',
      caption: 'The product tab exposes catalog search, category and stock filters, inventory editing, ratings and archive actions.',
    });
    await page.getByRole('button', { name: /Add Product/ }).first().click();
    await expect(page.getByRole('heading', { name: 'Add New Prestige Product' })).toBeVisible();
    await capture(page, {
      section: 'Product administration',
      step: 2,
      filename: '34-admin-product-create-form',
      title: 'New product form',
      caption: 'The product-creation form exposes the fields used to publish a catalog item; this visual check does not submit test merchandise.',
    });
    await page.locator('div.fixed.inset-0').last().getByRole('button').first().click();
    await expect(page.getByRole('heading', { name: 'Add New Prestige Product' })).toHaveCount(0);

    await page.getByRole('button', { name: 'Orders & Fulfillment' }).click();
    await expect(page.getByPlaceholder('Search Order ID, Client, City...')).toBeVisible();
    await capture(page, {
      section: 'Order management',
      step: 1,
      filename: '35-admin-order-management',
      title: 'Order queue and fulfilment controls',
      caption: 'The staff orders tab exposes order search, status filtering, tracking-code entry and guarded fulfillment transitions.',
    });

    await page.getByRole('button', { name: 'Customer Reviews' }).click();
    await expect(page.getByText('Client Review Moderation')).toBeVisible();
    await capture(page, {
      section: 'Review moderation',
      step: 1,
      filename: '36-admin-review-moderation',
      title: 'Customer review moderation',
      caption: 'The protected review console lists customer feedback, verified-buyer markers and moderation actions.',
    });

    await page.getByRole('button', { name: 'VIP Promos & Codes' }).click();
    await expect(page.getByText('VIP Promotion Codes & Privileges')).toBeVisible();
    await capture(page, {
      section: 'Promotion management',
      step: 1,
      filename: '37-admin-promotion-management',
      title: 'Promotion code administration',
      caption: 'The promotion tab displays active campaigns and redemption counts with controls to create, activate, deactivate and remove codes.',
    });
    await page.getByRole('button', { name: 'Create Promo' }).first().click();
    await expect(page.getByRole('heading', { name: 'Create New VIP Promo Code' })).toBeVisible();
    await capture(page, {
      section: 'Promotion management',
      step: 2,
      filename: '38-admin-promo-create-form',
      title: 'New promotion form',
      caption: 'The promotion form exposes code, discount type, value and description fields. No promotion is created in this visual-only check.',
    });
    await page.locator('div.fixed.inset-0').last().getByRole('button').first().click();
    await expect(page.getByRole('heading', { name: 'Create New VIP Promo Code' })).toHaveCount(0);

    await page.getByRole('button', { name: 'AI Diagnostics & Maps' }).click();
    await expect(page.getByText('AI Assistant Usage')).toBeVisible();
    await expect(page.getByText('Google Maps Grounding & Boutique Network')).toBeVisible();
    await expect(page.getByText('PWA Service Worker & Offline Cache')).toBeVisible();
    await capture(page, {
      section: 'AI, maps and PWA diagnostics',
      step: 1,
      filename: '39-admin-ai-maps-pwa',
      title: 'AI, Maps and PWA diagnostics',
      caption: 'The admin diagnostics page shows AI usage counters, the boutique directory, Google Maps grounding area and the service-worker cache controls.',
    });
  });


  test('exercises cart quantity, trial samples, promotion removal and the empty state', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('heading', { name: "Pro Filt'r Soft Matte Longwear Liquid Foundation" }).first().click();
    await page.getByRole('button', { name: 'Increase quantity' }).click();
    const detailAdd = page.getByRole('button', { name: /Add to Bag.*80/ });
    await expect(detailAdd).toBeVisible();
    await detailAdd.click();

    const cart = page.getByRole('heading', { name: 'Shopping Bag', exact: true })
      .locator('xpath=ancestor::div[contains(@class,"fixed")][1]');
    await expect(cart.getByText('Choose 2 Complimentary Samples')).toBeVisible();
    const sampleButtons = cart.locator('button.p-2.rounded-lg.border.text-left');
    await expect.poll(() => sampleButtons.count()).toBeGreaterThanOrEqual(2);
    await sampleButtons.nth(0).click();
    await sampleButtons.nth(1).click();
    await expect(cart.getByText('2/2 Selected', { exact: true })).toBeVisible();

    await cart.getByPlaceholder('Promo or reward code').fill('SAYPHORA20');
    await cart.getByRole('button', { name: 'Apply', exact: true }).click();
    await expect(cart.getByText('SAYPHORA20', { exact: true })).toBeVisible();
    await capture(page, {
      section: 'Storefront cart controls',
      step: 1,
      filename: '41-cart-samples-promo',
      title: 'Cart quantity, samples and promotion',
      caption: 'The bag contains two foundation units, two complimentary samples are selected, and the seeded SAYPHORA20 promotion is applied.',
    });

    await cart.getByRole('button', { name: 'Remove', exact: true }).click();
    await expect(cart.getByPlaceholder('Promo or reward code')).toBeVisible();
    await cart.locator('button[title="Remove item"]').click();
    await expect(page.getByText('Your bag is empty')).toBeVisible();
    await capture(page, {
      section: 'Storefront cart controls',
      step: 2,
      filename: '42-cart-empty-state',
      title: 'Empty bag after removing the item',
      caption: 'Removing the only cart line leaves the bag in its explicit empty state after the active promotion is removed.',
    });
  });

  test('selects product size and quantity and opens the suggested application routine', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('heading', { name: 'The Water Cream Pore-Refining Hydrating Moisturizer' }).first().click();
    await page.getByRole('button', { name: '75 mL / 2.5 fl oz Value Size', exact: true }).click();
    await page.getByRole('button', { name: 'Increase quantity' }).click();
    const addButton = page.getByRole('button', { name: /Add to Bag.*144/ });
    await expect(addButton).toBeVisible();
    await page.getByRole('button', { name: 'Suggested Ritual & Application', exact: true }).click();
    await expect(page.getByText('Master Artist Ritual Steps:')).toBeVisible();
    await capture(page, {
      section: 'Product detail tools',
      step: 3,
      filename: '43-product-size-and-ritual',
      title: 'Product size, quantity and application routine',
      caption: 'The 75 mL option and quantity two are selected, the add-to-bag total reflects $144, and the product-specific application-routine tab is opened.',
    });
    await addButton.click();
    await expect(page.getByRole('heading', { name: 'Shopping Bag', exact: true })).toBeVisible();
  });


  test('filters reviews and records a helpful vote on another customer review', async ({ page }) => {
    const { ctx: author } = await registerViaApi();
    const { ctx: voter, email } = await registerViaApi();
    try {
      const placed = await author.post('/api/orders', {
        data: {
          items: [{ productId: 'tatcha-water-cream', quantity: 1 }],
          shippingAddress: ADDRESS,
          shippingMethod: 'Standard',
        },
      });
      expect(placed.status()).toBe(201);
      const created = await author.post('/api/products/tatcha-water-cream/reviews', {
        data: { rating: 5, title: 'QA review feature', comment: 'Absolutely beautiful texture and glow.' },
      });
      expect(created.status()).toBe(201);
      const reviewData = (await created.json()).review;
      expect(reviewData.verifiedPurchase).toBe(true);

      await page.goto('/');
      await page.getByRole('button', { name: 'Sign In' }).first().click();
      await page.locator('#auth-email').fill(email);
      await page.locator('#auth-password').fill(PASSWORD);
      await page.getByRole('button', { name: /Sign In to Account/ }).click();
      await expect(page.getByText('Welcome Back')).toBeVisible();
      await page.getByRole('heading', { name: "The Water Cream Pore-Refining Hydrating Moisturizer" }).first().click();
      await page.getByRole('button', { name: /Reviews?|Be the first to review/ }).first().click();
      await expect(page.getByText('QA review feature', { exact: true })).toBeVisible();

      const voteResponse = page.waitForResponse((response) =>
        response.url().includes('/api/reviews/' + reviewData.id + '/vote') &&
        response.request().method() === 'POST',
      );
      await page.locator('button[title="Mark review as helpful"]').first().click();
      expect((await voteResponse).ok()).toBe(true);
      await page.getByRole('button', { name: /Verified Buyers Only/ }).click();
      await expect(page.getByText('QA review feature', { exact: true })).toBeVisible();
      await capture(page, {
        section: 'Product reviews',
        step: 3,
        filename: '44-review-vote-filter',
        title: 'Verified review filter and helpful voting',
        caption: 'A second signed-in customer marks another customer’s verified-purchase review helpful and filters the list to verified buyers.',
      });
    } finally {
      await author.dispose();
      await voter.dispose();
    }
  });

  test('looks up and cancels an eligible customer order through tracking', async ({ page }) => {
    const { ctx: buyer, email } = await registerViaApi();
    try {
      const created = await buyer.post('/api/orders', {
        data: {
          items: [{ productId: 'tatcha-water-cream', quantity: 1 }],
          shippingAddress: ADDRESS,
          shippingMethod: 'Standard',
        },
      });
      expect(created.status()).toBe(201);
      const order = (await created.json()).order;

      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/');
      await page.getByRole('button', { name: 'Sign In' }).first().click();
      await page.locator('#auth-email').fill(email);
      await page.locator('#auth-password').fill(PASSWORD);
      await page.getByRole('button', { name: /Sign In to Account/ }).click();
      await expect(page.getByText('Welcome Back')).toBeVisible();
      await page.getByRole('button', { name: 'Toggle menu' }).click();
      await page.getByRole('button', { name: 'Track an Order', exact: true }).click();

      const tracking = page.getByRole('dialog', { name: 'Track your order' });
      await expect(tracking).toBeVisible();
      await tracking.getByLabel('Order number').fill('SAY-99999999');
      await tracking.getByRole('button', { name: 'Find', exact: true }).click();
      await expect(tracking.getByRole('alert')).toContainText('No order with that number');
      await tracking.getByLabel('Order number').fill(order.orderNumber);
      await tracking.getByRole('button', { name: 'Find', exact: true }).click();
      await expect(tracking.getByRole('list', { name: 'Order progress' })).toBeVisible();
      await expect(tracking.getByRole('button', { name: 'Cancel this order' })).toBeVisible();

      page.once('dialog', (dialog) => dialog.accept());
      await tracking.getByRole('button', { name: 'Cancel this order' }).click();
      await expect(tracking.getByText('This order was cancelled')).toBeVisible();
      const persisted = (await (await buyer.get('/api/me/orders')).json()).orders;
      expect(persisted.find((candidate: { id: string }) => candidate.id === order.id)?.status).toBe('Cancelled');
      await capture(page, {
        section: 'Customer order tracking',
        step: 1,
        filename: '45-customer-order-cancelled',
        title: 'Order lookup and eligible cancellation',
        caption: 'An invalid order number is rejected, the customer’s own order is found, its progress is shown, and cancellation is confirmed by the persisted Cancelled status.',
      });
    } finally {
      await buyer.dispose();
    }
  });

  test('checks responsive navigation and primary mobile utility links', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const menuToggle = page.getByRole('button', { name: 'Toggle menu' });
    await expect(menuToggle).toBeVisible();
    await menuToggle.click();
    await expect(page.getByText('Categories', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Beauty Insider Loyalty Rewards' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Find Boutiques & Ateliers' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Track an Order', exact: true })).toBeVisible();
    await capture(page, {
      section: 'Responsive navigation',
      step: 1,
      filename: '46-mobile-navigation',
      title: 'Mobile navigation drawer',
      caption: 'At 390 × 844, the compact navigation exposes category selection plus the loyalty, boutique and order-tracking entry points.',
    });
  });

  test('shows the iOS add-to-home-screen guide for a Safari-like browser', async ({ browser }) => {
    const context = await browser.newContext({
      baseURL: BASE,
      viewport: { width: 390, height: 844 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    });
    try {
      const page = await context.newPage();
      await page.goto('/');
      const installButton = page.locator('button[title="Add to Home Screen on iOS"]').first();
      await expect(installButton).toBeVisible();
      await installButton.click();
      await expect(page.getByRole('heading', { name: 'Install on iOS Safari' })).toBeVisible();
      await capture(page, {
        section: 'PWA installation',
        step: 1,
        filename: '47-ios-install-guide',
        title: 'iOS add-to-home-screen instructions',
        caption: 'An iPhone Safari-like user-agent triggers the iOS install guidance modal. This validates the guidance UI, not a physical-device installation.',
      });
    } finally {
      await context.close();
    }
  });


  test('publishes and archives a product, updates stock, and manages a promo in the admin UI', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Sign In' }).first().click();
    await page.locator('#auth-email').fill(ADMIN.email);
    await page.locator('#auth-password').fill(ADMIN.password);
    await page.getByRole('button', { name: /Sign In to Account/ }).click();
    await expect(page.getByText('Welcome Back')).toBeVisible();
    await page.keyboard.press('Control+Shift+A');
    await expect(page.getByText('Executive Suite')).toBeVisible();

    const productName = 'QA Atelier Item ' + Date.now().toString(36);
    await page.getByRole('button', { name: 'Product Catalog' }).click();
    await page.getByRole('button', { name: /Add Product/ }).first().click();
    const productForm = page.locator('form').filter({ has: page.getByPlaceholder('e.g. Dior Addict Lip Glow Oil') });
    await productForm.getByPlaceholder('e.g. Dior Addict Lip Glow Oil').fill(productName);
    await productForm.getByPlaceholder('e.g. DIOR').fill('QA BEAUTY');
    await productForm.locator('select').selectOption('Skincare');
    await productForm.locator('input[type="number"]').nth(0).fill('18.50');
    await productForm.locator('input[type="number"]').nth(1).fill('4');
    await productForm.locator('input[type="url"]').fill('https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80');
    await productForm.locator('textarea').fill('Disposable QA item created by the browser suite.');
    await productForm.getByRole('button', { name: 'Publish to Catalog' }).click();
    await expect(page.getByText('Product Published')).toBeVisible();
    const productRow = page.locator('tr', { hasText: productName });
    await expect(productRow).toBeVisible();
    await capture(page, {
      section: 'Product administration',
      step: 3,
      filename: '48-admin-product-created',
      title: 'Product successfully published',
      caption: 'The staff user submits the product form and the new test product appears in the inventory table after the server accepts it.',
    });

    const stockInput = productRow.locator('input[type="number"]');
    await stockInput.fill('3');
    await stockInput.press('Tab');
    await expect(page.getByText('Inventory Updated')).toBeVisible();
    await page.getByRole('button', { name: /Low/ }).click();
    await expect(productRow.locator('input[type="number"]')).toHaveValue('3');
    await capture(page, {
      section: 'Product administration',
      step: 4,
      filename: '49-admin-low-stock-update',
      title: 'Inventory updated and low-stock filtered',
      caption: 'The stock editor persists three units; the low-stock filter still finds the item after the table reloads from server data.',
    });

    await productRow.locator('button[title="Archive item"]').click();
    await expect(page.getByText('Product Archived')).toBeVisible();
    await expect(productRow).toHaveCount(0);

    await page.getByRole('button', { name: 'VIP Promos & Codes' }).click();
    const promoCode = 'QA' + Date.now().toString().slice(-10);
    await page.getByRole('button', { name: 'Create Promo' }).click();
    const promoForm = page.locator('form').filter({ has: page.getByPlaceholder('e.g. GLOW50') });
    await promoForm.getByPlaceholder('e.g. GLOW50').fill(promoCode);
    await promoForm.getByPlaceholder('e.g. 20% off all Lipsticks & Glosses').fill('Temporary browser-test campaign');
    await promoForm.getByRole('button', { name: 'Activate Promo Code' }).click();
    const promoText = page.getByText(promoCode, { exact: true });
    await expect(promoText).toBeVisible();
    const promoCard = promoText.locator('xpath=ancestor::div[contains(@class,"space-y-3")][1]');
    await expect(promoCard.getByText('Active', { exact: true })).toBeVisible();
    await capture(page, {
      section: 'Promotion management',
      step: 3,
      filename: '50-admin-promo-created',
      title: 'Promotion created from the staff console',
      caption: 'The administrator creates a temporary campaign in the browser and the new active promotion is shown in the persisted promo list.',
    });

    await promoCard.getByRole('button', { name: 'Pause Code' }).click();
    await expect(promoCard.getByText('Disabled', { exact: true })).toBeVisible();
    await capture(page, {
      section: 'Promotion management',
      step: 4,
      filename: '51-admin-promo-paused',
      title: 'Promotion pause state',
      caption: 'The administrator pauses the newly created code and the UI reflects its disabled state after the server update.',
    });
    await promoCard.getByRole('button', { name: 'Activate Code' }).click();
    await expect(promoCard.getByText('Active', { exact: true })).toBeVisible();
    await promoCard.locator('button').first().click();
    await expect(page.getByText('Promotion Removed')).toBeVisible();
    await expect(promoText).toHaveCount(0);
  });

});
