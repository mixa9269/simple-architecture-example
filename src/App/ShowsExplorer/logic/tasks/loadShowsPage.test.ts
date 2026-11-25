import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeShowsPage } from '~/App/ShowsExplorer/logic/searchTestUtils';
import { errorResponse, okResponse } from '~/testUtils/fixtures';
import { loadShowsPage } from './loadShowsPage';

const params = { query: 'dark', genre: 'Drama', page: 2 };
let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('loadShowsPage', () => {
  it('returns the page from the server', async () => {
    const page = fakeShowsPage('dark', []);
    const fetchMock = vi.fn<(url: string) => Promise<Response>>(async () => okResponse(page));
    vi.stubGlobal('fetch', fetchMock);

    const result = await loadShowsPage(params, new AbortController().signal);

    expect(result).toEqual({ ok: true, data: page });
    expect(fetchMock.mock.calls[0][0]).toBe('/api/shows?q=dark&genre=Drama&page=2');
  });

  it('logs a failure and reports its message', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => errorResponse(502, { error: 'TVmaze is down' })));

    const result = await loadShowsPage(params, new AbortController().signal);

    expect(result).toEqual({ ok: false, error: 'TVmaze is down' });
    expect(consoleError).toHaveBeenCalled();
  });

  it('does not log a cancelled load', async () => {
    const controller = new AbortController();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        controller.abort();
        throw new DOMException('Aborted', 'AbortError');
      }),
    );

    expect((await loadShowsPage(params, controller.signal)).ok).toBe(false);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
