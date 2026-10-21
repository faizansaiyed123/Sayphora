import { describe, it, expect, afterAll } from 'vitest';
import pg from 'pg';
import { migrate, migrationStatus } from '../../server/db/migrate';
import { TEST_DB_URL } from '../helpers';
import { seedCatalog, seedDemo } from '../../server/db/seed';

const pool = new pg.Pool({ connectionString: TEST_DB_URL });
afterAll(async () => { await pool.end(); });

describe('migrations', () => {
  it('applies from an empty schema, then is a no-op', async () => {
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    const first = await migrate(pool);
    expect(first.applied.length).toBeGreaterThan(0);
    const second = await migrate(pool);
    expect(second.applied).toEqual([]);
    expect((await migrationStatus(pool)).pending).toEqual([]);
  });

  it('is safe when several instances start at once (advisory lock)', async () => {
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    const results = await Promise.all([migrate(pool), migrate(pool), migrate(pool)]);
    expect(results.filter((r) => r.applied.length > 0)).toHaveLength(1);
  });

  it('enforces data integrity with constraints', async () => {
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    await migrate(pool);
    await seedCatalog(pool as any);
    await expect(pool.query("UPDATE products SET stock = -1 WHERE id = 'tatcha-water-cream'")).rejects.toThrow(/check/);
    await expect(pool.query("UPDATE products SET price_cents = 0 WHERE id = 'tatcha-water-cream'")).rejects.toThrow(/check/);
    await pool.query("INSERT INTO users (email, password_hash, name) VALUES ('A@x.com','h','A')");
    await expect(pool.query("INSERT INTO users (email, password_hash, name) VALUES ('a@X.com','h','B')")).rejects.toThrow(/unique/);
    await expect(pool.query("INSERT INTO promo_codes (code, description) VALUES ('EMPTY','grants nothing')")).rejects.toThrow(/check/);
    await expect(pool.query("INSERT INTO promo_codes (code, description, discount_percent) VALUES ('lower','x',10)")).rejects.toThrow(/check/);
  });

  it('seeding is idempotent and demo data is opt-in', async () => {
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    await migrate(pool);
    await seedCatalog(pool as any); await seedCatalog(pool as any);
    const count = async (t: string) => (await pool.query(`SELECT count(*)::int n FROM ${t}`)).rows[0].n;
    expect(await count('products')).toBe(12);
    expect(await count('promo_codes')).toBe(0); // no public promo codes in a production seed
    expect(await count('reviews')).toBe(0); // no fabricated reviews in a production seed
    await seedDemo(pool as any, 10); await seedDemo(pool as any, 10);
    expect(await count('promo_codes')).toBe(4);
    expect(await count('reviews')).toBe(7);
    expect(await count('users')).toBe(1);
    const p = (await pool.query("SELECT review_count, rating FROM products WHERE id = 'fenty-pro-filtr-foundation'")).rows[0];
    expect(p.review_count).toBe(3);
    expect(p.rating).toBe(4.67);
  });
});
