import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { makeCtx, resetData, registerAgent, adminAgent, orderBody, type TestCtx } from '../helpers';

let ctx: TestCtx;
beforeAll(async () => { ctx = await makeCtx(); });
afterAll(async () => { await ctx.close(); });
beforeEach(async () => { await resetData(ctx.db); ctx.sent.length = 0; });

const stockOf = async (id: string) => (await ctx.db.query('SELECT stock FROM products WHERE id = $1', [id])).rows[0].stock as number;
const fenty = { productId: 'fenty-pro-filtr-foundation', shadeId: '230', quantity: 1 }; // $40, stock 6
const cream = { productId: 'tatcha-water-cream', quantity: 1 };

describe('placing orders', () => {
  it('requires authentication', async () => {
    await request(ctx.app).post('/api/orders').send(orderBody([cream])).expect(401);
  });

  it('prices everything on the server, ignoring any client-supplied amounts', async () => {
    const { agent } = await registerAgent(ctx.app);
    const res = await agent.post('/api/orders').send({ ...orderBody([fenty]), total: 0.01, subtotal: 0.01, items: [{ ...fenty, unitPrice: 0.01, price: 0.01 }] });
    expect(res.status).toBe(201);
    const o = res.body.order;
    expect(o).toMatchObject({ subtotal: 40, discount: 0, shipping: 5.95, tax: 3.55, total: 49.5, status: 'Processing', paymentStatus: 'Pending', paymentMethod: 'Pay on delivery' });
    expect(o.orderNumber).toBe('SAY-10001');
    expect(o.items[0]).toMatchObject({ productId: 'fenty-pro-filtr-foundation', shadeId: '230', unitPrice: 40, quantity: 1, shadeName: expect.stringContaining('Medium') });
    expect(o.trackingNumber).toBe(''); // assigned only when staff ship it
    expect(o.estimatedDelivery).toMatch(/\w{3} \d{1,2}, \d{4}/);
    expect(o.events[0].status).toBe('Processing');
  });

  it('decrements stock, awards points and sends a confirmation email', async () => {
    const { agent, email } = await registerAgent(ctx.app);
    await agent.post('/api/orders').send(orderBody([{ ...fenty, quantity: 2 }])).expect(201);
    expect(await stockOf(fenty.productId)).toBe(4);
    const me = (await agent.get('/api/auth/me')).body.user;
    expect(me.points).toBe(50 + 80);
    await new Promise((r) => setTimeout(r, 50));
    expect(ctx.sent).toHaveLength(1);
    expect(ctx.sent[0]).toMatchObject({ to: email, subject: expect.stringContaining('SAY-10001') });
  });

  it('rejects unknown products, bad shades, bad quantities and empty bags', async () => {
    const { agent } = await registerAgent(ctx.app);
    expect((await agent.post('/api/orders').send(orderBody([{ productId: 'ghost', quantity: 1 }]))).status).toBe(409);
    expect((await agent.post('/api/orders').send(orderBody([{ ...fenty, shadeId: 'nope' }]))).status).toBe(400);
    expect((await agent.post('/api/orders').send(orderBody([{ ...cream, quantity: 0 }]))).status).toBe(400);
    expect((await agent.post('/api/orders').send(orderBody([{ ...cream, quantity: 11 }]))).status).toBe(400);
    expect((await agent.post('/api/orders').send(orderBody([]))).status).toBe(400);
    expect((await agent.post('/api/orders').send({ ...orderBody([cream]), shippingAddress: { fullName: '' } })).status).toBe(400);
  });

  it('refuses to oversell and leaves stock untouched on failure', async () => {
    const { agent } = await registerAgent(ctx.app);
    const res = await agent.post('/api/orders').send(orderBody([{ ...fenty, quantity: 7 }, cream]));
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('insufficient_stock');
    expect(await stockOf(fenty.productId)).toBe(6);
    expect(await stockOf('tatcha-water-cream')).toBeGreaterThan(0);
    expect((await ctx.db.query('SELECT count(*)::int AS n FROM orders')).rows[0].n).toBe(0);
  });

  it('is atomic: a failing line rolls back stock changes for the other lines', async () => {
    const { agent } = await registerAgent(ctx.app);
    const before = await stockOf('tatcha-water-cream');
    await agent.post('/api/orders').send(orderBody([cream, { ...fenty, shadeId: 'bogus' }])).expect(400);
    expect(await stockOf('tatcha-water-cream')).toBe(before);
  });

  it('is idempotent for a repeated Idempotency-Key (double-click safe)', async () => {
    const { agent } = await registerAgent(ctx.app);
    const key = 'checkout-abc-12345';
    const a = await agent.post('/api/orders').set('Idempotency-Key', key).send(orderBody([fenty]));
    const b = await agent.post('/api/orders').set('Idempotency-Key', key).send(orderBody([fenty]));
    expect(a.status).toBe(201);
    expect(b.status).toBe(200);
    expect(b.body.order.id).toBe(a.body.order.id);
    expect(await stockOf(fenty.productId)).toBe(5);
  });

  it('never oversells under concurrent checkouts', async () => {
    await ctx.db.query("UPDATE products SET stock = 3 WHERE id = 'rare-beauty-soft-pinch-blush'");
    const blush = await ctx.db.query("SELECT shades FROM products WHERE id = 'rare-beauty-soft-pinch-blush'");
    const shadeId = blush.rows[0].shades[0]?.id;
    const buyers = await Promise.all(Array.from({ length: 6 }, () => registerAgent(ctx.app)));
    const results = await Promise.all(buyers.map((b) =>
      b.agent.post('/api/orders').send(orderBody([{ productId: 'rare-beauty-soft-pinch-blush', quantity: 1, ...(shadeId ? { shadeId } : {}) }]))
    ));
    const ok = results.filter((r) => r.status === 201).length;
    expect(ok).toBe(3);
    expect(results.filter((r) => r.status === 409)).toHaveLength(3);
    expect(await stockOf('rare-beauty-soft-pinch-blush')).toBe(0);
    expect((await ctx.db.query('SELECT count(*)::int AS n FROM orders')).rows[0].n).toBe(3);
    const numbers = (await ctx.db.query('SELECT order_number FROM orders')).rows.map((r) => r.order_number);
    expect(new Set(numbers).size).toBe(3);
  });

  it('lets customers see only their own orders', async () => {
    const a = await registerAgent(ctx.app); const b = await registerAgent(ctx.app);
    const id = (await a.agent.post('/api/orders').send(orderBody([cream]))).body.order.id;
    expect((await a.agent.get('/api/me/orders')).body.orders).toHaveLength(1);
    expect((await b.agent.get('/api/me/orders')).body.orders).toHaveLength(0);
    await a.agent.get(`/api/orders/${id}`).expect(200);
    await b.agent.get(`/api/orders/${id}`).expect(404);
    await b.agent.post(`/api/orders/${id}/cancel`).expect(404);
  });
});

