import { afterEach, describe, expect, it, vi } from 'vitest';
import { errorResponse, okResponse } from '~/testUtils/fixtures';
import { api } from './api';

const signal = new AbortController().signal;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('api.shows.search', () => {
  it('asks our server for the query, genre and page', async () => {
    const fetchMock = vi.fn(async () => okResponse({ shows: [] }));
    vi.stubGlobal('fetch', fetchMock);

    await api.shows.search({ query: 'kill bill', genre: 'Drama', page: 2 }, signal);

    expect(fetchMock).toHaveBeenCalledWith('/api/shows?q=kill+bill&genre=Drama&page=2', {
      signal,
    });
  });

  it('leaves out the default genre and page', async () => {
    const fetchMock = vi.fn(async () => okResponse({ shows: [] }));
    vi.stubGlobal('fetch', fetchMock);

    await api.shows.search({ query: 'dark', genre: null, page: 1 }, signal);

    expect(fetchMock).toHaveBeenCalledWith('/api/shows?q=dark', { signal });
  });

  it('throws the error message of the server', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => errorResponse(502, { error: 'TVmaze is down' })));

    await expect(api.shows.search({ query: 'dark', genre: null, page: 1 })).rejects.toThrow(
      'TVmaze is down',
    );
  });
});
