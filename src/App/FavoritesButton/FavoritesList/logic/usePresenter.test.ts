import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { makeShow } from '~/testUtils/fixtures';
import { renderHookWithStore, setFavorites } from '~/testUtils/storeTestUtils';
import { usePresenter } from './usePresenter';

const [dark, fargo] = [1, 2].map((id) => makeShow({ id, name: `Show ${id}` }));
const names = (shows: { name: string }[]) => shows.map((show) => show.name);

beforeEach(() => {
  setFavorites([dark, fargo]);
});

describe('FavoritesList usePresenter', () => {
  it('keeps a show unstarred in the open Drawer until it is opened again', () => {
    const { result, unmount } = renderHookWithStore(() => usePresenter());

    act(() => setFavorites([fargo]));
    expect(names(result.current.shows)).toEqual(['Show 1', 'Show 2']);

    unmount();
    const reopened = renderHookWithStore(() => usePresenter());
    expect(names(reopened.result.current.shows)).toEqual(['Show 2']);
  });

  it('is empty without favorites', () => {
    setFavorites([]);
    const { result } = renderHookWithStore(() => usePresenter());

    expect(result.current.isEmpty).toBe(true);
  });
});
