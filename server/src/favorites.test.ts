import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from './app';
import { clearCache } from './entities/cache';
import { clearFavorites } from './entities/favorites';
import { clearUsers } from './entities/users';
import { errorResponse, makeTvmazeShow, okResponse } from './testFixtures';

const app = createApp();
const ANN = 'ann@mail.com';
const BOB = 'bob@mail.com';

const logIn = (email: string) => request(app).post('/api/login').send({ email });
const toggle = (email: string | null, id: number) => {
  const req = request(app).post(`/api/favorites/${id}/toggle`);
  return email ? req.set('X-User-Email', email) : req;
};
const list = (email: string) => request(app).get('/api/favorites').set('X-User-Email', email);
const ids = (res: request.Response) => res.body.shows.map((show: { id: number }) => show.id);

beforeEach(() => {
  clearCache();
  clearFavorites();
  clearUsers();
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

describe('POST /api/login', () => {
  it('logs in by email, normalized', async () => {
    const res = await logIn('  Ann@Mail.COM ');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ user: { email: ANN } });
  });

  it('answers 400 for an invalid or missing email', async () => {
    expect((await logIn('not-an-email')).status).toBe(400);
    expect((await request(app).post('/api/login').send({})).status).toBe(400);
  });
});

describe('/api/favorites', () => {
  it('answers 401 without a user and for an email that never logged in', async () => {
    expect((await request(app).get('/api/favorites')).status).toBe(401);
    expect((await toggle(BOB, 1)).status).toBe(401);
  });

  it('keeps every user’s favorites apart', async () => {
    await logIn(ANN);
    await logIn(BOB);

    await toggle(ANN, 1);
    await toggle(ANN, 2);
    await toggle(BOB, 3);

    expect(ids(await list(ANN))).toEqual([2, 1]);
    expect(ids(await list(BOB))).toEqual([3]);
  });

  it('gives the same favorites back when the user logs in again', async () => {
    await logIn(ANN);
    await toggle(ANN, 7);

    await logIn('ANN@mail.com');

    expect(ids(await list(ANN))).toEqual([7]);
  });

  it('toggles a favorite off again', async () => {
    await logIn(ANN);
    await toggle(ANN, 3);

    const removed = await toggle(ANN, 3);

    expect(removed.body).toMatchObject({ isFavorite: false, favorites: [] });
  });

  it('answers 400 for a bad id and 404 for an unknown show', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn(async () => errorResponse(404)));
    await logIn(ANN);

    expect((await toggle(ANN, Number.NaN)).status).toBe(400);
    expect((await toggle(ANN, 999)).status).toBe(404);
  });
});
