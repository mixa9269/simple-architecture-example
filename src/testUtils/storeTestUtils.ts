import { renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, useLocation } from 'react-router';
import type { Show } from '~shared/api';
import { favoritesReceived } from '~/entities/favorites/favoritesSlice';
import { sessionEnded, sessionStarted } from '~/entities/session/sessionSlice';
import { store } from '~/entities/store';

/** A hook under test inside the store and a router at `url`; the current location comes back too. */
export function renderHookInRouter<T>(hook: () => T, url = '/', state?: unknown) {
  const { pathname, search } = new URL(url, 'http://localhost');
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(Provider, {
      store,
      children: createElement(MemoryRouter, {
        initialEntries: [{ pathname, search, state }],
        children,
      }),
    });
  return renderHook(() => ({ ...hook(), location: useLocation() }), { wrapper });
}

/** renderHook inside the app store and a router (presenters use useSelector and navigation). */
export function renderHookWithStore<T>(hook: () => T) {
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(Provider, { store, children: createElement(MemoryRouter, { children }) });
  return renderHook(hook, { wrapper });
}

/** Tests only: puts the given favorites into the store. */
export function setFavorites(shows: Show[]) {
  store.dispatch(favoritesReceived(shows));
}

/** Tests only: logs the given email in (or out with null) without the server. */
export function setSession(email: string | null) {
  store.dispatch(email ? sessionStarted(email) : sessionEnded());
}
