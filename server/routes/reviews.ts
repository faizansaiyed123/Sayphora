import { Router } from 'express';
import { z } from 'zod';
import type { AppDeps } from '../types';
import { ah, parse, notFound, conflict, forbidden, HttpError } from '../http';
import { requireAuth } from '../middleware/auth';
import type { Limiters } from '../middleware/rateLimit';
import { withTx } from '../db/pool';
import { recomputeProductRatings } from '../db/seed';
import { formatLongDate } from '../services/mappers';

export interface ReviewRow {
  id: string; product_id: string; user_id: string | null; user_name: string; user_badge: string | null; rating: number;
  title: string; comment: string; verified_purchase: boolean; shade_used: string | null; skin_type: string | null;
  skin_tone: string | null; undertone: string | null; recommended: boolean; helpful_count: number; unhelpful_count: number;
  photos: string[]; created_at: Date; my_vote?: number | null;
}

export const toReview = (r: ReviewRow) => ({
  id: r.id,
  productId: r.product_id,
  userName: r.user_name,
  userBadge: r.user_badge ?? undefined,
  rating: r.rating,
  date: formatLongDate(r.created_at),
  createdAt: r.created_at.toISOString(),
  title: r.title,
  comment: r.comment,
  verifiedPurchase: r.verified_purchase,
  shadeUsed: r.shade_used ?? undefined,
  skinType: r.skin_type ?? undefined,
  skinTone: r.skin_tone ?? undefined,
  undertone: r.undertone ?? undefined,
  recommended: r.recommended,
  helpfulCount: r.helpful_count,
  unhelpfulCount: r.unhelpful_count,
  photos: r.photos.length ? r.photos : undefined,
  userVotedHelpful: r.my_vote === 1,
  userVotedUnhelpful: r.my_vote === -1
});

const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Choose a star rating.').max(5),
  title: z.string().trim().min(1, 'Add a headline.').max(140),
  comment: z.string().trim().min(10, 'Please write at least 10 characters.').max(4000),
  shadeUsed: z.string().trim().max(160).optional(),
  recommended: z.boolean().default(true),
  photos: z.array(z.string().url().max(500).refine((u) => u.startsWith('https://'), 'Photos must be https URLs.')).max(4).default([])
});

/** "Sophia Laurent" -> "Sophia L." for public display. */
export function publicName(full: string): string {
  const parts = full.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.` : parts[0];
}

export function reviewsRouter(deps: AppDeps, limiters: Limiters): Router {
  const r = Router();
  const { db } = deps;

  r.get('/products/:id/reviews', ah(async (req, res) => {
    const { rows } = await db.query<ReviewRow>(
      `SELECT r.*, v.vote AS my_vote FROM reviews r LEFT JOIN review_votes v ON v.review_id = r.id AND v.user_id = $2
       WHERE r.product_id = $1 ORDER BY r.created_at DESC LIMIT 200`, [req.params.id, req.user?.id ?? null]
    );
    res.json({ count: rows.length, reviews: rows.map(toReview) });
  }));

  r.post('/products/:id/reviews', requireAuth, limiters.write, ah(async (req, res) => {
    const body = parse(reviewSchema, req.body);
    const user = req.user!;
    const review = await withTx(db, async (tx) => {
      const { rows: prod } = await tx.query("SELECT 1 FROM products WHERE id = $1 AND status <> 'Draft'", [req.params.id]);
      if (!prod[0]) throw notFound('Product not found.');
      const { rows: bought } = await tx.query(
        `SELECT 1 FROM order_items oi JOIN orders o ON o.id = oi.order_id
         WHERE o.user_id = $1 AND oi.product_id = $2 AND o.status <> 'Cancelled' LIMIT 1`, [user.id, req.params.id]
      );
      const verified = bought.length > 0;
      const badge = user.tier === 'Rouge' ? 'Rouge Member' : user.tier === 'VIB' ? 'VIB Member' : verified ? 'Verified Buyer' : null;
      const { rows } = await tx.query<ReviewRow>(
        `INSERT INTO reviews (product_id, user_id, user_name, user_badge, rating, title, comment, verified_purchase, shade_used,
           skin_type, skin_tone, undertone, recommended, photos)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT (product_id, user_id) WHERE user_id IS NOT NULL DO NOTHING RETURNING *`,
        [req.params.id, user.id, publicName(user.name), badge, body.rating, body.title, body.comment, verified, body.shadeUsed ?? null,
         user.skinType, user.skinTone, user.undertone, body.recommended, body.photos]
      );
      if (!rows[0]) throw conflict('You have already reviewed this product.');
      await recomputeProductRatings(tx, req.params.id);
      return rows[0];
    });
    res.status(201).json({ review: toReview(review) });
  }));

  r.post('/reviews/:id/vote', requireAuth, limiters.write, ah(async (req, res) => {
    const { vote } = parse(z.object({ vote: z.enum(['helpful', 'unhelpful', 'none']) }), req.body);
    const id = parse(z.string().uuid(), req.params.id);
    const next = vote === 'helpful' ? 1 : vote === 'unhelpful' ? -1 : 0;
    const out = await withTx(db, async (tx) => {
      const { rows: rev } = await tx.query<{ user_id: string | null }>('SELECT user_id FROM reviews WHERE id = $1 FOR UPDATE', [id]);
      if (!rev[0]) throw notFound('Review not found.');
      if (rev[0].user_id === req.user!.id) throw forbidden('You cannot vote on your own review.');
      const { rows: prev } = await tx.query<{ vote: number }>('SELECT vote FROM review_votes WHERE review_id = $1 AND user_id = $2', [id, req.user!.id]);
      const before = prev[0]?.vote ?? 0;
      if (next === 0) await tx.query('DELETE FROM review_votes WHERE review_id = $1 AND user_id = $2', [id, req.user!.id]);
      else await tx.query(
        `INSERT INTO review_votes (review_id, user_id, vote) VALUES ($1,$2,$3) ON CONFLICT (review_id, user_id) DO UPDATE SET vote = EXCLUDED.vote`,
        [id, req.user!.id, next]
      );
      const { rows } = await tx.query<ReviewRow>(
        `UPDATE reviews SET helpful_count = GREATEST(0, helpful_count + $2), unhelpful_count = GREATEST(0, unhelpful_count + $3)
         WHERE id = $1 RETURNING *`,
        [id, (next === 1 ? 1 : 0) - (before === 1 ? 1 : 0), (next === -1 ? 1 : 0) - (before === -1 ? 1 : 0)]
      );
      return { ...rows[0], my_vote: next || null };
    });
    res.json({ review: toReview(out) });
  }));

  r.delete('/reviews/:id', requireAuth, ah(async (req, res) => {
    const id = parse(z.string().uuid(), req.params.id);
    await withTx(db, async (tx) => {
      const { rows } = await tx.query<{ user_id: string | null; product_id: string }>('SELECT user_id, product_id FROM reviews WHERE id = $1 FOR UPDATE', [id]);
      if (!rows[0]) throw notFound('Review not found.');
      const staff = req.user!.role !== 'Customer';
      if (!staff && rows[0].user_id !== req.user!.id) throw new HttpError(403, 'You can only delete your own reviews.', 'forbidden');
      await tx.query('DELETE FROM reviews WHERE id = $1', [id]);
      await recomputeProductRatings(tx, rows[0].product_id);
    });
    res.json({ ok: true });
  }));

  return r;
}
