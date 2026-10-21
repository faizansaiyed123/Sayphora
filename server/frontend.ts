import express, { type Express } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import type { Config } from './config';

/** Production: serve the built SPA with sensible cache headers. Development: Vite middleware with HMR. */
export async function mountFrontend(app: Express, config: Config): Promise<void> {
  if (!config.isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
    return;
  }
  const dist = path.resolve(process.cwd(), 'dist');
  if (!fs.existsSync(path.join(dist, 'index.html'))) {
    throw new Error(`Frontend build not found at ${dist}. Run "npm run build" first.`);
  }
  app.use(express.static(dist, {
    index: false,
    setHeaders(res, file) {
      if (/[\\/]assets[\\/]/.test(file)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // content-hashed
      else if (/(sw\.js|workbox-.*\.js|registerSW\.js|index\.html|manifest\.webmanifest)$/.test(file)) res.setHeader('Cache-Control', 'no-cache');
      else res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || path.extname(req.path)) return next();
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(dist, 'index.html'));
  });
}
