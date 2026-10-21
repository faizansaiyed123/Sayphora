import request from 'supertest';
import type { Express } from 'express';
import pg from 'pg';
import { loadConfig, type Config } from '../server/config';
import { createPool, type Db } from '../server/db/pool';
import { createLogger } from '../server/logger';
import { createTokenService } from '../server/services/tokens';
import type { Mailer, MailMessage } from '../server/services/email';
import type { AiClient } from '../server/services/ai';
import { createApp } from '../server/app';
import { seedCatalog, createAdmin } from '../server/db/seed';
import { migrate } from '../server/db/migrate';

export const TEST_DB_URL = process.env.TEST_DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/sayphora_test';
export const PASSWORD = 'CorrectHorse!Battery9';

export interface TestCtx {
  app: Express;
  db: Db;
  config: Config;
  sent: MailMessage[];
  ai: { current: AiClient | null };
  close(): Promise<void>;
}

/** Rebuilds the test database from scratch with the real migrations (once per test file). */
async function ensureSchema(): Promise<void> {
  const pool = new pg.Pool({ connectionString: TEST_DB_URL });
  try {
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    await migrate(pool);
  } finally {
    await pool.end();
  }
}

export async function makeCtx(env: Record<string, string> = {}): Promise<TestCtx> {
  await ensureSchema();
  const config = loadConfig({
    NODE_ENV: 'test', DATABASE_URL: TEST_DB_URL, JWT_SECRET: 'test-secret-test-secret-test-secret-0123456789',
    PASSWORD_HASH_COST: '10', LOG_LEVEL: 'silent', RATE_LIMIT_DISABLED: 'true', ...env
  } as NodeJS.ProcessEnv);
  const db = createPool(config);
  const sent: MailMessage[] = [];
  const mailer: Mailer = { send: async (m) => { sent.push(m); } };
  const ai = { current: null as AiClient | null };
  // The AI client is read lazily so tests can swap it per case.
  const lazyAi: AiClient = {
    generateJson: (r) => { if (!ai.current) throw new Error('no ai'); return ai.current.generateJson(r); },
    searchMaps: (r) => { if (!ai.current) throw new Error('no ai'); return ai.current.searchMaps(r); }
  };
  const deps = { config, db, logger: createLogger(config), tokens: createTokenService(config.JWT_SECRET, config.SESSION_TTL_DAYS), mailer, ai: null as AiClient | null };
  const app = createApp({ ...deps, get ai() { return ai.current ? lazyAi : null; } } as typeof deps);
  return { app, db, config, sent, ai, close: () => db.end() };
}

export async function resetData(db: Db): Promise<void> {
  await db.query(`TRUNCATE users, products, samples, boutiques, promo_codes, rewards, newsletter_subscribers, ai_events RESTART IDENTITY CASCADE`);
  await db.query('ALTER SEQUENCE order_number_seq RESTART WITH 10001');
  await seedCatalog(db);
}

let counter = 0;
export const uniqueEmail = (p = 'user') => `${p}${Date.now()}${counter++}@example.com`;

export async function registerAgent(app: Express, opts: { email?: string; name?: string } = {}) {
  const agent = request.agent(app);
  const email = opts.email ?? uniqueEmail();
  const res = await agent.post('/api/auth/register').send({ name: opts.name ?? 'Sophia Laurent', email, password: PASSWORD });
  if (res.status !== 201) throw new Error(`register failed: ${res.status} ${JSON.stringify(res.body)}`);
  return { agent, email, user: res.body.user };
}

export async function adminAgent(ctx: TestCtx, role: 'Admin' | 'Staff' = 'Admin') {
  const email = uniqueEmail(role.toLowerCase());
  await createAdmin(ctx.db, { email, password: PASSWORD, hashCost: 10 });
  if (role === 'Staff') await ctx.db.query("UPDATE users SET role = 'Staff' WHERE email = $1", [email]);
  const agent = request.agent(ctx.app);
  const res = await agent.post('/api/auth/login').send({ email, password: PASSWORD });
  if (res.status !== 200) throw new Error(`admin login failed: ${JSON.stringify(res.body)}`);
  return agent;
}

export const address = {
  fullName: 'Sophia Laurent', street: '740 Park Avenue', apt: 'Suite 12B', city: 'New York', state: 'NY',
  zipCode: '10021', country: 'United States', phone: '(212) 555-0198'
};

export const orderBody = (items: Array<Record<string, unknown>>, extra: Record<string, unknown> = {}) => ({
  items, sampleIds: [], shippingAddress: address, shippingMethod: 'Standard', giftOption: { isGift: false }, ...extra
});

export async function rawPool(): Promise<pg.Pool> {
  return new pg.Pool({ connectionString: TEST_DB_URL });
}
