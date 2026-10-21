import type { CookieOptions, NextFunction, Request, RequestHandler, Response } from 'express';
import type { AppDeps, AuthUser } from '../types';
import { forbidden, unauthorized } from '../http';

export const SESSION_COOKIE = 'sayphora_session';

export function cookieOptions(deps: Pick<AppDeps, 'config'>): CookieOptions {
  return {
    httpOnly: true,
    secure: deps.config.COOKIE_SECURE,
    sameSite: 'lax',
    path: '/',
    maxAge: deps.config.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000
  };
}

interface UserRow {
  id: string; email: string; name: string; role: AuthUser['role']; tier: AuthUser['tier']; points: number;
  lifetime_spend_cents: number; phone: string | null; skin_type: string; skin_tone: string; undertone: string;
  concerns: string[]; favorite_brands: string[]; token_version: number;
}

export const USER_COLUMNS = `id, email, name, role, tier, points, lifetime_spend_cents, phone, skin_type, skin_tone,
  undertone, concerns, favorite_brands, token_version`;

export function rowToAuthUser(r: UserRow): AuthUser {
  return {
    id: r.id, email: r.email, name: r.name, role: r.role, tier: r.tier, points: r.points,
    lifetimeSpendCents: r.lifetime_spend_cents, phone: r.phone, skinType: r.skin_type, skinTone: r.skin_tone,
    undertone: r.undertone, concerns: r.concerns, favoriteBrands: r.favorite_brands, tokenVersion: r.token_version
  };
}

/** Resolves the session cookie (if any) to `req.user`. Never rejects; use requireAuth for that. */
export function sessionMiddleware(deps: AppDeps): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.[SESSION_COOKIE];
      if (token) {
        const claims = await deps.tokens.verify(token);
        if (claims) {
          const { rows } = await deps.db.query<UserRow>(`SELECT ${USER_COLUMNS} FROM users WHERE id = $1`, [claims.userId]);
          const row = rows[0];
          // token_version lets us invalidate every session on password change/reset
          if (row && row.token_version === claims.tokenVersion) req.user = rowToAuthUser(row);
        }
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

export const requireAuth: RequestHandler = (req, _res, next) => (req.user ? next() : next(unauthorized()));

export const requireRole =
  (...roles: AuthUser['role'][]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) return next(unauthorized());
    if (!roles.includes(req.user.role)) return next(forbidden());
    next();
  };
