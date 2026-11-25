import type { ApiError } from '~shared/api';

/** Our backend: VITE_API_URL in production (Render), same origin in dev (Vite proxies /api). */
const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

interface CallOptions {
  method?: 'GET' | 'POST';
  signal?: AbortSignal;
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

/** Calls our backend and returns its JSON; throws an Error with the server's message. */
export const callApi = async <T>(path: string, options: CallOptions = {}): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new Error('Server is not reachable');
  }
  if (!response.ok) throw new Error(await readError(response));
  return response.json();
};
