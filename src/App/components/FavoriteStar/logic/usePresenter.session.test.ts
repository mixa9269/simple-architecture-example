import { notifications } from '@mantine/notifications';
import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { selectUserEmail } from '~/entities/session/sessionSlice';
import { store } from '~/entities/store';
import { errorResponse, makeShow } from '~/testUtils/fixtures';
import {
  renderHookInRouter,
  renderHookWithStore,
  setFavorites,
  setSession,
} from '~/testUtils/storeTestUtils';
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

describe('FavoriteStar usePresenter — session', () => {
  it('sends a guest to the login page instead of calling the server', () => {
    setSession(null);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHookInRouter(() => usePresenter({ show }), '/?q=dark');
    expect(result.current.label).toBe('Log in to add Dark to favorites');

    act(() => void result.current.onToggle());

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.location.pathname).toBe('/login');
    expect(result.current.location.state).toEqual({ from: '/?q=dark' });
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Log in to add favorites' }),
    );
  });

  it('logs the user out when the server no longer knows them', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn(async () => errorResponse(401, { error: 'Log in to use favorites' })));
    const { result } = render();

    await act(() => result.current.onToggle());

    expect(selectUserEmail(store.getState())).toBeNull();
    expect(store.getState().favorites.shows).toEqual([]); // the optimistic add is gone too
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Please log in again' }),
    );
    vi.restoreAllMocks();
  });
});
