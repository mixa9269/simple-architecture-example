import { notifications } from '@mantine/notifications';
import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { store } from '~/entities/store';
import { errorResponse, makeShow, okResponse } from '~/testUtils/fixtures';
import { renderHookWithStore, setFavorites, setSession } from '~/testUtils/storeTestUtils';
import { usePresenter } from './usePresenter';

vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));

const show = makeShow({ id: 5, name: 'Dark' });
const render = () => renderHookWithStore(() => usePresenter({ show }));

beforeEach(() => {
  setSession('ann@mail.com');
  setFavorites([]);
  vi.mocked(notifications.show).mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('FavoriteStar usePresenter', () => {
  it('adds the show: the server list goes to the store and a toast is shown', async () => {
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(async () =>
      okResponse({ show, isFavorite: true, favorites: [show] }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const { result } = render();
    expect(result.current.isFavorite).toBe(false);

    await act(() => result.current.onToggle());

    expect(fetchMock.mock.calls[0][0]).toBe('/api/favorites/5/toggle');
    expect(fetchMock.mock.calls[0][1]?.headers).toEqual({ 'X-User-Email': 'ann@mail.com' });
    expect(store.getState().favorites.shows).toEqual([show]);
    expect(result.current.isFavorite).toBe(true);
    expect(result.current.label).toBe('Remove Dark from favorites');
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Added to favorites' }),
    );
  });

  it('removes a favorite show', async () => {
    setFavorites([show]);
    vi.stubGlobal('fetch', vi.fn(async () => okResponse({ show, isFavorite: false, favorites: [] })));
    const { result } = render();
    expect(result.current.isFavorite).toBe(true);

    await act(() => result.current.onToggle());

    expect(result.current.isFavorite).toBe(false);
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Removed from favorites' }),
    );
  });

  it('is pending while the server answers, then logs the failure and shows an error toast', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    let answer: (response: Response) => void = () => {};
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((resolve) => (answer = resolve))));
    const { result } = render();

    let toggled: Promise<void> | void = Promise.resolve();
    act(() => {
      toggled = result.current.onToggle();
    });
    expect(result.current.isPending).toBe(true);

    await act(async () => {
      answer(errorResponse(502, { error: 'TVmaze is down' }));
      await toggled;
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isFavorite).toBe(false);
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ color: 'red', message: 'TVmaze is down' }),
    );
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
