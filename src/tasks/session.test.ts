import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { selectUserEmail } from '~/entities/session/sessionSlice';
import { store } from '~/entities/store';
import { makeShow } from '~/testUtils/fixtures';
import { setFavorites, setSession } from '~/testUtils/storeTestUtils';
import { logOut } from './logOut';
import { restoreSession } from './restoreSession';
import { readSavedEmail, saveEmail } from './savedSession';

beforeEach(() => {
  localStorage.clear();
  setSession(null);
  setFavorites([]);
});

afterEach(() => {
  localStorage.clear();
});

describe('session tasks', () => {
  it('restores the saved user before the first render', () => {
    saveEmail('ann@mail.com');

    expect(restoreSession()).toEqual({ ok: true, data: 'ann@mail.com' });
    expect(selectUserEmail(store.getState())).toBe('ann@mail.com');
  });

  it('stays a guest when nothing was saved', () => {
    expect(restoreSession()).toEqual({ ok: true, data: null });
    expect(selectUserEmail(store.getState())).toBeNull();
  });

  it('logs out: forgets the email and drops the favorites from the store', () => {
    saveEmail('ann@mail.com');
    setSession('ann@mail.com');
    setFavorites([makeShow()]);

    logOut();

    expect(selectUserEmail(store.getState())).toBeNull();
    expect(store.getState().favorites.shows).toEqual([]);
    expect(readSavedEmail()).toBeNull();
  });
});