describe('promo codes', () => {
  const addPromo = (sql: string, params: unknown[] = []) => ctx.db.query(sql, params);
  beforeEach(async () => {
    await addPromo(`INSERT INTO promo_codes (code, description, discount_percent) VALUES ('SAVE20','20% off',20)`);
    await addPromo(`INSERT INTO promo_codes (code, description, discount_amount_cents, min_spend_cents) VALUES ('TENOFF','$10 off over $50',1000,5000)`);
    await addPromo(`INSERT INTO promo_codes (code, description, discount_percent, required_tier) VALUES ('ROUGE25','Rouge only',25,'Rouge')`);
    await addPromo(`INSERT INTO promo_codes (code, description, discount_percent, expires_at) VALUES ('OLD10','expired',10, now() - interval '1 day')`);
    await addPromo(`INSERT INTO promo_codes (code, description, discount_percent, max_uses) VALUES ('ONCE','single use',10,1)`);
  });

  it('validates codes publicly with clear reasons', async () => {
    const ok = await request(ctx.app).post('/api/promos/validate').send({ code: ' save20 ' });
    expect(ok.body.promo).toMatchObject({ code: 'SAVE20', discountPercent: 20 });
    expect((await request(ctx.app).post('/api/promos/validate').send({ code: 'NOPE' })).status).toBe(404);
    expect((await request(ctx.app).post('/api/promos/validate').send({ code: 'OLD10' })).status).toBe(410);
    expect((await request(ctx.app).post('/api/promos/validate').send({ code: 'TENOFF', subtotal: 20 })).status).toBe(422);
    expect((await request(ctx.app).post('/api/promos/validate').send({ code: 'ROUGE25' })).status).toBe(403);
  });

  it('applies the discount at checkout, taxes the discounted amount and counts usage', async () => {
    const { agent } = await registerAgent(ctx.app);
    const res = await agent.post('/api/orders').send(orderBody([{ ...fenty, quantity: 3 }], { promoCode: 'save20' }));
    expect(res.status).toBe(201);
    expect(res.body.order).toMatchObject({ subtotal: 120, discount: 24, tax: 8.52, shipping: 0, total: 104.52, promoCode: 'SAVE20' });
    expect((await ctx.db.query("SELECT usage_count FROM promo_codes WHERE code = 'SAVE20'")).rows[0].usage_count).toBe(1);
  });

  it('enforces min spend, tier, expiry and single-use limits when ordering', async () => {
    const { agent } = await registerAgent(ctx.app);
    expect((await agent.post('/api/orders').send(orderBody([cream], { promoCode: 'ROUGE25' }))).status).toBe(403);
    expect((await agent.post('/api/orders').send(orderBody([cream], { promoCode: 'OLD10' }))).status).toBe(410);
    expect((await agent.post('/api/orders').send(orderBody([cream], { promoCode: 'ONCE' }))).status).toBe(201);
    expect((await agent.post('/api/orders').send(orderBody([cream], { promoCode: 'ONCE' }))).status).toBe(410);
    expect((await agent.post('/api/orders').send(orderBody([{ productId: 'glow-recipe-dew-drops', quantity: 1 }], { promoCode: 'TENOFF' }))).status).toBe(422);
  });

  it('a single-use code cannot be double-spent by concurrent orders', async () => {
    const buyers = await Promise.all(Array.from({ length: 4 }, () => registerAgent(ctx.app)));
    const results = await Promise.all(buyers.map((b) => b.agent.post('/api/orders').send(orderBody([cream], { promoCode: 'ONCE' }))));
    expect(results.filter((r) => r.status === 201)).toHaveLength(1);
  });

  it('only grants complimentary samples on orders over $50', async () => {
    const { agent } = await registerAgent(ctx.app);
    const small = await agent.post('/api/orders').send(orderBody([{ productId: 'olaplex-no-7-bonding-oil', quantity: 1 }], { sampleIds: ['sample-rare-oil'] }));
    expect(small.status).toBe(422);
    expect(small.body.error.code).toBe('samples_min_spend');
    expect(await stockOf('olaplex-no-7-bonding-oil')).toBeGreaterThan(0);
    const big = await agent.post('/api/orders').send(orderBody([cream], { sampleIds: ['sample-rare-oil'] }));
    expect(big.status).toBe(201);
    expect(big.body.order.samples).toHaveLength(1);
    expect((await agent.post('/api/orders').send(orderBody([cream], { sampleIds: ['nope'] }))).status).toBe(400);
  });

  it('gift packaging is priced server-side and recorded', async () => {
    const { agent } = await registerAgent(ctx.app);
    const res = await agent.post('/api/orders').send(orderBody([{ ...fenty, quantity: 2 }], { giftOption: { isGift: true, giftWrapType: 'Signature Black & Gold Box', cardMessage: 'Joyeux anniversaire' } }));
    expect(res.body.order.giftFee).toBe(5);
    expect(res.body.order.giftOption).toMatchObject({ isGift: true, cardMessage: 'Joyeux anniversaire' });
    expect(res.body.order.total).toBe(Math.round((8500 + Math.round(8500 * 0.08875)) ) / 100);
  });
});

