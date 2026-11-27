import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearCache } from '~/entities/cache';
import { clearFavorites } from '~/entities/favorites';
import { clearUsers, registerUser } from '~/entities/users';
import { errorResponse, makeTvmazeShow, okResponse } from '~/testFixtures';
import { getFavorites } from './getFavorites';
import { toggleFavorite } from './toggleFavorite';

const USER = 'ann@mail.com';
const names = (shows: { name: string }[]) => shows.map((show) => show.name);

beforeEach(() => {
  clearCache();
  clearFavorites();
  clearUsers();
  registerUser(USER);
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
    const result = await toggleFavorite(USER, 7);

    expect(result).toMatchObject({ ok: true, data: { isFavorite: true, show: { id: 7 } } });
    expect(fetch).toHaveBeenCalledWith('https://api.tvmaze.com/shows/7');
  });

  it('removes a show that is already a favorite without asking TVmaze', async () => {
    await toggleFavorite(USER, 7);
    vi.mocked(fetch).mockClear();

    const result = await toggleFavorite(USER, 7);

    expect(result).toEqual({
      ok: true,
      data: expect.objectContaining({ isFavorite: false, favorites: [] }),
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('lists favorites newest first, not by id', async () => {
    await toggleFavorite(USER, 9);
    await toggleFavorite(USER, 2);
    await toggleFavorite(USER, 5);

    const result = getFavorites(USER);
    expect(result.ok && names(result.data.shows)).toEqual(['Show 5', 'Show 2', 'Show 9']);
  });

  it('logs a TVmaze failure and reports its kind', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn(async () => errorResponse(404)));

    const result = await toggleFavorite(USER, 999);

    expect(result).toEqual({ ok: false, error: { kind: 'not-found', message: 'Show not found' } });
    expect(consoleError).toHaveBeenCalled();
  });

  it('refuses a user who never logged in', async () => {
    const result = await toggleFavorite('nobody@mail.com', 1);

    expect(result).toEqual({
      ok: false,
      error: { kind: 'unauthorized', message: 'Log in to use favorites' },
    });
  });
});
