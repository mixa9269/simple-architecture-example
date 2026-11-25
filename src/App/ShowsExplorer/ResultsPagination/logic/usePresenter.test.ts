import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  FOREST_SHOWS,
  PINE_SHOWS,
  flushDebounce,
  flushRequests,
  resetSearch,
  run,
  stubShowsApi,
} from '~/App/ShowsExplorer/tasks/searchTestUtils';
import { typeQuery } from '~/App/ShowsExplorer/tasks/typeQuery';
import { renderHookWithStore } from '~/testUtils/storeTestUtils';
import { usePresenter } from './usePresenter';

beforeEach(() => {
  vi.useFakeTimers();
  resetSearch();
  stubShowsApi({ forest: FOREST_SHOWS, pine: PINE_SHOWS });
});

afterEach(() => {
  resetSearch();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('ResultsPagination usePresenter', () => {
  it('is hidden for a single page', async () => {
    const { result } = renderHookWithStore(() => usePresenter());
    run(() => typeQuery('pine'));
    await flushDebounce();

    expect(result.current.isHidden).toBe(true);
  });

  it('opens another page, moving the control at once', async () => {
    const { result } = renderHookWithStore(() => usePresenter());
    run(() => typeQuery('forest'));
    await flushDebounce();
    expect(result.current).toMatchObject({ isHidden: false, page: 1, totalPages: 3 });

    act(() => void result.current.onChange(3));
    expect(result.current.page).toBe(3);
    await flushRequests();

    expect(result.current.page).toBe(3);
  });
});
