import { createHash } from 'node:crypto';
import type { Db, Queryable } from './pool';
import { withTx } from './pool';
import { MOCK_PRODUCTS, COMPLIMENTARY_SAMPLES, MOCK_REVIEWS } from '../seed/catalog';
import { BOUTIQUES } from '../seed/boutiques';
import { hashPassword } from '../services/passwords';
import { toCents, WELCOME_POINTS } from '../../shared/commerce';

/** Deterministic UUID so re-running the seed never duplicates rows. */
export function seedUuid(key: string): string {
  const h = createHash('sha1').update(`sayphora-seed:${key}`).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

const REWARDS = [
  { id: 'rare-miniature', title: 'Rare Beauty Miniature', description: 'A $5 credit toward any order, issued as a single-use code.', cost: 100, value: 500 },
  { id: 'beauty-certificate', title: '$10 Beauty Certificate', description: 'A $10 credit toward any order, issued as a single-use code.', cost: 250, value: 1000 },
  { id: 'fullsize-credit', title: 'Full-Size Treat Credit', description: 'A $25 credit toward a full-size product, issued as a single-use code.', cost: 500, value: 2500 }
];

/** Production-safe starter data: catalogue, samples, rewards, boutiques. Never overwrites existing rows. */
export async function seedCatalog(db: Db): Promise<{ products: number }> {
  await withTx(db, async (tx) => {
    for (const p of MOCK_PRODUCTS) {
      await tx.query(
        `INSERT INTO products (id, name, brand, category, subcategory, price_cents, original_price_cents,
           is_bestseller, is_clean, is_sale, is_new, stock, status, description, details, how_to_use, ingredients,
           ingredient_analysis, image, hover_image, shades, sizes, skin_types, coverage, finish, awards, frequently_bought_with)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'Active',$13,$14,$15,$16,$17,$18,$19,$20::jsonb,$21,$22,$23,$24,$25,$26)
         ON CONFLICT (id) DO NOTHING`,
        [
          p.id, p.name, p.brand, p.category, p.subcategory, toCents(p.price),
          p.originalPrice ? toCents(p.originalPrice) : null,
          p.isBestseller ?? false, p.isClean ?? true, p.isSale ?? false, p.isNew ?? false,
          p.stockLeft ?? 20, p.description, p.details ?? [], p.howToUse ?? [], p.ingredients ?? '',
          p.ingredientAnalysis ? JSON.stringify(p.ingredientAnalysis) : null,
          p.image, p.hoverImage || p.image, JSON.stringify(p.shades ?? []), p.sizes ?? [], p.skinTypes ?? [],
          p.coverage ?? null, p.finish ?? null, p.awards ?? null, p.frequentlyBoughtWith ?? []
        ]
      );
    }
    for (const s of COMPLIMENTARY_SAMPLES) {
      await tx.query(
        `INSERT INTO samples (id, name, brand, category, image) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING`,
        [s.id, s.name, s.brand, s.category, s.image]
      );
    }
    for (const r of REWARDS) {
      await tx.query(
        `INSERT INTO rewards (id, title, description, cost_points, value_cents) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING`,
        [r.id, r.title, r.description, r.cost, r.value]
      );
    }
    for (const b of BOUTIQUES) {
      await tx.query(
        `INSERT INTO boutiques (id, name, address, city, map_uri, rating, reviews_count, phone, services, snippets, in_stock_items)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (id) DO NOTHING`,
        [b.id, b.name, b.address, b.city, b.mapUri, b.rating, b.reviewsCount, b.phone, b.services, b.snippets, b.inStockItems]
      );
    }
  });
  return { products: MOCK_PRODUCTS.length };
}

export const DEMO_CUSTOMER = { email: 'demo@sayphora.test', password: 'DemoPassw0rd!2026', name: 'Sophia Laurent' };

/** Development/demo data: well-known promo codes, a demo customer and sample reviews. NEVER run in production. */
export async function seedDemo(db: Db, hashCost: number): Promise<void> {
  const passwordHash = await hashPassword(DEMO_CUSTOMER.password, hashCost);
  await withTx(db, async (tx) => {
    await tx.query(
      `INSERT INTO users (email, password_hash, name, tier, points, lifetime_spend_cents, skin_type, skin_tone, undertone, concerns, favorite_brands)
       VALUES ($1,$2,$3,'VIB',480,45000,'Combination','Light','Neutral',$4,$5)
       ON CONFLICT (lower(email)) DO NOTHING`,
      [DEMO_CUSTOMER.email, passwordHash, DEMO_CUSTOMER.name, ['Hydration', 'Pore Smoothing', 'Radiance'], ['Fenty Beauty by Rihanna', 'Tatcha', 'Rare Beauty by Selena Gomez']]
    );
    const promos: Array<[string, string, number | null, number | null, boolean, number, string | null]> = [
      ['SAYPHORA20', '20% off entire order for Fall VIP Beauty Event', 20, null, false, 0, null],
      ['FREESHIP', 'Complimentary shipping on all orders', null, null, true, 0, null],
      ['BEAUTY10', '$10 off orders over $50', null, 1000, false, 5000, null],
      ['ROUGEVIP', 'Exclusive 25% discount for Rouge tier members', 25, null, false, 10000, 'Rouge']
    ];
    for (const [code, description, pct, amt, ship, min, tier] of promos) {
      await tx.query(
        `INSERT INTO promo_codes (code, description, discount_percent, discount_amount_cents, free_shipping, min_spend_cents, required_tier)
         VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (code) DO NOTHING`,
        [code, description, pct, amt, ship, min, tier]
      );
    }
    for (const [productId, reviews] of Object.entries(MOCK_REVIEWS)) {
      for (const r of reviews) {
        const created = new Date(`${r.date} 12:00:00 UTC`);
        await tx.query(
          `INSERT INTO reviews (id, product_id, user_name, user_badge, rating, title, comment, verified_purchase, shade_used,
             skin_type, skin_tone, undertone, recommended, helpful_count, unhelpful_count, photos, created_at)
           SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
           WHERE EXISTS (SELECT 1 FROM products WHERE id = $2)
           ON CONFLICT (id) DO NOTHING`,
          [
            seedUuid(r.id), productId, r.userName, r.userBadge ?? null, r.rating, r.title, r.comment, r.verifiedPurchase,
            r.shadeUsed ?? null, r.skinType ?? null, r.skinTone ?? null, r.undertone ?? null, r.recommended ?? true,
            r.helpfulCount, r.unhelpfulCount ?? 0, r.photos ?? [],
            Number.isNaN(created.getTime()) ? new Date() : created
          ]
        );
      }
    }
    await recomputeProductRatings(tx);
  });
}

/** Recomputes cached rating/review_count for one product (or all when no id is given). */
export async function recomputeProductRatings(q: Queryable, productId?: string): Promise<void> {
  await q.query(
    `UPDATE products p SET
       rating = COALESCE((SELECT round(avg(r.rating)::numeric, 2) FROM reviews r WHERE r.product_id = p.id), 0),
       review_count = (SELECT count(*) FROM reviews r WHERE r.product_id = p.id)
     WHERE ($1::text IS NULL OR p.id = $1)`,
    [productId ?? null]
  );
}

export async function createAdmin(
  db: Db,
  opts: { email: string; password: string; name?: string; hashCost: number }
): Promise<{ created: boolean }> {
  const hash = await hashPassword(opts.password, opts.hashCost);
  const res = await db.query(
    `INSERT INTO users (email, password_hash, name, role, points)
     VALUES ($1,$2,$3,'Admin',$4) ON CONFLICT (lower(email)) DO NOTHING`,
    [opts.email.trim(), hash, opts.name ?? 'Sayphora Admin', WELCOME_POINTS]
  );
  return { created: (res.rowCount ?? 0) > 0 };
}
