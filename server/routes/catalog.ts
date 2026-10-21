import { Router } from 'express';
import { z } from 'zod';
import type { AppDeps } from '../types';
import { ah, parse, notFound, escapeLike } from '../http';
import type { Limiters } from '../middleware/rateLimit';
import { PRODUCT_COLUMNS, toProduct, type ProductRow } from '../services/mappers';
import { pricingRules } from '../services/orders';
import { assertPromoUsable, normalizeCode, PROMO_COLUMNS, toPromoPublic, type PromoRow } from '../services/promos';
import { toCents } from '../../shared/commerce';

const listQuery = z.object({
  category: z.string().max(60).optional(),
  brand: z.string().max(120).optional(),
  search: z.string().trim().max(100).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  cleanOnly: z.enum(['true', 'false']).optional(),
  saleOnly: z.enum(['true', 'false']).optional(),
  sort: z.enum(['featured', 'bestselling', 'price-asc', 'price-desc', 'rating', 'newest', 'name']).default('featured'),
  limit: z.coerce.number().int().min(1).max(500).default(200),
  offset: z.coerce.number().int().min(0).default(0)
});

const SORTS: Record<string, string> = {
  featured: 'is_bestseller DESC, review_count DESC, name',
  bestselling: 'review_count DESC, name',
  'price-asc': 'price_cents ASC, name',
  'price-desc': 'price_cents DESC, name',
  rating: 'rating DESC, review_count DESC, name',
  newest: 'is_new DESC, created_at DESC',
  name: 'name'
};

export function catalogRouter(deps: AppDeps, limiters: Limiters): Router {
  const r = Router();
  const { db, config } = deps;

  r.get('/config', (_req, res) => {
    res.json({
      pricing: pricingRules(config),
      payment: { provider: config.PAYMENT_PROVIDER },
      aiEnabled: Boolean(deps.ai)
    });
  });

  r.get('/products', ah(async (req, res) => {
    const q = parse(listQuery, req.query);
    const where: string[] = ["status = 'Active'"];
    const params: unknown[] = [];
    const add = (sql: string, v: unknown) => { params.push(v); where.push(sql.replace('?', `$${params.length}`)); };
    if (q.category && q.category !== 'All') add('lower(category) = lower(?)', q.category);
    if (q.brand) add('brand = ?', q.brand);
    if (q.minPrice !== undefined) add('price_cents >= ?', toCents(q.minPrice));
    if (q.maxPrice !== undefined) add('price_cents <= ?', toCents(q.maxPrice));
    if (q.cleanOnly === 'true') where.push('is_clean');
    if (q.saleOnly === 'true') where.push('is_sale');
    if (q.search) add(`lower(name || ' ' || brand || ' ' || subcategory || ' ' || category) LIKE ?`, `%${escapeLike(q.search.toLowerCase())}%`);
    const { rows } = await db.query<ProductRow>(
      `SELECT ${PRODUCT_COLUMNS} FROM products WHERE ${where.join(' AND ')} ORDER BY ${SORTS[q.sort]} LIMIT ${q.limit} OFFSET ${q.offset}`, params
    );
    res.json({ count: rows.length, products: rows.map(toProduct) });
  }));

  r.get('/products/:id', ah(async (req, res) => {
    const { rows } = await db.query<ProductRow>(`SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = $1 AND status = 'Active'`, [req.params.id]);
    if (!rows[0]) throw notFound('Product not found.');
    res.json({ product: toProduct(rows[0]) });
  }));

  r.get('/samples', ah(async (_req, res) => {
    const { rows } = await db.query('SELECT id, name, brand, category, image FROM samples WHERE is_active ORDER BY name');
    res.json({ samples: rows });
  }));

  r.get('/boutiques', ah(async (req, res) => {
    const city = typeof req.query.city === 'string' ? req.query.city : undefined;
    const { rows } = await db.query(
      `SELECT id, name, address, city, map_uri AS uri, rating, reviews_count AS "reviewsCount", phone, services, snippets, in_stock_items AS "inStockItems"
       FROM boutiques WHERE is_active AND ($1::text IS NULL OR lower(city) = lower($1)) ORDER BY name`, [city ?? null]
    );
    res.json({ boutiques: rows });
  }));

  r.post('/promos/validate', limiters.write, ah(async (req, res) => {
    const body = parse(z.object({ code: z.string().trim().min(1).max(40), subtotal: z.number().min(0).max(1_000_000).optional() }), req.body);
    const { rows } = await db.query<PromoRow>(`SELECT ${PROMO_COLUMNS} FROM promo_codes WHERE code = $1`, [normalizeCode(body.code)]);
    const promo = assertPromoUsable(rows[0], {
      userId: req.user?.id, tier: req.user?.tier,
      subtotalCents: body.subtotal !== undefined ? toCents(body.subtotal) : undefined
    });
    res.json({ promo: toPromoPublic(promo) });
  }));

  r.post('/newsletter', limiters.write, ah(async (req, res) => {
    const { email } = parse(z.object({ email: z.string().trim().toLowerCase().email('Enter a valid email address.').max(254) }), req.body);
    await db.query('INSERT INTO newsletter_subscribers (email) VALUES ($1) ON CONFLICT DO NOTHING', [email]);
    res.status(201).json({ ok: true });
  }));

  return r;
}
