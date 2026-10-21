import { loadConfig } from './config';
import { createLogger } from './logger';
import { createPool } from './db/pool';
import { migrate } from './db/migrate';
import { createTokenService } from './services/tokens';
import { createMailer } from './services/email';
import { createAiClient } from './services/ai';
import { createApp } from './app';
import { mountFrontend } from './frontend';

async function main() {
  const config = loadConfig();
  const logger = createLogger(config);
  const db = createPool(config);

  if (config.RUN_MIGRATIONS_ON_START) {
    const result = await migrate(db);
    logger.info({ applied: result.applied }, 'database migrations complete');
  }
  if (config.RATE_LIMIT_DISABLED && config.isProd) logger.warn('RATE_LIMIT_DISABLED=true in production: this is unsafe');

  const deps = {
    config, db, logger,
    tokens: createTokenService(config.JWT_SECRET, config.SESSION_TTL_DAYS),
    mailer: createMailer(config, logger),
    ai: createAiClient(config)
  };
  const app = createApp(deps);
  await mountFrontend(app, config);

  const server = app.listen(config.PORT, '0.0.0.0', () => {
    logger.info({ port: config.PORT, env: config.NODE_ENV, ai: Boolean(deps.ai), smtp: Boolean(config.SMTP_HOST) }, 'Sayphora server listening');
  });

  let closing = false;
  const shutdown = (signal: string) => {
    if (closing) return;
    closing = true;
    logger.info({ signal }, 'shutting down');
    const force = setTimeout(() => process.exit(1), 10_000);
    force.unref();
    server.close(async () => {
      await db.end().catch(() => undefined);
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
