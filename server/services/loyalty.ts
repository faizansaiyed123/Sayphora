import type { Tx } from '../db/pool';
import { conflict, notFound } from '../http';
import { tierForSpend, dollarsToNextTier } from '../../shared/commerce';
import { generateRewardCode } from './promos';

/** Adjusts the points balance and lifetime spend, then re-derives the tier. */
export async function adjustLoyalty(tx: Tx, userId: string, deltaPoints: number, deltaSpendCents: number): Promise<void> {
  const { rows } = await tx.query<{ lifetime_spend_cents: number }>(
    `UPDATE users SET points = GREATEST(0, points + $2), lifetime_spend_cents = GREATEST(0, lifetime_spend_cents + $3)
     WHERE id = $1 RETURNING lifetime_spend_cents`,
    [userId, deltaPoints, deltaSpendCents]
  );
  if (!rows[0]) return;
  await tx.query('UPDATE users SET tier = $2 WHERE id = $1 AND tier <> $2', [userId, tierForSpend(rows[0].lifetime_spend_cents)]);
}

export { dollarsToNextTier };

export interface RewardRow { id: string; title: string; description: string; cost_points: number; value_cents: number }

/** Spends points and issues a single-use credit code owned by the member. */
export async function redeemReward(tx: Tx, userId: string, rewardId: string) {
  const { rows: rewards } = await tx.query<RewardRow>('SELECT * FROM rewards WHERE id = $1 AND is_active', [rewardId]);
  const reward = rewards[0];
  if (!reward) throw notFound('That reward is not available.');

  const { rows: users } = await tx.query<{ points: number }>('SELECT points FROM users WHERE id = $1 FOR UPDATE', [userId]);
  if (!users[0] || users[0].points < reward.cost_points) {
    throw conflict(`You need ${reward.cost_points} points to redeem this reward.`, { required: reward.cost_points, available: users[0]?.points ?? 0 });
  }
  await tx.query('UPDATE users SET points = points - $2 WHERE id = $1', [userId, reward.cost_points]);

  const code = generateRewardCode();
  await tx.query(
    `INSERT INTO promo_codes (code, description, discount_amount_cents, max_uses, owner_user_id, expires_at)
     VALUES ($1, $2, $3, 1, $4, now() + interval '180 days')`,
    [code, `${reward.title} reward credit`, reward.value_cents, userId]
  );
  await tx.query(
    'INSERT INTO reward_redemptions (user_id, reward_id, promo_code, points_spent) VALUES ($1,$2,$3,$4)',
    [userId, reward.id, code, reward.cost_points]
  );
  return { code, reward, remainingPoints: users[0].points - reward.cost_points };
}
