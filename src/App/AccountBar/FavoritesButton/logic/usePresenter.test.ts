import { notifications } from '@mantine/notifications';
import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { errorResponse, makeShow, okResponse } from '~/testUtils/fixtures';
import { store } from '~/entities/store';
import { renderHookWithStore, setFavorites, setSession } from '~/testUtils/storeTestUtils';
import { usePresenter } from './usePresenter';

vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));

beforeEach(() => {
  setSession('ann@mail.com');
  setFavorites([]);
  vi.mocked(notifications.show).mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('FavoritesButton usePresenter', () => {
  it('loads the favorites from the server on mount and counts them', async () => {
    const shows = [makeShow({ id: 1 }), makeShow({ id: 2 })];
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(async () =>
      okResponse({ shows }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHookWithStore(() => usePresenter());
    expect(result.current.count).toBe(0);

    await waitFor(() => expect(result.current.count).toBe(2));
    expect(result.current.label).toBe('Favorites: 2 shows');
    expect(fetchMock.mock.calls[0][0]).toBe('/api/favorites');
    expect(fetchMock.mock.calls[0][1]?.headers).toEqual({ 'X-User-Email': 'ann@mail.com' });
  });

  it('opens and closes the list', () => {
    vi.stubGlobal('fetch', vi.fn(async () => okResponse({ shows: [] })));
    const { result } = renderHookWithStore(() => usePresenter());

    act(() => result.current.onOpen());
    expect(result.current.opened).toBe(true);
    act(() => result.current.onClose());
    expect(result.current.opened).toBe(false);
  });

  it('logs and shows an error toast when the favorites cannot be loaded', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn(async () => errorResponse(500)));

    renderHookWithStore(() => usePresenter());

    await waitFor(() =>
      expect(notifications.show).toHaveBeenCalledWith(
        expect.objectContaining({ color: 'red', title: 'Could not load favorites' }),
      ),
    );
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('ends the session when the server no longer knows the user', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn(async () => errorResponse(401)));

    renderHookWithStore(() => usePresenter());

    await waitFor(() => expect(store.getState().session.email).toBeNull());
    vi.restoreAllMocks();
  });
});
