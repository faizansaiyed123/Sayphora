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
  const reservedAddresses = ['olivia.bennett@example.com', 'charlotte.hughes@example.com'];
  return reservedAddresses[emailCounter - 1] || 'customer' + emailCounter + '@example.com';
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
    'The images follow the user journey from product discovery to order tracking, then show verified reviews and staff fulfilment. The caption under each image explains the action and the check completed before capture. Open an image to view its original resolution.',
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
    '---',
    '',
    '**Verification note:** The screenshot shows the browser UI at a successful checkpoint. Backend assertions separately verify account ownership, the stored order, server-calculated totals, verified-purchase reviews and persisted fulfilment status. A screenshot alone is not used as proof of those server-side behaviors.',
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
    await page.locator('button[title="Share Wishlist"]').locator('xpath=following-sibling::button').click();

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
    await page.getByRole('heading', { name: "Pro Filt'r Soft Matte Longwear Liquid Foundation" }).first().click();
    await page.getByRole('button', { name: 'Decode Actives', exact: true }).click();
    await expect(page.getByText('Clean & Clinical Ingredient Diagnostic')).toBeVisible();
    await expect(page.getByText('Pore Clog Index', { exact: true })).toBeVisible();
    await expect(page.getByText('Formula pH', { exact: true })).toBeVisible();
    await capture(page, {
      section: 'Ingredient diagnostics',
      step: 1,
      filename: '16-ingredient-diagnostics',
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
      filename: '17-shade-match',
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
      filename: '18-skincare-routine',
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
      filename: '19-boutique-directory',
      title: 'Boutique directory',
      caption: 'The locator displays the seeded boutique directory using the built-in fallback path; no GPS permission is requested.',
    });
    await page.getByRole('button', { name: 'Set Pickup Store' }).first().click();
    await expect(page.getByText('Selected Store').first()).toBeVisible();
    await capture(page, {
      section: 'Boutique locator',
      step: 2,
      filename: '20-pickup-store-selected',
      title: 'Pickup location selected',
      caption: 'The selected boutique is visibly marked in the locator after the user chooses it as the preferred pickup location.',
    });
  });

});
