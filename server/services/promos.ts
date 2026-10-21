import { randomBytes } from 'node:crypto';
import type { Tx } from '../db/pool';
import { HttpError, forbidden, notFound } from '../http';
import type { PromoRule, Tier } from '../../shared/commerce';
import { TIERS, toDollars } from '../../shared/commerce';

export interface PromoRow {
  code: string; description: string; discount_percent: number | null; discount_amount_cents: number | null;
  free_shipping: boolean; min_spend_cents: number; max_uses: number | null; usage_count: number;
  required_tier: Tier | null; owner_user_id: string | null; is_active: boolean; expires_at: Date | null; created_at: Date;
}

export const PROMO_COLUMNS = `code, description, discount_percent, discount_amount_cents, free_shipping, min_spend_cents,
  max_uses, usage_count, required_tier, owner_user_id, is_active, expires_at, created_at`;

export const normalizeCode = (raw: string): string => raw.trim().toUpperCase();

/** Throws an HttpError explaining exactly why a code cannot be used. */
export function assertPromoUsable(
  row: PromoRow | undefined,
  ctx: { userId?: string; tier?: Tier; subtotalCents?: number; now?: Date }
): PromoRow {
  const now = ctx.now ?? new Date();
  if (!row || !row.is_active) throw notFound('That promo code is invalid or inactive.');
  if (row.owner_user_id && row.owner_user_id !== ctx.userId) throw forbidden('That promo code is not valid for your account.');
  if (row.expires_at && row.expires_at <= now) throw new HttpError(410, 'That promo code has expired.', 'promo_expired');
  if (row.max_uses !== null && row.usage_count >= row.max_uses) throw new HttpError(410, 'That promo code has already been fully redeemed.', 'promo_exhausted');
  if (row.required_tier) {
    if (!ctx.tier || TIERS.indexOf(ctx.tier) < TIERS.indexOf(row.required_tier)) {
      throw forbidden(`That promo code is reserved for ${row.required_tier} members.`);
    }
  }
  if (ctx.subtotalCents !== undefined && ctx.subtotalCents < row.min_spend_cents) {
    throw new HttpError(422, `That promo code requires a minimum spend of $${toDollars(row.min_spend_cents).toFixed(2)}.`, 'promo_min_spend');
  }
  return row;
}

export const toPromoRule = (r: PromoRow): PromoRule => ({
  code: r.code,
  discountPercent: r.discount_percent,
  discountAmountCents: r.discount_amount_cents,
  freeShipping: r.free_shipping,
  minSpendCents: r.min_spend_cents
});

/** Public (storefront) representation. */
export const toPromoPublic = (r: PromoRow) => ({
  code: r.code,
  description: r.description,
  discountPercent: r.discount_percent ?? undefined,
  discountAmount: r.discount_amount_cents ? toDollars(r.discount_amount_cents) : undefined,
  freeShipping: r.free_shipping || undefined,
  minSpend: toDollars(r.min_spend_cents),
  requiredTier: r.required_tier ?? undefined
});

/** Admin representation (adds usage and activation state). */
export const toPromoAdmin = (r: PromoRow) => ({
  ...toPromoPublic(r),
  usageCount: r.usage_count,
  maxUses: r.max_uses ?? undefined,
  isActive: r.is_active,
  expiresAt: r.expires_at?.toISOString(),
  ownerUserId: r.owner_user_id ?? undefined
});

export async function lockPromo(tx: Tx, code: string): Promise<PromoRow | undefined> {
  const { rows } = await tx.query<PromoRow>(`SELECT ${PROMO_COLUMNS} FROM promo_codes WHERE code = $1 FOR UPDATE`, [code]);
  return rows[0];
}

export const generateRewardCode = (): string => `RWD-${randomBytes(5).toString('hex').toUpperCase()}`;
