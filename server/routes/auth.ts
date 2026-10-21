import { Router } from 'express';
import { z } from 'zod';
import type { AppDeps, AuthUser } from '../types';
import { ah, parse, conflict, notFound, HttpError, badRequest } from '../http';
import { requireAuth, SESSION_COOKIE, cookieOptions, USER_COLUMNS, rowToAuthUser } from '../middleware/auth';
import type { Limiters } from '../middleware/rateLimit';
import { generateResetToken, hashPassword, sha256, verifyAgainstDummy, verifyPassword } from '../services/passwords';
import { passwordResetEmail, sendSafe } from '../services/email';
import { toUser, toAddress, type AddressRow } from '../services/mappers';
import { dollarsToNextTier, WELCOME_POINTS } from '../../shared/commerce';
import { withTx } from '../db/pool';
import { loadOrderBundles } from '../services/orders';
import { redeemReward } from '../services/loyalty';

const password = z.string().min(10, 'Use at least 10 characters.').max(128, 'Password is too long.');
const email = z.string().trim().toLowerCase().email('Enter a valid email address.').max(254);

const registerSchema = z.object({ name: z.string().trim().min(1, 'Name is required.').max(120), email, password });
const loginSchema = z.object({ email, password: z.string().min(1).max(128) });
const profileSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  beautyProfile: z.object({
    skinType: z.string().max(40).optional(),
    skinTone: z.string().max(40).optional(),
    undertone: z.string().max(40).optional(),
    concerns: z.array(z.string().max(60)).max(12).optional(),
    favoriteBrands: z.array(z.string().max(80)).max(20).optional()
  }).optional()
});
const addressSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  street: z.string().trim().min(1).max(200),
  apt: z.string().trim().max(100).optional(),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().max(100).default(''),
  zipCode: z.string().trim().min(2).max(20),
  country: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(40).default('')
});