describe('loyalty, tiers and rewards', () => {
  it('promotes members as lifetime spend grows and Rouge ships free', async () => {
    const { agent } = await registerAgent(ctx.app);
    await ctx.db.query("UPDATE products SET price_cents = 40000, stock = 10 WHERE id = 'tatcha-water-cream'");
    const first = await agent.post('/api/orders').send(orderBody([cream]));
    expect(first.status).toBe(201);
    let me = (await agent.get('/api/auth/me')).body.user;
    expect(me.tier).toBe('VIB');
    expect(me.points).toBe(50 + 400);
    expect(me.pointsToNextTier).toBe(600);
    await agent.post('/api/orders').send(orderBody([{ ...cream, quantity: 2 }])).expect(201);
    me = (await agent.get('/api/auth/me')).body.user;
    expect(me.tier).toBe('Rouge');
    const express = await agent.post('/api/orders').send(orderBody([cream], { shippingMethod: 'Express' }));
    expect(express.body.order.shipping).toBe(0);
  });

  it('redeems points for a single-use credit code that works at checkout', async () => {
    const { agent } = await registerAgent(ctx.app);
    await agent.post('/api/me/rewards/beauty-certificate/redeem').expect(409); // only 50 points
    await ctx.db.query("UPDATE users SET points = 300");
    const r = await agent.post('/api/me/rewards/beauty-certificate/redeem');
    expect(r.status).toBe(201);
    expect(r.body).toMatchObject({ value: 10, remainingPoints: 50, code: expect.stringMatching(/^RWD-[0-9A-F]{10}$/) });
    expect((await agent.get('/api/auth/me')).body.user.points).toBe(50);
    const order = await agent.post('/api/orders').send(orderBody([{ ...fenty, quantity: 2 }], { promoCode: r.body.code }));
    expect(order.body.order.discount).toBe(10);
    // single use, and not usable by someone else
    expect((await agent.post('/api/orders').send(orderBody([cream], { promoCode: r.body.code }))).status).toBe(410);
    const other = await registerAgent(ctx.app);
    expect((await other.agent.post('/api/promos/validate').send({ code: r.body.code })).status).toBe(403);
    const listed = (await agent.get('/api/me/rewards')).body;
    expect(listed.redemptions[0]).toMatchObject({ code: r.body.code, used: true });
  });
});

