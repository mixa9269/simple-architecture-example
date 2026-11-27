import { notifications } from '@mantine/notifications';
import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { store } from '~/entities/store';
import { renderHookInRouter, setSession } from '~/testUtils/storeTestUtils';
import { usePresenter } from './usePresenter';

vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));

beforeEach(() => {
  localStorage.clear();
  vi.mocked(notifications.show).mockClear();
});

describe('AccountBar usePresenter', () => {
  it('offers a guest to log in and remembers where they were', () => {
    setSession(null);
    const { result } = renderHookInRouter(() => usePresenter(), '/?q=dark&page=2');
    expect(result.current).toMatchObject({ email: null, showLogIn: true });

    act(() => result.current.onLogIn());

    expect(result.current.location.pathname).toBe('/login');
    expect(result.current.location.state).toEqual({ from: '/?q=dark&page=2' });
    expect(result.current.showLogIn).toBe(false); // not on the login page itself
  });

  it('shows the email of a logged-in user and logs out', () => {
    setSession('ann@mail.com');
    const { result } = renderHookInRouter(() => usePresenter());
    expect(result.current.email).toBe('ann@mail.com');

    act(() => result.current.onLogOut());

    expect(store.getState().session.email).toBeNull();
    expect(result.current.email).toBeNull();
    expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ title: 'Logged out' }));
  });
});
