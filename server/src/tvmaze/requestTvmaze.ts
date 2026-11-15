const TVMAZE_URL = 'https://api.tvmaze.com';

/** TVmaze is down or answered with an error status. */
export class TvmazeError extends Error {
  readonly status: number;

  constructor(status: number, message = `TVmaze responded with status ${status}`) {
    super(message);
    this.name = 'TvmazeError';
    this.status = status;
  }
}

/** Transport: GET a TVmaze path (`/search/shows?q=…`) and return its JSON. Used by `tvmaze.*` only. */
export const requestTvmaze = async <T>(path: string): Promise<T> => {
  // Every real call is logged, so cache hits are visible as missing lines in the server log.
  if (process.env.NODE_ENV !== 'test') console.info(`TVmaze GET ${path}`);
  let response: Response;
  try {
    response = await fetch(`${TVMAZE_URL}${path}`);
  } catch {
    throw new TvmazeError(0, 'TVmaze is not reachable');
  }
  if (!response.ok) throw new TvmazeError(response.status);
  return (await response.json()) as T;
};
