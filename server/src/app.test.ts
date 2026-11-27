import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from './app';
import { clearCache } from './entities/cache';
import { clearFavorites } from './entities/favorites';
import { clearUsers } from './entities/users';
import { errorResponse, makeSearchItem, okResponse } from './testFixtures';

const app = createApp();
const SEARCH = [1, 2, 3, 4].map((id) => makeSearchItem(id, `Girls ${id}`, ['Drama']));

beforeEach(() => {
  clearCache();
  clearFavorites();
  clearUsers();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('GET /api/shows', () => {
  it('returns a page of the found shows', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => okResponse(SEARCH)));

    const res = await request(app).get('/api/shows?q=Girls&page=2&genre=Drama');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ query: 'Girls', genre: 'Drama', page: 2, total: 4 });
    expect(res.body.shows.map((show: { id: number }) => show.id)).toEqual([4]);
    expect(fetch).toHaveBeenCalledWith('https://api.tvmaze.com/search/shows?q=girls');
  });

  it('serves another page of the same query from the cache', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => okResponse(SEARCH)));

    await request(app).get('/api/shows?q=girls');
    await request(app).get('/api/shows?q=GIRLS&page=2');

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('answers 400 without a query and 502 when TVmaze fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn(async () => errorResponse(500)));

    expect((await request(app).get('/api/shows?q=%20')).status).toBe(400);
    const failed = await request(app).get('/api/shows?q=girls');
    expect(failed.status).toBe(502);
    expect(failed.body.error).toContain('status 500');
  });
});
