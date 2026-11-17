import { demoRequest, DemoApiError } from '../demo/demoApi';

export const DEMO_MODE =
  import.meta.env.VITE_DEMO_MODE === undefined ||
  import.meta.env.VITE_DEMO_MODE !== 'false';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code: string = 'error',
    public fields?: Record<string, string>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export async function api<T = any>(path: string, opts: RequestOptions = {}): Promise<T> {
  if (DEMO_MODE) {
    try {
      return await demoRequest<T>(path, opts);
    } catch (err) {
      if (err instanceof DemoApiError) {
        throw new ApiError(err.status, err.message, err.code, err.fields);
      }
      throw err;
    }
  }

  let res: Response;
  try {
    res = await fetch('/api' + path, {
      method: opts.method ?? (opts.body !== undefined ? 'POST' : 'GET'),
      credentials: 'same-origin',
      headers: {
        ...(opts.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(opts.headers ?? {})
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: opts.signal
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    throw new ApiError(0, 'Unable to reach Sayphora. Check your connection and try again.', 'network');
  }

  let data: any = null;
  const text = await res.text();
  if (text) {
    try { data = JSON.parse(text); } catch { /* non-JSON error page */ }
  }
  if (!res.ok) {
    const e = data?.error;
    throw new ApiError(
      res.status,
      e?.message || \`Request failed (\${res.status}).\`,
      e?.code,
      e?.details && typeof e.details === 'object' && !Array.isArray(e.details) ? e.details : undefined
    );
  }
  return data as T;
}

export const errorMessage = (err: unknown): string =>
  err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Something went wrong. Please try again.';
