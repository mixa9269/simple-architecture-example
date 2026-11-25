import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from './app';
import { clearCache } from './entities/cache';
import { clearFavorites } from './entities/favorites';
import { errorResponse, makeSearchItem, makeTvmazeShow, okResponse } from './testFixtures';

const app = createApp();
const SEARCH = [1, 2, 3, 4].map((id) => makeSearchItem(id, `Girls ${id}`, ['Drama']));

beforeEach(() => {
  clearCache();
  clearFavorites();
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

describe('/api/favorites', () => {
  it('toggles a favorite and lists it', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => okResponse(makeTvmazeShow({ id: 3, name: 'Pine' }))));

    const added = await request(app).post('/api/favorites/3/toggle');
    expect(added.body).toMatchObject({ isFavorite: true, show: { id: 3, name: 'Pine' } });
    expect((await request(app).get('/api/favorites')).body.shows).toHaveLength(1);

    const removed = await request(app).post('/api/favorites/3/toggle');
    expect(removed.body).toMatchObject({ isFavorite: false, favorites: [] });
  });

  it('answers 400 for a bad id and 404 for an unknown show', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn(async () => errorResponse(404)));

    expect((await request(app).post('/api/favorites/abc/toggle')).status).toBe(400);
    expect((await request(app).post('/api/favorites/999/toggle')).status).toBe(404);
  });
});
