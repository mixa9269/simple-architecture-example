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

  it('fills the star at once, ignores clicks while pending, rolls back on a failure', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    let answer: (response: Response) => void = () => {};
    const fetchMock = vi.fn(() => new Promise<Response>((resolve) => (answer = resolve)));
    vi.stubGlobal('fetch', fetchMock);
    const { result } = render();

    let toggled: Promise<void> | void = Promise.resolve();
    act(() => {
      toggled = result.current.onToggle();
    });
    expect(result.current.isFavorite).toBe(true); // before the server answers
    expect(result.current.isPending).toBe(true);

    await act(() => result.current.onToggle());
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      answer(errorResponse(502, { error: 'TVmaze is down' }));
      await toggled;
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isFavorite).toBe(false);
    expect(store.getState().favorites.shows).toEqual([]);
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ color: 'red', message: 'TVmaze is down' }),
    );
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('rolls back only its own show', async () => {
    const other = makeShow({ id: 9, name: 'Fargo' });
    let answer: (response: Response) => void = () => {};
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((resolve) => (answer = resolve))));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = render();

    let toggled: Promise<void> | void = Promise.resolve();
    act(() => {
      toggled = result.current.onToggle();
    });
    act(() => setFavorites([other, show])); // another star was toggled meanwhile
    await act(async () => {
      answer(errorResponse(502, { error: 'TVmaze is down' }));
      await toggled;
    });

    expect(store.getState().favorites.shows).toEqual([other]);
    vi.restoreAllMocks();
  });
});
