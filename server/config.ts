import 'dotenv/config';
import { z } from 'zod';

const bool = (fallback: boolean) =>
  z
    .enum(['true', 'false', '1', '0'])
    .optional()
    .transform((v) => (v === undefined ? fallback : v === 'true' || v === '1'));

const emptyToUndefined = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v);
const optionalString = z.preprocess(emptyToUndefined, z.string().optional());

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  APP_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(200).default(10),
  DATABASE_SSL: bool(false),
  RUN_MIGRATIONS_ON_START: bool(false),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  SESSION_TTL_DAYS: z.coerce.number().int().min(1).max(90).default(7),
  COOKIE_SECURE: bool(false).optional(),
  TRUST_PROXY: z.string().default('0'),
  PASSWORD_HASH_COST: z.coerce.number().int().min(10).max(18).default(15),
  RATE_LIMIT_DISABLED: bool(false),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),

  GEMINI_API_KEY: optionalString,
  GEMINI_MODEL: z.string().default('gemini-3.8-flash'),

  SMTP_HOST: optionalString,
  SMTP_PORT: z.coerce.number().int().default(587),
  SMTP_USER: optionalString,
  SMTP_PASS: optionalString,
  SMTP_SECURE: bool(false),
  MAIL_FROM: z.string().default('Sayphora <no-reply@sayphora.local>'),

  TAX_RATE: z.coerce.number().min(0).max(0.5).default(0.08875),

  // Only offline payment ('manual' = pay on delivery) is implemented; see README "Known limitations".
  PAYMENT_PROVIDER: z.enum(['manual']).default('manual'),
  PAYMENT_HOLD_MINUTES: z.coerce.number().int().min(5).max(1440).default(30),

  ADMIN_EMAIL: optionalString,
  ADMIN_PASSWORD: optionalString,
  SEED_DEMO: bool(false)
});

export type Config = Omit<z.infer<typeof envSchema>, 'COOKIE_SECURE'> & {
  COOKIE_SECURE: boolean;
  isProd: boolean;
  isTest: boolean;
};

const PLACEHOLDER_SECRETS = ['change-me', 'changeme', 'replace-me', 'your-secret', 'your_secret', 'generate-a'];

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.') || 'env'}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}\nSee .env.example for the full list.`);
  }
  const raw = parsed.data;
  const isProd = raw.NODE_ENV === 'production';

  if (isProd) {
    if (PLACEHOLDER_SECRETS.some((p) => raw.JWT_SECRET.toLowerCase().includes(p))) {
      throw new Error('JWT_SECRET looks like a placeholder. Generate one with: openssl rand -base64 48');
    }
  }

  return {
    ...raw,
    COOKIE_SECURE: raw.COOKIE_SECURE ?? isProd,
    isProd,
    isTest: raw.NODE_ENV === 'test'
  };
}

/** Minimal config for CLI tasks (migrate/seed) that only need the database. */
export function loadDbConfig(env: NodeJS.ProcessEnv = process.env) {
  const parsed = envSchema
    .pick({ DATABASE_URL: true, DATABASE_POOL_MAX: true, DATABASE_SSL: true, ADMIN_EMAIL: true, ADMIN_PASSWORD: true, SEED_DEMO: true, PASSWORD_HASH_COST: true })
    .safeParse(env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}
