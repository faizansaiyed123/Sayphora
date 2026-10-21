import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { makeCtx, resetData, adminAgent, type TestCtx } from '../helpers';

let ctx: TestCtx;
beforeAll(async () => { ctx = await makeCtx(); });
afterAll(async () => { await ctx.close(); });
beforeEach(async () => { await resetData(ctx.db); });

describe('public catalogue', () => {
  it('lists active products with dollars, shades and stock', async () => {
    const res = await request(ctx.app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(12);
    const fenty = res.body.products.find((p: any) => p.id === 'fenty-pro-filtr-foundation');
    expect(fenty.price).toBe(40);
    expect(fenty.shades.length).toBe(8);
    expect(fenty.stockLeft).toBe(6);
    expect(fenty.rating).toBe(0); // ratings come from real reviews only
    expect(fenty.reviewCount).toBe(0);
  });

  it('filters by category, price, search, flags and sorts', async () => {
    const skincare = (await request(ctx.app).get('/api/products?category=skincare')).body.products;
    expect(skincare.length).toBeGreaterThan(0);
    expect(skincare.every((p: any) => p.category === 'Skincare')).toBe(true);
    const cheap = (await request(ctx.app).get('/api/products?maxPrice=30&sort=price-asc')).body.products;
    expect(cheap.every((p: any) => p.price <= 30)).toBe(true);
    expect(cheap.map((p: any) => p.price)).toEqual([...cheap.map((p: any) => p.price)].sort((a, b) => a - b));
    const search = (await request(ctx.app).get('/api/products?search=TATCHA')).body.products;
    expect(search.length).toBeGreaterThan(0);
    expect(search.every((p: any) => p.brand.toLowerCase().includes('tatcha'))).toBe(true);
    expect((await request(ctx.app).get('/api/products?cleanOnly=true')).body.products.every((p: any) => p.isClean)).toBe(true);
  });

  it('treats search input literally (no LIKE wildcard injection) and rejects bad params', async () => {
    expect((await request(ctx.app).get('/api/products?search=%25_%25')).body.count).toBe(0);
    // '%' is matched literally: the real product "…25% AHA…" is found, but '%' does not act as a wildcard
    expect((await request(ctx.app).get('/api/products?search=25%25 aha')).body.count).toBe(1);
    expect((await request(ctx.app).get('/api/products?search=2%25aha')).body.count).toBe(0);
    expect((await request(ctx.app).get(`/api/products?search=${encodeURIComponent("'; DROP TABLE products;--")}`)).body.count).toBe(0);
    expect((await request(ctx.app).get('/api/products?limit=99999')).status).toBe(400);
    expect((await ctx.db.query('SELECT count(*)::int AS n FROM products')).rows[0].n).toBe(12);
  });

  it('returns a single product or 404, and hides non-active products', async () => {
    expect((await request(ctx.app).get('/api/products/tatcha-water-cream')).body.product.brand).toBe('Tatcha');
    await request(ctx.app).get('/api/products/does-not-exist').expect(404);
    await ctx.db.query("UPDATE products SET status = 'Draft' WHERE id = 'tatcha-water-cream'");
    await request(ctx.app).get('/api/products/tatcha-water-cream').expect(404);
    expect((await request(ctx.app).get('/api/products')).body.count).toBe(11);
  });

  it('serves samples, boutiques (with city filter) and checkout config', async () => {
    expect((await request(ctx.app).get('/api/samples')).body.samples.length).toBe(4);
    expect((await request(ctx.app).get('/api/boutiques')).body.boutiques.length).toBe(6);
    expect((await request(ctx.app).get('/api/boutiques?city=paris')).body.boutiques).toHaveLength(1);
    const cfg = (await request(ctx.app).get('/api/config')).body;
    expect(cfg.pricing.taxRate).toBe(0.08875);
    expect(cfg.payment.provider).toBe('manual');
  });

  it('stores newsletter subscriptions idempotently and validates the address', async () => {
    await request(ctx.app).post('/api/newsletter').send({ email: 'Fan@Example.com' }).expect(201);
    await request(ctx.app).post('/api/newsletter').send({ email: 'fan@example.com' }).expect(201);
    await request(ctx.app).post('/api/newsletter').send({ email: 'bad' }).expect(400);
    expect((await ctx.db.query('SELECT count(*)::int AS n FROM newsletter_subscribers')).rows[0].n).toBe(1);
  });
});

describe('admin catalogue management', () => {
  const newProduct = { name: 'Velvet Lip Oil', brand: 'Maison Test', category: 'Makeup', subcategory: 'Lip', price: 28.5, stockLeft: 15, image: 'https://example.com/a.jpg', description: 'Glossy.' };

  it('creates, updates, restocks and archives a product', async () => {
    const admin = await adminAgent(ctx);
    const created = await admin.post('/api/admin/products').send(newProduct);
    expect(created.status).toBe(201);
    const id = created.body.product.id;
    expect(id).toMatch(/^velvet-lip-oil-[0-9a-f]{4}$/);
    expect(created.body.product.price).toBe(28.5);
    expect((await ctx.db.query('SELECT price_cents FROM products WHERE id = $1', [id])).rows[0].price_cents).toBe(2850);
    expect((await request(ctx.app).get(`/api/products/${id}`)).status).toBe(200);

    const updated = await admin.put(`/api/admin/products/${id}`).send({ price: 31, isSale: true, originalPrice: 36 });
    expect(updated.body.product).toMatchObject({ price: 31, isSale: true, originalPrice: 36, name: 'Velvet Lip Oil', stockLeft: 15 });

    expect((await admin.patch(`/api/admin/products/${id}/stock`).send({ stock: 3 })).body.product.stockLeft).toBe(3);
    await admin.patch(`/api/admin/products/${id}/stock`).send({ stock: -1 }).expect(400);

    await admin.delete(`/api/admin/products/${id}`).expect(200);
    await request(ctx.app).get(`/api/products/${id}`).expect(404);
    expect((await admin.get('/api/admin/products')).body.products.find((p: any) => p.id === id).status).toBe('Archived');
  });

  it('validates product input', async () => {
    const admin = await adminAgent(ctx);
    const res = await admin.post('/api/admin/products').send({ ...newProduct, price: -5, image: 'javascript:alert(1)' });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.error.details)).toEqual(expect.arrayContaining(['price', 'image']));
    await admin.put('/api/admin/products/nope').send({ price: 3 }).expect(404);
  });
});
