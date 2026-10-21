import type { Express, RequestHandler } from 'express';
import helmet from 'helmet';
import type { Config } from '../config';
import { HttpError } from '../http';

export function applySecurity(app: Express, config: Config): void {
  const secureTransport = config.isProd && config.COOKIE_SECURE;

  app.use(
    helmet({
      // Vite's dev server injects inline scripts for HMR, so CSP only applies to production builds.
      contentSecurityPolicy: config.isProd
        ? {
            useDefaults: false,
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
              fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
              imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
              mediaSrc: ["'self'", 'blob:'],
              connectSrc: ["'self'"],
              workerSrc: ["'self'", 'blob:'],
              manifestSrc: ["'self'"],
              objectSrc: ["'none'"],
              baseUri: ["'self'"],
              formAction: ["'self'"],
              frameAncestors: ["'self'"],
              ...(secureTransport ? { upgradeInsecureRequests: [] } : {})
            }
          }
        : false,
      hsts: secureTransport ? { maxAge: 15_552_000, includeSubDomains: true } : false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'same-site' }
    })
  );

  // Camera is used by Virtual Try-On, geolocation by the boutique locator.
  app.use((_req, res, next) => {
    res.setHeader('Permissions-Policy', 'camera=(self), geolocation=(self), microphone=(), payment=()');
    next();
  });
}

/**
 * CSRF defence in depth on top of SameSite=Lax cookies: browsers always send Origin on
 * cross-site state-changing requests, so a mismatching Origin is rejected.
 */
export function originCheck(config: Config): RequestHandler {
  const allowed = new Set<string>();
  if (config.APP_URL) allowed.add(new URL(config.APP_URL).origin);
  return (req, _res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const origin = req.headers.origin;
    if (!origin) return next(); // non-browser clients (curl, server-to-server, webhooks)
    try {
      const o = new URL(origin);
      if (allowed.has(o.origin) || o.host === req.headers.host) return next();
    } catch {
      /* fallthrough */
    }
    next(new HttpError(403, 'Cross-origin request blocked.', 'csrf'));
  };
}
