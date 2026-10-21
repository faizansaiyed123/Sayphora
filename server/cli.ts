import { loadDbConfig } from './config';
import { createPool } from './db/pool';
import { migrate, migrationStatus } from './db/migrate';
import { seedCatalog, seedDemo, createAdmin } from './db/seed';

async function main() {
  const [command, ...args] = process.argv.slice(2);
  const cfg = loadDbConfig();
  const db = createPool(cfg);
  try {
    switch (command) {
      case 'migrate': {
        const r = await migrate(db);
        console.log(r.applied.length ? `Applied: ${r.applied.join(', ')}` : 'Database is up to date.');
        break;
      }
      case 'status': {
        const s = await migrationStatus(db);
        console.log(`Applied: ${s.applied.join(', ') || '(none)'}\nPending: ${s.pending.join(', ') || '(none)'}`);
        break;
      }
      case 'seed': {
        await migrate(db);
        const { products } = await seedCatalog(db);
        console.log(`Starter catalogue ready (${products} products, samples, rewards, boutiques).`);
        if (cfg.SEED_DEMO) {
          await seedDemo(db, cfg.PASSWORD_HASH_COST);
          console.log('Demo data seeded (SEED_DEMO=true): demo customer, promo codes, sample reviews.');
        }
        if (cfg.ADMIN_EMAIL && cfg.ADMIN_PASSWORD) {
          const { created } = await createAdmin(db, { email: cfg.ADMIN_EMAIL, password: cfg.ADMIN_PASSWORD, hashCost: cfg.PASSWORD_HASH_COST });
          console.log(created ? `Admin ${cfg.ADMIN_EMAIL} created.` : `Admin ${cfg.ADMIN_EMAIL} already exists (unchanged).`);
        }
        break;
      }
      case 'create-admin': {
        const [email, password, ...nameParts] = args;
        if (!email || !password) throw new Error('Usage: create-admin <email> <password> [name]');
        if (password.length < 10) throw new Error('Password must be at least 10 characters.');
        await migrate(db);
        const { created } = await createAdmin(db, { email, password, name: nameParts.join(' ') || undefined, hashCost: cfg.PASSWORD_HASH_COST });
        console.log(created ? `Admin ${email} created.` : `A user with ${email} already exists (unchanged).`);
        break;
      }
      default:
        console.log('Usage: cli <migrate|status|seed|create-admin>');
        process.exitCode = command ? 1 : 0;
    }
  } finally {
    await db.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
