import { notifications } from '@mantine/notifications';
import { act } from '@testing-library/react';
import type { ChangeEvent, FormEvent } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { selectUserEmail } from '~/entities/session/sessionSlice';
import { store } from '~/entities/store';
import { readSavedEmail } from '~/tasks/savedSession';
import { errorResponse, okResponse } from '~/testUtils/fixtures';
import { renderHookInRouter, setSession } from '~/testUtils/storeTestUtils';
import { usePresenter } from './usePresenter';

vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));

const type = (value: string) => ({ currentTarget: { value } }) as ChangeEvent<HTMLInputElement>;
const submit = { preventDefault: vi.fn() } as unknown as FormEvent<HTMLFormElement>;

beforeEach(() => {
  localStorage.clear();
  setSession(null);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('LoginPage usePresenter', () => {
  it('can submit only a typed email', () => {
    const { result } = renderHookInRouter(() => usePresenter(), '/login');
    expect(result.current.canSubmit).toBe(false);

    act(() => result.current.onEmailChange(type('ann@mail.com')));

    expect(result.current.canSubmit).toBe(true);
  });

  it('logs in and sends the user back to where they came from', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => okResponse({ user: { email: 'ann@mail.com' } })));
    const { result } = renderHookInRouter(() => usePresenter(), '/login', { from: '/?q=dark' });
    act(() => result.current.onEmailChange(type(' Ann@Mail.com ')));

    await act(() => result.current.onSubmit(submit));

    expect(selectUserEmail(store.getState())).toBe('ann@mail.com');
    expect(readSavedEmail()).toBe('ann@mail.com');
    expect(result.current.redirectTo).toBe('/?q=dark');
    expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ title: 'Logged in' }));
  });

  it('shows the server error under the field and stays a guest', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn(async () => errorResponse(400, { error: 'Enter a valid email' })));
    const { result } = renderHookInRouter(() => usePresenter(), '/login');
    act(() => result.current.onEmailChange(type('ann@')));

    await act(() => result.current.onSubmit(submit));

    expect(result.current).toMatchObject({ error: 'Enter a valid email', redirectTo: null });
    expect(selectUserEmail(store.getState())).toBeNull();
  });

  it('leaves the page at once for a user who is already logged in', () => {
    setSession('ann@mail.com');
    const { result } = renderHookInRouter(() => usePresenter(), '/login');

    expect(result.current.redirectTo).toBe('/');
  });
});
