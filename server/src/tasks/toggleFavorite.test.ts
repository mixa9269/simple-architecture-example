import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearCache } from '~/entities/cache';
import { clearFavorites } from '~/entities/favorites';
import { errorResponse, makeTvmazeShow, okResponse } from '~/testFixtures';
import { getFavorites } from './getFavorites';
import { toggleFavorite } from './toggleFavorite';

const names = (shows: { name: string }[]) => shows.map((show) => show.name);

beforeEach(() => {
  clearCache();
  clearFavorites();
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const id = Number(url.split('/').pop());
      return okResponse(makeTvmazeShow({ id, name: `Show ${id}` }));
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('toggleFavorite', () => {
  it('adds a show fetched from TVmaze', async () => {
    const result = await toggleFavorite(7);

    expect(result).toMatchObject({ ok: true, data: { isFavorite: true, show: { id: 7 } } });
    expect(fetch).toHaveBeenCalledWith('https://api.tvmaze.com/shows/7');
  });

  it('removes a show that is already a favorite without asking TVmaze', async () => {
    await toggleFavorite(7);
    vi.mocked(fetch).mockClear();

    const result = await toggleFavorite(7);

    expect(result).toEqual({
      ok: true,
      data: expect.objectContaining({ isFavorite: false, favorites: [] }),
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('lists favorites newest first, not by id', async () => {
    await toggleFavorite(9);
    await toggleFavorite(2);
    await toggleFavorite(5);

    const result = getFavorites();
    expect(result.ok && names(result.data.shows)).toEqual(['Show 5', 'Show 2', 'Show 9']);
  });

  it('logs a TVmaze failure and reports its kind', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn(async () => errorResponse(404)));

    const result = await toggleFavorite(999);

    expect(result).toEqual({ ok: false, error: { kind: 'not-found', message: 'Show not found' } });
    expect(consoleError).toHaveBeenCalled();
  });
});