export function authRouter(deps: AppDeps, limiters: Limiters): Router {
  const r = Router();
  const { db, config } = deps;

  async function userDto(u: AuthUser) {
    const { rows } = await db.query<AddressRow>('SELECT * FROM addresses WHERE user_id = $1 ORDER BY created_at', [u.id]);
    return toUser(u, rows, dollarsToNextTier(u.lifetimeSpendCents));
  }
  async function startSession(res: import('express').Response, u: { id: string; token_version: number }) {
    const token = await deps.tokens.sign({ userId: u.id, tokenVersion: u.token_version });
    res.cookie(SESSION_COOKIE, token, cookieOptions(deps));
  }

  r.post('/auth/register', limiters.auth, ah(async (req, res) => {
    const body = parse(registerSchema, req.body);
    const hash = await hashPassword(body.password, config.PASSWORD_HASH_COST);
    const { rows } = await db.query(
      `INSERT INTO users (email, password_hash, name, points) VALUES ($1,$2,$3,$4)
       ON CONFLICT (lower(email)) DO NOTHING RETURNING ${USER_COLUMNS}`,
      [body.email, hash, body.name, WELCOME_POINTS]
    );
    if (!rows[0]) throw conflict('An account with that email already exists. Try signing in.');
    await startSession(res, rows[0]);
    res.status(201).json({ user: await userDto(rowToAuthUser(rows[0])) });
  }));

  r.post('/auth/login', limiters.auth, limiters.login, ah(async (req, res) => {
    const body = parse(loginSchema, req.body);
    const { rows } = await db.query<{ password_hash: string } & Record<string, any>>(
      `SELECT ${USER_COLUMNS}, password_hash FROM users WHERE lower(email) = $1`, [body.email]
    );
    const row = rows[0];
    if (!row) {
      await verifyAgainstDummy(body.password, config.PASSWORD_HASH_COST);
      throw new HttpError(401, 'Incorrect email or password.', 'invalid_credentials');
    }
    if (!(await verifyPassword(body.password, row.password_hash))) {
      throw new HttpError(401, 'Incorrect email or password.', 'invalid_credentials');
    }
    await db.query('UPDATE users SET last_login_at = now() WHERE id = $1', [row.id]);
    await startSession(res, row as any);
    res.json({ user: await userDto(rowToAuthUser(row as any)) });
  }));

  r.post('/auth/logout', (_req, res) => {
    res.clearCookie(SESSION_COOKIE, { ...cookieOptions(deps), maxAge: undefined });
    res.json({ ok: true });
  });

  r.get('/auth/me', ah(async (req, res) => {
    res.json({ user: req.user ? await userDto(req.user) : null });
  }));

  r.post('/auth/forgot-password', limiters.auth, ah(async (req, res) => {
    const { email: addr } = parse(z.object({ email }), req.body);
    const { rows } = await db.query<{ id: string; name: string; email: string }>('SELECT id, name, email FROM users WHERE lower(email) = $1', [addr]);
    if (rows[0]) {
      const { token, hash } = generateResetToken();
      await db.query(`INSERT INTO password_resets (token_hash, user_id, expires_at) VALUES ($1,$2, now() + interval '1 hour')`, [hash, rows[0].id]);
      const base = config.APP_URL ?? `${req.protocol}://${req.get('host')}`;
      sendSafe(deps.mailer, deps.logger, { to: rows[0].email, ...passwordResetEmail({ name: rows[0].name, resetUrl: `${base}/?reset=${token}` }) });
    }
    // Same response either way: no account enumeration.
    res.json({ ok: true, message: 'If an account exists for that email, a reset link is on its way.' });
  }));

  r.post('/auth/reset-password', limiters.auth, ah(async (req, res) => {
    const body = parse(z.object({ token: z.string().min(20).max(200), password }), req.body);
    await withTx(db, async (tx) => {
      const { rows } = await tx.query<{ user_id: string }>(
        `UPDATE password_resets SET used_at = now() WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now() RETURNING user_id`,
        [sha256(body.token)]
      );
      if (!rows[0]) throw badRequest('This reset link is invalid or has expired.');
      const hash = await hashPassword(body.password, config.PASSWORD_HASH_COST);
      // bumping token_version signs out every existing session
      await tx.query('UPDATE users SET password_hash = $2, token_version = token_version + 1 WHERE id = $1', [rows[0].user_id, hash]);
      await tx.query('UPDATE password_resets SET used_at = now() WHERE user_id = $1 AND used_at IS NULL', [rows[0].user_id]);
    });
    res.clearCookie(SESSION_COOKIE, { ...cookieOptions(deps), maxAge: undefined });
    res.json({ ok: true });
  }));

  // ------------------------------------------------------------- account ----
  r.use('/me', requireAuth);

  r.patch('/me', limiters.write, ah(async (req, res) => {
    const body = parse(profileSchema, req.body);
    const bp = body.beautyProfile ?? {};
    const { rows } = await db.query(
      `UPDATE users SET name = COALESCE($2, name), phone = CASE WHEN $3::boolean THEN $4 ELSE phone END,
         skin_type = COALESCE($5, skin_type), skin_tone = COALESCE($6, skin_tone), undertone = COALESCE($7, undertone),
         concerns = COALESCE($8, concerns), favorite_brands = COALESCE($9, favorite_brands)
       WHERE id = $1 RETURNING ${USER_COLUMNS}`,
      [req.user!.id, body.name ?? null, body.phone !== undefined, body.phone ?? null, bp.skinType ?? null, bp.skinTone ?? null,
       bp.undertone ?? null, bp.concerns ?? null, bp.favoriteBrands ?? null]
    );
    res.json({ user: await userDto(rowToAuthUser(rows[0])) });
  }));

  r.post('/me/password', limiters.auth, ah(async (req, res) => {
    const body = parse(z.object({ currentPassword: z.string().min(1).max(128), newPassword: password }), req.body);
    const { rows } = await db.query<{ password_hash: string }>('SELECT password_hash FROM users WHERE id = $1', [req.user!.id]);
    if (!(await verifyPassword(body.currentPassword, rows[0].password_hash))) throw new HttpError(403, 'Your current password is incorrect.', 'invalid_credentials');
    const hash = await hashPassword(body.newPassword, config.PASSWORD_HASH_COST);
    const { rows: [u] } = await db.query<{ id: string; token_version: number }>(
      'UPDATE users SET password_hash = $2, token_version = token_version + 1 WHERE id = $1 RETURNING id, token_version', [req.user!.id, hash]
    );
    await startSession(res, u); // keep this device signed in, drop all others
    res.json({ ok: true });
  }));

  r.get('/me/addresses', ah(async (req, res) => {
    const { rows } = await db.query<AddressRow>('SELECT * FROM addresses WHERE user_id = $1 ORDER BY created_at', [req.user!.id]);
    res.json({ addresses: rows.map(toAddress) });
  }));
  r.post('/me/addresses', limiters.write, ah(async (req, res) => {
    const a = parse(addressSchema, req.body);
    const { rows: [{ n }] } = await db.query<{ n: number }>('SELECT count(*) AS n FROM addresses WHERE user_id = $1', [req.user!.id]);
    if (n >= 10) throw conflict('You can save up to 10 addresses.');
    const { rows } = await db.query<AddressRow>(
      `INSERT INTO addresses (user_id, full_name, street, apt, city, state, zip_code, country, phone) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [req.user!.id, a.fullName, a.street, a.apt || null, a.city, a.state, a.zipCode, a.country, a.phone]
    );
    res.status(201).json({ address: toAddress(rows[0]) });
  }));
  r.delete('/me/addresses/:id', ah(async (req, res) => {
    const id = parse(z.string().uuid(), req.params.id);
    const r2 = await db.query('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [id, req.user!.id]);
    if (!r2.rowCount) throw notFound('Address not found.');
    res.json({ ok: true });
  }));

  r.get('/me/wishlist', ah(async (req, res) => {
    const { rows } = await db.query<{ product_id: string }>('SELECT product_id FROM wishlist_items WHERE user_id = $1 ORDER BY created_at', [req.user!.id]);
    res.json({ productIds: rows.map((x) => x.product_id) });
  }));
  r.put('/me/wishlist/:productId', limiters.write, ah(async (req, res) => {
    const r2 = await db.query(
      `INSERT INTO wishlist_items (user_id, product_id) SELECT $1, id FROM products WHERE id = $2 AND status = 'Active' ON CONFLICT DO NOTHING`,
      [req.user!.id, req.params.productId]
    );
    if (!r2.rowCount) {
      const exists = await db.query("SELECT 1 FROM products WHERE id = $1 AND status = 'Active'", [req.params.productId]);
      if (!exists.rowCount) throw notFound('Product not found.');
    }
    res.json({ ok: true });
  }));
  r.delete('/me/wishlist/:productId', ah(async (req, res) => {
    await db.query('DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2', [req.user!.id, req.params.productId]);
    res.json({ ok: true });
  }));
  /** Called after sign-in to fold a guest's local wishlist into their account. */
  r.post('/me/wishlist/merge', limiters.write, ah(async (req, res) => {
    const { productIds } = parse(z.object({ productIds: z.array(z.string().max(120)).max(100) }), req.body);
    if (productIds.length) {
      await db.query(
        `INSERT INTO wishlist_items (user_id, product_id) SELECT $1, id FROM products WHERE id = ANY($2) AND status = 'Active' ON CONFLICT DO NOTHING`,
        [req.user!.id, productIds]
      );
    }
    const { rows } = await db.query<{ product_id: string }>('SELECT product_id FROM wishlist_items WHERE user_id = $1 ORDER BY created_at', [req.user!.id]);
    res.json({ productIds: rows.map((x) => x.product_id) });
  }));

  r.get('/me/orders', ah(async (req, res) => {
    res.json({ orders: await loadOrderBundles(db, 'WHERE user_id = $1', [req.user!.id]) });
  }));

  r.get('/me/rewards', ah(async (req, res) => {
    const { rows: catalog } = await db.query('SELECT id, title, description, cost_points AS "costPoints", value_cents / 100.0 AS value FROM rewards WHERE is_active ORDER BY cost_points');
    const { rows: redemptions } = await db.query(
      `SELECT rr.id, rr.promo_code AS code, rr.points_spent AS "pointsSpent", rr.created_at AS "createdAt", rw.title,
              (pc.usage_count >= 1) AS used, pc.expires_at AS "expiresAt"
       FROM reward_redemptions rr JOIN rewards rw ON rw.id = rr.reward_id JOIN promo_codes pc ON pc.code = rr.promo_code
       WHERE rr.user_id = $1 ORDER BY rr.created_at DESC LIMIT 50`, [req.user!.id]
    );
    res.json({ rewards: catalog, redemptions });
  }));
  r.post('/me/rewards/:id/redeem', limiters.write, ah(async (req, res) => {
    const result = await withTx(db, (tx) => redeemReward(tx, req.user!.id, req.params.id));
    res.status(201).json({ code: result.code, title: result.reward.title, value: result.reward.value_cents / 100, remainingPoints: result.remainingPoints });
  }));

  return r;
}
