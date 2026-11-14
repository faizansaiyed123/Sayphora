import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { ah } from '../http';
import type { AppDeps } from '../types';
import type { Limiters } from '../middleware/rateLimit';
import { requireAuth } from '../middleware/auth';
import { hashPassword } from '../services/passwords';
import { cookieOptions, SESSION_COOKIE, USER_COLUMNS, rowToAuthUser } from '../middleware/auth';
import { toUser } from '../services/mappers';
import { dollarsToNextTier } from '../../shared/commerce';
import { deleteDemoUser, deleteExpiredDemoUsers } from '../services/demoSessions';

export function demoRouter(deps: AppDeps, limiters: Limiters): Router {
  const r = Router();
  const { db, config } = deps;

  r.post('/demo/session', limiters.demo, ah(async (req, res) => {
    await deleteExpiredDemoUsers(db);
    const userId = randomUUID();
    const expiresAt = new Date(Date.now() + config.DEMO_SESSION_TTL_MINUTES * 60_000);
    const email = `demo+${userId}@sayphora.local`;
    const passwordHash = await hashPassword(randomUUID(), config.PASSWORD_HASH_COST);
    const { rows } = await db.query(
      `INSERT INTO users (id, email, password_hash, name, role, tier, points, lifetime_spend_cents, skin_type, skin_tone, undertone, concerns, favorite_brands, is_demo, demo_expires_at)
       VALUES ($1,$2,$3,'Recruiter Guest','Customer','VIB',480,45000,'Combination','Light','Neutral',$4,$5,true,$6)
       RETURNING ${USER_COLUMNS}`
      , [userId, email, passwordHash, ['Hydration','Pore Smoothing','Radiance'], ['Tatcha','Rare Beauty by Selena Gomez','Fenty Beauty by Rihanna'], expiresAt]
    );
    const user = rowToAuthUser(rows[0]);
    const token = await deps.tokens.sign({ userId: user.id, tokenVersion: rows[0].token_version });
    res.cookie(SESSION_COOKIE, token, cookieOptions(deps));
    res.status(201).json({
      user: await buildUserResponse(db, user),
      expiresAt: expiresAt.toISOString()
    });
  }));

  r.delete('/demo/session', requireAuth, ah(async (req, res) => {
    if (!req.user?.isDemo) {
      res.clearCookie(SESSION_COOKIE, { ...cookieOptions(deps), maxAge: undefined });
      res.status(204).end();
      return;
    }
    await deleteDemoUser(db, req.user.id);
    res.clearCookie(SESSION_COOKIE, { ...cookieOptions(deps), maxAge: undefined });
    res.status(204).end();
  }));

  return r;
}

async function buildUserResponse(db: AppDeps['db'], user: import('../types').AuthUser) {
  const { rows } = await db.query<any>('SELECT * FROM addresses WHERE user_id = $1 ORDER BY created_at', [user.id]);
  return toUser(user, rows, dollarsToNextTier(user.lifetimeSpendCents));
}
