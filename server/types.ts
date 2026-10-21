import type { Config } from './config';
import type { Db } from './db/pool';
import type { Logger } from './logger';
import type { TokenService } from './services/tokens';
import type { Mailer } from './services/email';
import type { AiClient } from './services/ai';
import type { Tier } from '../shared/commerce';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'Customer' | 'Staff' | 'Admin';
  tier: Tier;
  points: number;
  lifetimeSpendCents: number;
  phone: string | null;
  skinType: string;
  skinTone: string;
  undertone: string;
  concerns: string[];
  favoriteBrands: string[];
  tokenVersion: number;
}

export interface AppDeps {
  config: Config;
  db: Db;
  logger: Logger;
  tokens: TokenService;
  mailer: Mailer;
  ai: AiClient | null;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
