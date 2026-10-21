import pino from 'pino';
import type { Config } from './config';

export type Logger = pino.Logger;

export function createLogger(config: Pick<Config, 'LOG_LEVEL' | 'isProd'>): Logger {
  return pino({
    level: config.LOG_LEVEL,
    base: { app: 'sayphora' },
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'res.headers["set-cookie"]',
        '*.password',
        '*.passwordHash',
        '*.token'
      ],
      censor: '[redacted]'
    },
    ...(config.isProd
      ? {}
      : { transport: { target: 'pino-pretty', options: { colorize: true, singleLine: true } } })
  });
}
