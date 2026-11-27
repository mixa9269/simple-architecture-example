import { afterEach, describe, expect, it, vi } from 'vitest';
import { okResponse } from '~/testUtils/fixtures';
import { api } from './api';

const USER = 'ann@mail.com';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('api.favorites', () => {
  it('lists the favorites of the user', async () => {
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(async () => okResponse({ shows: [] }));
    vi.stubGlobal('fetch', fetchMock);

    expect(await api.favorites.list(USER)).toEqual({ shows: [] });
    expect(fetchMock.mock.calls[0][0]).toBe('/api/favorites');
    expect(fetchMock.mock.calls[0][1]?.headers).toEqual({ 'X-User-Email': USER });
  });

  it('toggles a favorite with POST for the user', async () => {
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(async () => okResponse({}));
    vi.stubGlobal('fetch', fetchMock);

    await api.favorites.toggle(USER, 5);

    expect(fetchMock.mock.calls[0][0]).toBe('/api/favorites/5/toggle');
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: 'POST',
      headers: { 'X-User-Email': USER },
    });
  });

  it('says so when the server is not reachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(api.favorites.list(USER)).rejects.toThrow('Server is not reachable');
  });
});
