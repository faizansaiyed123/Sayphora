import { test, expect, request as pwRequest, type APIRequestContext, type Page } from '@playwright/test';

const ADMIN = { email: 'admin@sayphora.test', password: 'AdminPassw0rd!2026' };
const PASSWORD = 'CorrectHorse!Battery9';
const BASE = `http://127.0.0.1:${process.env.E2E_PORT || 4010}`;
let n = 0;
const uniqueEmail = () => `e2e${Date.now()}${n++}@example.com`;

/** Fails the test on real JS errors / CSP violations (third-party image fetches are offline in CI). */
function watchConsole(page: Page) {
  const problems: string[] = [];
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (/Failed to load resource|net::ERR_/.test(t)) return;
    problems.push(`console: ${t}`);
  });
  return problems;
}

async function apiAs(email: string, password: string): Promise<APIRequestContext> {
  const ctx = await pwRequest.newContext({ baseURL: BASE });
  const res = await ctx.post('/api/auth/login', { data: { email, password } });
  expect(res.status()).toBe(200);
  return ctx;
}

async function registerViaApi(): Promise<{ ctx: APIRequestContext; email: string }> {
  const ctx = await pwRequest.newContext({ baseURL: BASE });
  const email = uniqueEmail();
  const res = await ctx.post('/api/auth/register', { data: { name: 'Api Buyer', email, password: PASSWORD } });
  expect(res.status()).toBe(201);
  return { ctx, email };
}

const addressBody = { fullName: 'Api Buyer', street: '1 Test St', city: 'New York', state: 'NY', zipCode: '10001', country: 'United States', phone: '' };

test.describe('storefront', () => {
  test('renders the catalogue from the API with hardened headers and a clean console', async ({ page }) => {
    const problems = watchConsole(page);
    const res = await page.goto('/');
    const h = res!.headers();
    expect(h['content-security-policy']).toContain("default-src 'self'");
    expect(h['x-content-type-options']).toBe('nosniff');
    expect(h['x-powered-by']).toBeUndefined();

    await expect(page.getByText("Pro Filt'r").first()).toBeVisible();
    const health = await page.request.get('/health');
    expect((await health.json()).database).toBe('up');
    const api = await (await page.request.get('/api/products')).json();
    expect(api.count).toBe(12);
    expect(problems).toEqual([]);
  });

  test('serves the SPA for deep links but real 404 JSON for unknown API routes', async ({ page }) => {
    expect((await page.request.get('/some/client/route')).status()).toBe(200);
    const res = await page.request.get('/api/does-not-exist');
    expect(res.status()).toBe(404);
    expect((await res.json()).error.code).toBe('not_found');
    expect((await page.request.get('/api/download-zip')).status()).toBe(404);
  });

  test('sold-out products cannot be added to the bag', async ({ page }) => {
    const admin = await apiAs(ADMIN.email, ADMIN.password);
    const target = (await (await admin.get('/api/products?sort=featured')).json()).products[0];
    await admin.patch(`/api/admin/products/${target.id}/stock`, { data: { stock: 0 } });
    try {
      await page.goto('/');
      const card = page.locator('article, div').filter({ hasText: target.name }).first();
      await expect(card.getByText('Sold out').first()).toBeVisible();
    } finally {
      await admin.patch(`/api/admin/products/${target.id}/stock`, { data: { stock: target.stockLeft } });
    }
  });
});

