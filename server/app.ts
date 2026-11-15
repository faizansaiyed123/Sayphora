import express, { type Express } from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { randomUUID } from 'node:crypto';
import type { AppDeps } from './types';
import { applySecurity, originCheck } from './middleware/security';
import { sessionMiddleware } from './middleware/auth';
import { createLimiters } from './middleware/rateLimit';
import { errorHandler, notFoundHandler } from './middleware/errors';
import { authRouter } from './routes/auth';
import { catalogRouter } from './routes/catalog';
import { ordersRouter } from './routes/orders';
import { reviewsRouter } from './routes/reviews';
import { adminRouter } from './routes/admin';
import { aiRouter } from './routes/ai';

function trustProxy(v: string): boolean | number | string {
  if (v === 'true') return true;
  if (v === 'false' || v === '0') return false;
  return /^\d+$/.test(v) ? Number(v) : v;
}

/** Builds the API application. Frontend serving is attached separately (see server/index.ts). */
export function createApp(deps: AppDeps): Express {
  const { config, db, logger } = deps;
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', trustProxy(config.TRUST_PROXY));

  app.use(pinoHttp({
    logger,
    genReqId: (req) => (req.headers['x-request-id'] as string) || randomUUID(),
    autoLogging: { ignore: (req) => req.url === '/health' },
    customLogLevel: (_req, res, err) => (err || res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info')
  }));
  applySecurity(app, config);
  app.use(compression());
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  // Liveness + readiness in one: 200 only when the database answers.
  app.get('/health', async (_req, res) => {
    try {
      await db.query('SELECT 1');
      res.json({ status: 'healthy', app: 'sayphora', uptime: Math.round(process.uptime()), timestamp: new Date().toISOString(), database: 'up' });
    } catch (err) {
      logger.error({ err }, 'health check: database unreachable');
      res.status(503).json({ status: 'unhealthy', database: 'down' });
    }
  });

  const limiters = createLimiters(config);
  app.use('/api', limiters.api, originCheck(config), sessionMiddleware(deps));
  // API responses can be user-specific and must never be stored by shared caches.
  app.use('/api', (_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  app.use('/api', authRouter(deps, limiters), catalogRouter(deps, limiters), ordersRouter(deps, limiters),
    reviewsRouter(deps, limiters), adminRouter(deps, limiters), aiRouter(deps, limiters));
  app.use('/api', notFoundHandler);
  app.use(errorHandler(logger));
  return app;
}
