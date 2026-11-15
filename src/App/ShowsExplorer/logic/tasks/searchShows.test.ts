import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { errorResponse, makeShowsPage, okResponse } from '~/App/ShowsExplorer/logic/testFixtures';
import { searchShows } from './searchShows';

const request = { query: 'dark', genre: null, page: 1 };
let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('searchShows', () => {
  it('returns the page from the server', async () => {
    const page = makeShowsPage({ query: 'dark' });
    vi.stubGlobal('fetch', vi.fn(async () => okResponse(page)));

    const result = await searchShows(request, new AbortController().signal);

    expect(result).toEqual({ ok: true, data: page });
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('logs a failure and reports its message', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => errorResponse(502, { error: 'TVmaze is down' })));

    const result = await searchShows(request, new AbortController().signal);

    expect(result).toEqual({ ok: false, error: 'TVmaze is down' });
    expect(consoleError).toHaveBeenCalledWith(expect.objectContaining({ message: 'TVmaze is down' }));
  });

  it('does not log a cancelled request', async () => {
    const controller = new AbortController();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        controller.abort();
        throw new DOMException('Aborted', 'AbortError');
      }),
    );

    const result = await searchShows(request, controller.signal);

    expect(result.ok).toBe(false);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
