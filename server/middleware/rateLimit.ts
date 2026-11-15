import rateLimit, { ipKeyGenerator, type Options } from 'express-rate-limit';
import type { Request } from 'express';
import type { Config } from '../config';

export interface Limiters {
  api: ReturnType<typeof rateLimit>;
  auth: ReturnType<typeof rateLimit>;
  login: ReturnType<typeof rateLimit>;
  ai: ReturnType<typeof rateLimit>;
  write: ReturnType<typeof rateLimit>;
}

export function createLimiters(config: Pick<Config, 'RATE_LIMIT_DISABLED'>): Limiters {
  const make = (opts: Partial<Options>) =>
    rateLimit({
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      skip: () => config.RATE_LIMIT_DISABLED,
      message: { error: { code: 'rate_limited', message: 'Too many requests. Please slow down and try again shortly.' } },
      ...opts
    });

  const emailKey = (req: Request) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    return `${ipKeyGenerator(req.ip ?? '')}|${email}`;
  };

  return {
    api: make({ windowMs: 60_000, limit: 600 }),
    auth: make({ windowMs: 15 * 60_000, limit: 40 }),
    // brute-force protection: per (ip, email) pair
    login: make({ windowMs: 15 * 60_000, limit: 10, keyGenerator: emailKey, skipSuccessfulRequests: true }),
    ai: make({ windowMs: 60_000, limit: 20 }),
    write: make({ windowMs: 60_000, limit: 60 })
  };
}
