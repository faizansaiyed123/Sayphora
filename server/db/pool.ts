import pg from 'pg';
import type { Config } from '../config';

// Return COUNT(*)/SUM() (int8) as JS numbers; all values here stay far below 2^53.
pg.types.setTypeParser(pg.types.builtins.INT8, (v) => Number(v));
pg.types.setTypeParser(pg.types.builtins.NUMERIC, (v) => Number(v));
// Keep DATE columns as plain 'YYYY-MM-DD' strings (no timezone shifting).
pg.types.setTypeParser(pg.types.builtins.DATE, (v) => v);

export type Db = pg.Pool;
export type Tx = pg.PoolClient;
export type Queryable = Pick<pg.Pool, 'query'>;

export function createPool(config: Pick<Config, 'DATABASE_URL' | 'DATABASE_POOL_MAX' | 'DATABASE_SSL'>): Db {
  return new pg.Pool({
    connectionString: config.DATABASE_URL,
    max: config.DATABASE_POOL_MAX,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    statement_timeout: 15_000,
    ssl: config.DATABASE_SSL ? { rejectUnauthorized: false } : undefined,
    application_name: 'sayphora'
  });
}

const RETRYABLE = new Set(['40001', '40P01']); // serialization_failure, deadlock_detected

/**
 * Runs `fn` inside a transaction. Commits on success, rolls back on error, and
 * transparently retries on serialization failures / deadlocks.
 */
export async function withTx<T>(db: Db, fn: (tx: Tx) => Promise<T>, attempts = 3): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch {
        /* connection is already broken; release below discards it */
      }
      const code = (err as { code?: string }).code;
      if (code && RETRYABLE.has(code) && attempt < attempts) continue;
      throw err;
    } finally {
      client.release();
    }
  }
}
