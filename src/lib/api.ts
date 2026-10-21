export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code: string = 'error',
    public fields?: Record<string, string>
  ) {
    super(message);
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

/** Same-origin JSON client. Cookies carry the session; errors are normalised into ApiError. */
export async function api<T = any>(path: string, opts: RequestOptions = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method: opts.method ?? (opts.body !== undefined ? 'POST' : 'GET'),
      credentials: 'same-origin',
      headers: { ...(opts.body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...opts.headers },
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
    throw new ApiError(res.status, e?.message || `Request failed (${res.status}).`, e?.code, e?.details && typeof e.details === 'object' && !Array.isArray(e.details) ? e.details : undefined);
  }
  return data as T;
}

export const errorMessage = (err: unknown): string =>
  err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Something went wrong. Please try again.';
