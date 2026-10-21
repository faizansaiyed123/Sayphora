import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Db } from './pool';

const MIGRATION_LOCK_ID = 7_265_104_001; // arbitrary, app-specific advisory lock key

export function resolveMigrationsDir(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.join(here, 'migrations'), // dist-server/migrations (built) or server/db/migrations (tsx)
    path.join(here, 'db', 'migrations'),
    path.resolve(process.cwd(), 'server/db/migrations'),
    path.resolve(process.cwd(), 'dist-server/migrations')
  ];
  const found = candidates.find((c) => fs.existsSync(c));
  if (!found) throw new Error(`Migrations directory not found. Looked in: ${candidates.join(', ')}`);
  return found;
}

export interface MigrationResult {
  applied: string[];
  skipped: string[];
}

/**
 * Applies pending `NNN_name.sql` files in order, each inside its own transaction.
 * An advisory lock makes concurrent starts (multiple replicas) safe.
 */
export async function migrate(db: Db, dir = resolveMigrationsDir()): Promise<MigrationResult> {
  const files = fs
    .readdirSync(dir)
    .filter((f) => /^\d+_.+\.sql$/.test(f))
    .sort();

  const client = await db.connect();
  const result: MigrationResult = { applied: [], skipped: [] };
  try {
    await client.query('SELECT pg_advisory_lock($1)', [MIGRATION_LOCK_ID]);
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version    TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);
    const { rows } = await client.query<{ version: string }>('SELECT version FROM schema_migrations');
    const done = new Set(rows.map((r) => r.version));

    for (const file of files) {
      const version = file.replace(/\.sql$/, '');
      if (done.has(version)) {
        result.skipped.push(version);
        continue;
      }
      const sql = fs.readFileSync(path.join(dir, file), 'utf8');
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [version]);
        await client.query('COMMIT');
        result.applied.push(version);
      } catch (err) {
        await client.query('ROLLBACK');
        throw new Error(`Migration ${version} failed: ${(err as Error).message}`);
      }
    }
  } finally {
    try {
      await client.query('SELECT pg_advisory_unlock($1)', [MIGRATION_LOCK_ID]);
    } finally {
      client.release();
    }
  }
  return result;
}

export async function migrationStatus(db: Db): Promise<{ applied: string[]; pending: string[] }> {
  const dir = resolveMigrationsDir();
  const files = fs
    .readdirSync(dir)
    .filter((f) => /^\d+_.+\.sql$/.test(f))
    .map((f) => f.replace(/\.sql$/, ''))
    .sort();
  let applied: string[] = [];
  try {
    const { rows } = await db.query<{ version: string }>('SELECT version FROM schema_migrations ORDER BY version');
    applied = rows.map((r) => r.version);
  } catch {
    applied = [];
  }
  return { applied, pending: files.filter((f) => !applied.includes(f)) };
}