describe('cancellation & fulfilment', () => {
  it('customer cancellation restocks, reverses points/promo and records the event', async () => {
    const { agent } = await registerAgent(ctx.app);
    await ctx.db.query(`INSERT INTO promo_codes (code, description, discount_percent) VALUES ('SAVE20','x',20)`);
    const o = (await agent.post('/api/orders').send(orderBody([{ ...fenty, quantity: 2 }], { promoCode: 'SAVE20' }))).body.order;
    expect(await stockOf(fenty.productId)).toBe(4);
    const res = await agent.post(`/api/orders/${o.id}/cancel`);
    expect(res.status).toBe(200);
    expect(res.body.order.status).toBe('Cancelled');
    expect(res.body.order.paymentStatus).toBe('Failed');
    expect(await stockOf(fenty.productId)).toBe(6);
    expect((await agent.get('/api/auth/me')).body.user.points).toBe(50);
    expect((await ctx.db.query("SELECT usage_count FROM promo_codes WHERE code = 'SAVE20'")).rows[0].usage_count).toBe(0);
    expect(res.body.order.events.map((e: any) => e.status)).toEqual(['Processing', 'Cancelled']);
    await agent.post(`/api/orders/${o.id}/cancel`).expect(409); // already cancelled: not Processing
  });

  it('staff move orders through a valid lifecycle, assign tracking, and customers are emailed', async () => {
    const { agent } = await registerAgent(ctx.app);
    const staff = await adminAgent(ctx, 'Staff');
    const o = (await agent.post('/api/orders').send(orderBody([cream]))).body.order;
    ctx.sent.length = 0;

    await staff.patch(`/api/admin/orders/${o.id}`).send({ status: 'Delivered' }).expect(200).then(async () => {
      await staff.patch(`/api/admin/orders/${o.id}`).send({ status: 'Packed' }).expect(409); // cannot go backwards
    });
    const o2 = (await agent.post('/api/orders').send(orderBody([cream]))).body.order;
    await staff.patch(`/api/admin/orders/${o2.id}`).send({ status: 'Packed' }).expect(200);
    const shipped = await staff.patch(`/api/admin/orders/${o2.id}`).send({ status: 'Shipped', trackingNumber: '1Z999AA10123456784', carrier: 'UPS' });
    expect(shipped.body.order).toMatchObject({ status: 'Shipped', trackingNumber: '1Z999AA10123456784', carrier: 'UPS' });
    await staff.patch(`/api/admin/orders/${o2.id}`).send({ status: 'Cancelled' }).expect(409); // too late to cancel
    await staff.patch(`/api/admin/orders/${o2.id}`).send({ status: 'Delivered' }).expect(200);
    const final = (await agent.get(`/api/orders/${o2.id}`)).body.order;
    expect(final.status).toBe('Delivered');
    expect(final.paymentStatus).toBe('Paid'); // pay-on-delivery settles on delivery
    expect(final.events.map((e: any) => e.status)).toEqual(['Processing', 'Packed', 'Shipped', 'Delivered']);
    await new Promise((r) => setTimeout(r, 50));
    expect(ctx.sent.some((m) => /Shipped/.test(m.subject))).toBe(true);
  });

  it('staff cancellation restocks and customers cannot cancel after packing', async () => {
    const { agent } = await registerAgent(ctx.app);
    const staff = await adminAgent(ctx, 'Staff');
    const o = (await agent.post('/api/orders').send(orderBody([fenty]))).body.order;
    await staff.patch(`/api/admin/orders/${o.id}`).send({ status: 'Packed' }).expect(200);
    await agent.post(`/api/orders/${o.id}/cancel`).expect(409);
    await staff.patch(`/api/admin/orders/${o.id}`).send({ status: 'Cancelled' }).expect(200);
    expect(await stockOf(fenty.productId)).toBe(6);
  });

  it('admin order list supports status filter and search', async () => {
    const { agent } = await registerAgent(ctx.app);
    const staff = await adminAgent(ctx, 'Staff');
    await agent.post('/api/orders').send(orderBody([cream])).expect(201);
    expect((await staff.get('/api/admin/orders?status=Processing')).body.count).toBe(1);
    expect((await staff.get('/api/admin/orders?status=Delivered')).body.count).toBe(0);
    expect((await staff.get('/api/admin/orders?q=SAY-10001')).body.count).toBe(1);
    expect((await staff.get('/api/admin/orders?q=%25')).body.count).toBe(0);
  });
});

