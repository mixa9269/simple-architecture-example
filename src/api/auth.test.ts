import { afterEach, describe, expect, it, vi } from 'vitest';
import { errorResponse, okResponse } from '~/testUtils/fixtures';
import { api } from './api';
import { HttpError } from './callApi';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('api.auth.login', () => {
  it('posts the email as JSON', async () => {
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(async () =>
      okResponse({ user: { email: 'ann@mail.com' } }),
    );
    vi.stubGlobal('fetch', fetchMock);

    expect(await api.auth.login('Ann@mail.com')).toEqual({ user: { email: 'ann@mail.com' } });
    expect(fetchMock.mock.calls[0][0]).toBe('/api/login');
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"email":"Ann@mail.com"}',
    });
  });

  it('throws an HttpError with the status and the server message', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => errorResponse(400, { error: 'Enter a valid email' })));

    const error = await api.auth.login('ann@').catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({ status: 400, message: 'Enter a valid email' });
  });
});