test.describe('accounts', () => {
  test('shows server-side validation and credential errors', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Sign In' }).first().click();
    await page.locator('#auth-email').fill('nobody@example.com');
    await page.locator('#auth-password').fill('Wrong-password-1');
    await page.getByRole('button', { name: /Sign In to Account/ }).click();
    await expect(page.getByRole('alert')).toContainText('Incorrect email or password');

    await page.getByRole('tab', { name: 'Create Account' }).click();
    await page.locator('#auth-name').fill('Short Pw');
    await page.locator('#auth-email').fill(uniqueEmail());
    await page.locator('#auth-password').fill('short');
    await page.getByRole('button', { name: /Create Free Account/ }).click();
    // native minlength or server rule: either way the account is not created
    await expect(page.getByRole('alert')).toContainText('correct the highlighted fields');
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('forgot-password reports success without revealing whether the account exists', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Sign In' }).first().click();
    await page.getByRole('button', { name: 'Forgot your password?' }).click();
    await page.locator('#auth-email').fill('ghost@example.com');
    await page.getByRole('button', { name: /Email Me a Reset Link/ }).click();
    await expect(page.getByRole('status')).toContainText('If an account exists');
  });
});

test.describe('purchase journey', () => {
  test('visitor registers, shops with a promo, checks out, sees the order and its server-computed totals', async ({ page }) => {
    const problems = watchConsole(page);
    const email = uniqueEmail();
    await page.goto('/');

    // Register through the UI
    await page.getByRole('button', { name: 'Sign In' }).first().click();
    await page.getByRole('tab', { name: 'Create Account' }).click();
    await page.locator('#auth-name').fill('Ada Lovelace');
    await page.locator('#auth-email').fill(email);
    await page.locator('#auth-password').fill(PASSWORD);
    await page.getByRole('button', { name: /Create Free Account/ }).click();
    await expect(page.getByText('Welcome to Sayphora').first()).toBeVisible();

    // Add the first product to the bag (opens the drawer)
    const firstCard = page.getByRole('button', { name: /Add to Bag/ }).first();
    await firstCard.scrollIntoViewIfNeeded();
    await firstCard.click({ force: true });
    await expect(page.getByRole('button', { name: /Proceed to Checkout/ })).toBeVisible();

    // Promo from the server (demo seed)
    await page.getByPlaceholder('Promo or reward code').fill('sayphora20');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.getByText(/applied successfully/i)).toBeVisible();

    await page.getByRole('button', { name: /Proceed to Checkout/ }).click();
    await page.locator('#co-name').fill('Ada Lovelace');
    await page.locator('#co-street').fill('12 Analytical Engine Way');
    await page.locator('#co-city').fill('London');
    await page.locator('#co-zip').fill('NW1 4RY');
    await page.locator('#co-country').fill('United Kingdom');
    await page.getByRole('button', { name: /Continue to Review/ }).click();
    await expect(page.getByText('Pay on delivery')).toBeVisible();
    await page.getByRole('button', { name: /Place Order/ }).click();

    await expect(page.getByText(/Order #SAY-\d+ Confirmed/)).toBeVisible();

    // The order really exists server-side, owned by this user, with server-computed totals
    const mine = await (await page.request.get('/api/me/orders')).json();
    expect(mine.orders).toHaveLength(1);
    const o = mine.orders[0];
    expect(o.status).toBe('Processing');
    expect(o.items.length).toBe(1);
    expect(o.total).toBeCloseTo(o.subtotal - o.discount + o.tax + o.shipping + o.giftFee, 2);
    expect(o.pointsEarned).toBeGreaterThan(0);

    // Track it
    await page.getByRole('dialog', { name: 'Checkout' }).getByRole('button', { name: /Track Order/ }).click();
    await expect(page.getByRole('dialog', { name: 'Track your order' })).toContainText(o.orderNumber);
    await expect(page.getByRole('list', { name: 'Order progress' })).toBeVisible();
    expect(problems).toEqual([]);
  });

  test('the bag survives a reload and checkout requires sign-in', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Add to Bag/ }).first().click({ force: true });
    await page.getByRole('button', { name: /Proceed to Checkout/ }).click();
    await expect(page.getByText('Sign in to check out')).toBeVisible();
    await page.reload();
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('sayphora_cart_v2') || '[]'));
    expect(stored).toHaveLength(1);
    expect(stored[0]).not.toHaveProperty('price'); // no stale price snapshots in storage
  });

  test('customers can review a product they bought and it is marked verified', async ({ page }) => {
    const { ctx, email } = await registerViaApi();
    const products = (await (await ctx.get('/api/products')).json()).products;
    const p = products.find((x: any) => !x.shades) ?? products[0];
    const body: any = { items: [{ productId: p.id, quantity: 1, ...(p.shades ? { shadeId: p.shades[0].id } : {}) }], shippingAddress: addressBody, shippingMethod: 'Standard' };
    expect((await ctx.post('/api/orders', { data: body })).status()).toBe(201);

    await page.goto('/');
    await page.getByRole('button', { name: 'Sign In' }).first().click();
    await page.locator('#auth-email').fill(email);
    await page.locator('#auth-password').fill(PASSWORD);
    await page.getByRole('button', { name: /Sign In to Account/ }).click();
    await expect(page.getByText('Welcome Back')).toBeVisible();

    await page.getByText(p.name).first().click();
    await page.getByRole('button', { name: /Reviews?|Be the first to review/ }).first().click();
    await page.getByRole('button', { name: 'Write a Review' }).click();
    await page.getByPlaceholder(/Incomparable smooth velvet/).fill('Lovely');
    await page.getByPlaceholder(/Describe how this formula blended/).fill('Wonderful texture and a lasting finish all day.');
    await page.getByRole('button', { name: 'Publish Review' }).click();
    await expect(page.getByText('Review Published').first()).toBeVisible();

    const reviews = (await (await ctx.get(`/api/products/${p.id}/reviews`)).json()).reviews;
    expect(reviews[0]).toMatchObject({ verifiedPurchase: true, title: 'Lovely' });
  });
});

