import type { ErrorRequestHandler, RequestHandler } from 'express';
import type { Logger } from '../logger';
import { HttpError } from '../http';

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ error: { code: 'not_found', message: `Route not found: ${req.method} ${req.path}` } });
};

export const errorHandler =
  (logger: Logger): ErrorRequestHandler =>
  (err, req, res, _next) => {
    if (res.headersSent) return;

    if (err instanceof HttpError) {
      res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
      return;
    }
    // malformed JSON / payload too large from body-parser
    const status = (err as { status?: number }).status;
    if (status === 400 || status === 413) {
      res.status(status).json({
        error: { code: status === 413 ? 'payload_too_large' : 'bad_request', message: status === 413 ? 'Request body too large.' : 'Malformed request body.' }
      });
      return;
    }
    // PostgreSQL integrity violations that slipped past validation
    const code = (err as { code?: string }).code;
    if (code === '23505') {
      res.status(409).json({ error: { code: 'conflict', message: 'That record already exists.' } });
      return;
    }
    if (code === '23514' || code === '23503' || code === '22P02') {
      res.status(400).json({ error: { code: 'bad_request', message: 'The request contained invalid data.' } });
      return;
    }

    logger.error({ err, method: req.method, url: req.originalUrl }, 'unhandled error');
    res.status(500).json({ error: { code: 'internal_error', message: 'Something went wrong on our side. Please try again.' } });
  };
