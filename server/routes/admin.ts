import { Router } from 'express';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import type { AppDeps } from '../types';
import { ah, parse, notFound, conflict, escapeLike } from '../http';
import { requireRole } from '../middleware/auth';
import type { Limiters } from '../middleware/rateLimit';
import { PRODUCT_COLUMNS, toProduct, type ProductRow } from '../services/mappers';
import { adminUpdateOrder, loadOrderBundles } from '../services/orders';
import { orderStatusEmail, sendSafe } from '../services/email';
import { PROMO_COLUMNS, toPromoAdmin, type PromoRow } from '../services/promos';
import { toReview, type ReviewRow } from './reviews';
import { migrationStatus } from '../db/migrate';
import { toCents, TIERS } from '../../shared/commerce';

const url = z.string().trim().url().max(1000).refine((u) => /^https?:\/\//.test(u), 'Must be an http(s) URL.');
const shade = z.object({
  id: z.string().min(1).max(60), name: z.string().min(1).max(160), hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  inStock: z.boolean().default(true), description: z.string().max(300).optional(), finishType: z.string().max(40).optional()
});

const productBase = z.object({
  name: z.string().trim().min(2).max(200),
  brand: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(60),
  subcategory: z.string().trim().min(1).max(80).default('General'),
  price: z.number().positive().max(100_000),
  originalPrice: z.number().positive().max(100_000).nullable().optional(),
  stockLeft: z.number().int().min(0).max(1_000_000).default(0),
  status: z.enum(['Active', 'Draft', 'Archived']).default('Active'),
  description: z.string().trim().max(5000).default(''),
  details: z.array(z.string().max(500)).max(20).default([]),
  howToUse: z.array(z.string().max(500)).max(20).default([]),
  ingredients: z.string().max(10_000).default(''),
  image: url,
  hoverImage: url.optional(),
  isClean: z.boolean().default(true), isBestseller: z.boolean().default(false), isSale: z.boolean().default(false), isNew: z.boolean().default(false),
  shades: z.array(shade).max(80).default([]),
  sizes: z.array(z.string().max(80)).max(10).default([]),
  skinTypes: z.array(z.string().max(30)).max(8).default([]),
  coverage: z.string().max(30).nullable().optional(), finish: z.string().max(30).nullable().optional(), awards: z.string().max(200).nullable().optional(),
  frequentlyBoughtWith: z.array(z.string().max(120)).max(6).default([])
});
const productUpdate = productBase.partial();

const promoSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,40}$/, 'Use 3–40 letters, numbers, - or _.'),
  description: z.string().trim().min(1).max(200),
  discountPercent: z.number().int().min(1).max(100).optional(),
  discountAmount: z.number().positive().max(10_000).optional(),
  freeShipping: z.boolean().default(false),
  minSpend: z.number().min(0).max(100_000).default(0),
  maxUses: z.number().int().positive().optional(),
  requiredTier: z.enum(TIERS as [string, ...string[]]).optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().default(true)
}).refine((p) => p.discountPercent || p.discountAmount || p.freeShipping, { message: 'A promotion must grant a discount or free shipping.' })
  .refine((p) => !(p.discountPercent && p.discountAmount), { message: 'Choose either a percentage or a fixed amount, not both.' });

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'product';