test.describe('staff console', () => {
  test('is hidden from customers and cannot be reached by URL tricks or the API', async ({ page }) => {
    const { ctx } = await registerViaApi();
    await page.goto('/');
    await expect(page.getByText('Admin Portal')).toHaveCount(0);
    await page.keyboard.press('Control+Shift+A');
    await expect(page.getByText('Executive Suite')).toHaveCount(0);
    expect((await ctx.get('/api/admin/orders')).status()).toBe(403);
    expect((await pwRequest.newContext({ baseURL: BASE })).get('/api/admin/orders').then((r) => r.status())).resolves.toBe(401);
  });

  test('admin sees real data and can advance an order; the customer sees the change', async ({ page }) => {
    const { ctx: buyer } = await registerViaApi();
    const p = (await (await buyer.get('/api/products')).json()).products.find((x: any) => !x.shades);
    const placed = await (await buyer.post('/api/orders', { data: { items: [{ productId: p.id, quantity: 1 }], shippingAddress: addressBody, shippingMethod: 'Standard' } })).json();

    await page.goto('/');
    await page.getByRole('button', { name: 'Sign In' }).first().click();
    await page.locator('#auth-email').fill(ADMIN.email);
    await page.locator('#auth-password').fill(ADMIN.password);
    await page.getByRole('button', { name: /Sign In to Account/ }).click();
    await expect(page.getByText('Welcome Back')).toBeVisible();

    await page.keyboard.press('Control+Shift+A');
    await expect(page.getByText('Executive Suite')).toBeVisible();
    await page.getByRole('button', { name: /Orders & Fulfillment/ }).click();
    const row = page.locator('tr', { hasText: placed.order.orderNumber });
    await expect(row).toBeVisible();
    await row.getByRole('combobox').selectOption('Packed');
    await expect(page.getByText('Order Status Updated').first()).toBeVisible();

    const fresh = await (await buyer.get(`/api/orders/${placed.order.id}`)).json();
    expect(fresh.order.status).toBe('Packed');
    expect(fresh.order.events.map((e: any) => e.status)).toEqual(['Processing', 'Packed']);
    // illegal transitions are not even offered
    await expect(row.getByRole('option', { name: 'Processing' })).toBeDisabled();
  });
});
