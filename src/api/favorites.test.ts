import { afterEach, describe, expect, it, vi } from 'vitest';
import { okResponse } from '~/testUtils/fixtures';
import { api } from './api';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('api.favorites', () => {
  it('lists the favorites', async () => {
    const fetchMock = vi.fn(async () => okResponse({ shows: [] }));
    vi.stubGlobal('fetch', fetchMock);

    expect(await api.favorites.list()).toEqual({ shows: [] });
    expect(fetchMock).toHaveBeenCalledWith('/api/favorites', { signal: undefined });
  });

  it('toggles a favorite with POST', async () => {
    const fetchMock = vi.fn(async () => okResponse({ isFavorite: true }));
    vi.stubGlobal('fetch', fetchMock);

    await api.favorites.toggle(5);

    expect(fetchMock).toHaveBeenCalledWith('/api/favorites/5/toggle', { method: 'POST' });
  });

  it('says so when the server is not reachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(api.favorites.list()).rejects.toThrow('Server is not reachable');
  });
});