export function adminRouter(deps: AppDeps, limiters: Limiters): Router {
  const r = Router();
  const { db } = deps;
  const staff = requireRole('Admin', 'Staff');
  const admin = requireRole('Admin');
  r.use('/admin', limiters.write);

  // ---------------------------------------------------------- products -----
  r.get('/admin/products', staff, ah(async (_req, res) => {
    const { rows } = await db.query<ProductRow>(`SELECT ${PRODUCT_COLUMNS} FROM products ORDER BY created_at DESC, name`);
    res.json({ products: rows.map(toProduct) });
  }));

  const insertCols = (p: z.infer<typeof productBase>) => [
    p.name, p.brand, p.category, p.subcategory, toCents(p.price), p.originalPrice ? toCents(p.originalPrice) : null, p.isBestseller, p.isClean,
    p.isSale, p.isNew, p.stockLeft, p.status, p.description, p.details, p.howToUse, p.ingredients, p.image, p.hoverImage ?? p.image,
    JSON.stringify(p.shades), p.sizes, p.skinTypes, p.coverage ?? null, p.finish ?? null, p.awards ?? null, p.frequentlyBoughtWith
  ];

  r.post('/admin/products', admin, ah(async (req, res) => {
    const p = parse(productBase, req.body);
    for (let attempt = 0; attempt < 3; attempt++) {
      const id = `${slug(p.name)}-${randomBytes(2).toString('hex')}`;
      try {
        const { rows } = await db.query<ProductRow>(
          `INSERT INTO products (id, name, brand, category, subcategory, price_cents, original_price_cents, is_bestseller, is_clean, is_sale,
             is_new, stock, status, description, details, how_to_use, ingredients, image, hover_image, shades, sizes, skin_types, coverage,
             finish, awards, frequently_bought_with)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20::jsonb,$21,$22,$23,$24,$25,$26) RETURNING ${PRODUCT_COLUMNS}`,
          [id, ...insertCols(p)]
        );
        return res.status(201).json({ product: toProduct(rows[0]) });
      } catch (err) {
        if ((err as { code?: string }).code !== '23505') throw err;
      }
    }
    throw conflict('Could not allocate a unique product id; please retry.');
  }));

  r.put('/admin/products/:id', admin, ah(async (req, res) => {
    // `.partial()` keeps zod defaults, which would silently overwrite stored values; apply only keys that were sent.
    const parsed = parse(productUpdate, req.body);
    const patch = Object.fromEntries(Object.entries(parsed).filter(([k]) => Object.prototype.hasOwnProperty.call(req.body, k))) as typeof parsed;
    const { rows: cur } = await db.query<ProductRow>(`SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = $1`, [req.params.id]);
    if (!cur[0]) throw notFound('Product not found.');
    const merged = productBase.parse({ ...toProduct(cur[0]), ...patch, stockLeft: patch.stockLeft ?? cur[0].stock, shades: patch.shades ?? cur[0].shades });
    const { rows } = await db.query<ProductRow>(
      `UPDATE products SET name=$2, brand=$3, category=$4, subcategory=$5, price_cents=$6, original_price_cents=$7, is_bestseller=$8, is_clean=$9,
         is_sale=$10, is_new=$11, stock=$12, status=$13, description=$14, details=$15, how_to_use=$16, ingredients=$17, image=$18, hover_image=$19,
         shades=$20::jsonb, sizes=$21, skin_types=$22, coverage=$23, finish=$24, awards=$25, frequently_bought_with=$26
       WHERE id = $1 RETURNING ${PRODUCT_COLUMNS}`,
      [req.params.id, ...insertCols(merged)]
    );
    res.json({ product: toProduct(rows[0]) });
  }));

  r.patch('/admin/products/:id/stock', staff, ah(async (req, res) => {
    const { stock } = parse(z.object({ stock: z.number().int().min(0).max(1_000_000) }), req.body);
    const { rows } = await db.query<ProductRow>(`UPDATE products SET stock = $2 WHERE id = $1 RETURNING ${PRODUCT_COLUMNS}`, [req.params.id, stock]);
    if (!rows[0]) throw notFound('Product not found.');
    res.json({ product: toProduct(rows[0]) });
  }));

  /** Archives rather than deletes so historic orders keep their product reference. */
  r.delete('/admin/products/:id', admin, ah(async (req, res) => {
    const { rowCount } = await db.query("UPDATE products SET status = 'Archived' WHERE id = $1", [req.params.id]);
    if (!rowCount) throw notFound('Product not found.');
    res.json({ ok: true, id: req.params.id, status: 'Archived' });
  }));

  // ------------------------------------------------------------ orders -----
  r.get('/admin/orders', staff, ah(async (req, res) => {
    const q = parse(z.object({
      status: z.string().max(30).optional(), q: z.string().trim().max(100).optional(),
      limit: z.coerce.number().int().min(1).max(500).default(200), offset: z.coerce.number().int().min(0).default(0)
    }), req.query);
    const where: string[] = []; const params: unknown[] = [];
    if (q.status && q.status !== 'All') { params.push(q.status); where.push(`status = $${params.length}`); }
    if (q.q) {
      params.push(`%${escapeLike(q.q.toLowerCase())}%`);
      where.push(`(lower(order_number) LIKE $${params.length} OR lower(ship_full_name) LIKE $${params.length} OR lower(ship_city) LIKE $${params.length} OR lower(customer_email) LIKE $${params.length})`);
    }
    const orders = await loadOrderBundles(db, where.length ? `WHERE ${where.join(' AND ')}` : '', params, { limit: q.limit, offset: q.offset });
    res.json({ count: orders.length, orders });
  }));

  r.patch('/admin/orders/:id', staff, ah(async (req, res) => {
    const id = parse(z.string().uuid(), req.params.id);
    const body = parse(z.object({
      status: z.enum(['Processing', 'Packed', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled']).optional(),
      trackingNumber: z.string().trim().min(3).max(60).optional(),
      carrier: z.string().trim().min(2).max(40).optional(),
      paymentStatus: z.enum(['Pending', 'Paid', 'Failed', 'Refunded']).optional()
    }).refine((b) => Object.keys(b).length > 0, { message: 'Nothing to update.' }), req.body);
    const result = await adminUpdateOrder(deps, id, req.user!, body);
    if (body.status && body.status !== result.previousStatus && ['Shipped', 'Delivered', 'Cancelled'].includes(body.status)) {
      sendSafe(deps.mailer, deps.logger, {
        to: result.order.customerEmail,
        ...orderStatusEmail({ orderNumber: result.order.orderNumber, customerName: result.order.shippingAddress.fullName, status: body.status, trackingNumber: result.order.trackingNumber, carrier: result.order.carrier })
      });
    }
    res.json({ order: result.order, refundRequired: result.refundRequired });
  }));

  // ------------------------------------------------------------ promos -----
  r.get('/admin/promos', admin, ah(async (_req, res) => {
    const { rows } = await db.query<PromoRow>(`SELECT ${PROMO_COLUMNS} FROM promo_codes WHERE owner_user_id IS NULL ORDER BY created_at DESC`);
    res.json({ promos: rows.map(toPromoAdmin) });
  }));
  r.post('/admin/promos', admin, ah(async (req, res) => {
    const p = parse(promoSchema, req.body);
    const { rows } = await db.query<PromoRow>(
      `INSERT INTO promo_codes (code, description, discount_percent, discount_amount_cents, free_shipping, min_spend_cents, max_uses, required_tier, expires_at, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (code) DO NOTHING RETURNING ${PROMO_COLUMNS}`,
      [p.code, p.description, p.discountPercent ?? null, p.discountAmount ? toCents(p.discountAmount) : null, p.freeShipping, toCents(p.minSpend),
       p.maxUses ?? null, p.requiredTier ?? null, p.expiresAt ?? null, p.isActive]
    );
    if (!rows[0]) throw conflict(`Promo code ${p.code} already exists.`);
    res.status(201).json({ promo: toPromoAdmin(rows[0]) });
  }));
  r.patch('/admin/promos/:code', admin, ah(async (req, res) => {
    const { isActive } = parse(z.object({ isActive: z.boolean() }), req.body);
    const { rows } = await db.query<PromoRow>(`UPDATE promo_codes SET is_active = $2 WHERE code = $1 RETURNING ${PROMO_COLUMNS}`, [req.params.code.toUpperCase(), isActive]);
    if (!rows[0]) throw notFound('Promo code not found.');
    res.json({ promo: toPromoAdmin(rows[0]) });
  }));
  r.delete('/admin/promos/:code', admin, ah(async (req, res) => {
    const { rowCount } = await db.query('DELETE FROM promo_codes WHERE code = $1 AND owner_user_id IS NULL', [req.params.code.toUpperCase()]);
    if (!rowCount) throw notFound('Promo code not found.');
    res.json({ ok: true });
  }));

  // ----------------------------------------------------------- reviews -----
  r.get('/admin/reviews', staff, ah(async (_req, res) => {
    const { rows } = await db.query<ReviewRow & { product_name: string; product_brand: string }>(
      `SELECT r.*, p.name AS product_name, p.brand AS product_brand FROM reviews r JOIN products p ON p.id = r.product_id ORDER BY r.created_at DESC LIMIT 500`
    );
    res.json({ reviews: rows.map((x) => ({ ...toReview(x), productTitle: x.product_name, productBrand: x.product_brand })) });
  }));

  // --------------------------------------------------------- analytics -----
  r.get('/admin/analytics', staff, ah(async (_req, res) => {
    const [{ rows: [totals] }, { rows: cats }, { rows: daily }, { rows: byStatus }, { rows: [stock] }, { rows: [customers] }, { rows: ai }, { rows: tones }, { rows: [boutiques] }] = await Promise.all([
      db.query(`SELECT COALESCE(sum(total_cents) FILTER (WHERE status <> 'Cancelled'), 0) AS revenue_cents,
                       count(*) FILTER (WHERE status <> 'Cancelled') AS orders,
                       count(*) FILTER (WHERE status = 'Cancelled') AS cancelled,
                       count(*) FILTER (WHERE status <> 'Cancelled' AND jsonb_array_length(samples) > 0) AS with_samples,
                       count(*) AS all_orders FROM orders`),
      db.query(`SELECT oi.category, sum(oi.unit_price_cents * oi.quantity) AS cents FROM order_items oi JOIN orders o ON o.id = oi.order_id
                WHERE o.status <> 'Cancelled' GROUP BY oi.category ORDER BY cents DESC`),
      db.query(`SELECT to_char(d, 'YYYY-MM-DD') AS day, COALESCE(sum(o.total_cents) FILTER (WHERE o.status <> 'Cancelled'), 0) AS cents
                FROM generate_series(current_date - 13, current_date, '1 day') d
                LEFT JOIN orders o ON o.created_at >= d AND o.created_at < d + interval '1 day' GROUP BY d ORDER BY d`),
      db.query('SELECT status, count(*) AS n FROM orders GROUP BY status'),
      db.query(`SELECT count(*) FILTER (WHERE stock <= 5 AND status = 'Active') AS low, count(*) FILTER (WHERE stock = 0 AND status = 'Active') AS out FROM products`),
      db.query(`SELECT count(*) AS total, count(*) FILTER (WHERE created_at > now() - interval '30 days') AS new30,
                (SELECT count(DISTINCT user_id) FROM orders WHERE created_at > now() - interval '90 days') AS active90 FROM users WHERE role = 'Customer'`),
      db.query(`SELECT kind, source, count(*) AS n FROM ai_events WHERE created_at > now() - interval '30 days' GROUP BY kind, source`),
      db.query(`SELECT detail AS undertone, count(*) AS n FROM ai_events WHERE kind = 'shade-match' AND detail IS NOT NULL AND created_at > now() - interval '30 days' GROUP BY detail ORDER BY n DESC`),
      db.query('SELECT count(*) AS n, count(DISTINCT city) AS cities FROM boutiques WHERE is_active')
    ]);
    const catTotal = cats.reduce((s, c) => s + c.cents, 0) || 1;
    res.json({
      totalRevenue: totals.revenue_cents / 100,
      totalOrders: totals.orders,
      averageOrderValue: totals.orders ? Math.round(totals.revenue_cents / totals.orders) / 100 : 0,
      activeCustomers: customers.active90,
      totalCustomers: customers.total,
      newCustomers30d: customers.new30,
      returnRate: totals.all_orders ? Math.round((totals.cancelled / totals.all_orders) * 1000) / 10 : 0,
      sampleAttachRate: totals.orders ? Math.round((totals.with_samples / totals.orders) * 1000) / 10 : 0,
      categoryBreakdown: Object.fromEntries(cats.map((c) => [c.category, Math.round((c.cents / catTotal) * 1000) / 10])),
      revenueByDay: daily.map((d) => ({ day: d.day, revenue: d.cents / 100 })),
      ordersByStatus: Object.fromEntries(byStatus.map((s) => [s.status, s.n])),
      lowStockCount: stock.low,
      outOfStockCount: stock.out,
      ai: {
        byKind: ai.reduce<Record<string, { gemini: number; fallback: number }>>((acc, e) => {
          (acc[e.kind] ??= { gemini: 0, fallback: 0 })[e.source as 'gemini' | 'fallback'] = e.n; return acc;
        }, {}),
        undertones: tones.map((t) => ({ undertone: t.undertone, count: t.n })),
        geminiConfigured: Boolean(deps.ai)
      },
      boutiques: { count: boutiques.n, cities: boutiques.cities }
    });
  }));

  r.get('/admin/system', admin, ah(async (_req, res) => {
    const [{ rows: [c] }, mig] = await Promise.all([
      db.query('SELECT (SELECT count(*) FROM users) AS users, (SELECT count(*) FROM products) AS products, (SELECT count(*) FROM orders) AS orders, (SELECT count(*) FROM reviews) AS reviews'),
      migrationStatus(db)
    ]);
    res.json({ counts: c, migrations: mig, node: process.version, uptimeSeconds: Math.round(process.uptime()), paymentProvider: deps.config.PAYMENT_PROVIDER, aiConfigured: Boolean(deps.ai), smtpConfigured: Boolean(deps.config.SMTP_HOST) });
  }));

  return r;
}