describe('admin analytics', () => {
  it('computes real figures from orders', async () => {
    const { agent } = await registerAgent(ctx.app);
    const admin = await adminAgent(ctx);
    expect((await admin.get('/api/admin/analytics')).body).toMatchObject({ totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 });
    const a = (await agent.post('/api/orders').send(orderBody([{ ...fenty, quantity: 2 }], { sampleIds: ['sample-rare-oil'] }))).body.order;
    const b = (await agent.post('/api/orders').send(orderBody([cream]))).body.order;
    await admin.patch(`/api/admin/orders/${b.id}`).send({ status: 'Cancelled' }).expect(200);
    const stats = (await admin.get('/api/admin/analytics')).body;
    expect(stats.totalOrders).toBe(1);
    expect(stats.totalRevenue).toBe(a.total);
    expect(stats.averageOrderValue).toBe(a.total);
    expect(stats.returnRate).toBe(50);
    expect(stats.sampleAttachRate).toBe(100);
    expect(stats.categoryBreakdown).toEqual({ Makeup: 100 });
    expect(stats.revenueByDay).toHaveLength(14);
    expect(stats.revenueByDay.at(-1).revenue).toBe(a.total);
    expect(stats.ordersByStatus).toEqual({ Processing: 1, Cancelled: 1 });
    expect(stats.totalCustomers).toBe(1);
  });
});
