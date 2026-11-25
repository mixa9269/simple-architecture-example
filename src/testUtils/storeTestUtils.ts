import { renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import type { Show } from '~shared/api';
import { favoritesReceived } from '~/entities/favorites/favoritesSlice';
import { store } from '~/entities/store';

/** renderHook inside the app store (presenters that use useSelector). */
export function renderHookWithStore<T>(hook: () => T) {
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(Provider, { store, children });
  return renderHook(hook, { wrapper });
}

/** Tests only: puts the given favorites into the store. */
export function setFavorites(shows: Show[]) {
  store.dispatch(favoritesReceived(shows));
}
