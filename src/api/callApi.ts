import type { ApiError } from '~shared/api';

/** Our backend: VITE_API_URL in production (Render), same origin in dev (Vite proxies /api). */
const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

/** A non-2xx answer: the server's message plus the status, so tasks can react to e.g. 401. */
export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

interface CallOptions {
  method?: 'GET' | 'POST';
  signal?: AbortSignal;
  /** The logged-in user, sent as `X-User-Email`. The API layer doesn't know who is logged in. */
  user?: string;
  /** JSON body of a POST. */
  body?: unknown;
}

const readError = async (response: Response): Promise<string> => {
  try {
    const body: Partial<ApiError> = await response.json();
    if (body.error) return body.error;
  } catch {
    // Not JSON: fall back to the status.
  }
  return `Server responded with status ${response.status}`;
};

const toRequest = ({ method, signal, user, body }: CallOptions): RequestInit => {
  const headers: Record<string, string> = {};
  if (user) headers['X-User-Email'] = user;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  return {
    method,
    signal,
    ...(Object.keys(headers).length > 0 && { headers }),
    ...(body !== undefined && { body: JSON.stringify(body) }),
  };
};

/** Calls our backend and returns its JSON; throws HttpError with the server's message. */
export const callApi = async <T>(path: string, options: CallOptions = {}): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, toRequest(options));
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new Error('Server is not reachable');
  }
  if (!response.ok) throw new HttpError(response.status, await readError(response));
  return response.json();
};
