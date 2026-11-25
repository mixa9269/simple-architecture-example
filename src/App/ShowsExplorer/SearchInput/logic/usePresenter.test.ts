import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  FOREST_SHOWS,
  flushDebounce,
  resetSearch,
  stubShowsApi,
} from '~/App/ShowsExplorer/tasks/searchTestUtils';
import { renderHookWithStore } from '~/testUtils/storeTestUtils';
import { usePresenter } from './usePresenter';

const changeEvent = (value: string) =>
  ({ currentTarget: { value } }) as React.ChangeEvent<HTMLInputElement>;

beforeEach(() => {
  vi.useFakeTimers();
  resetSearch();
  stubShowsApi({ forest: FOREST_SHOWS });
});

afterEach(() => {
  resetSearch();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('SearchInput usePresenter', () => {
  it('shows the typed text and loads while the query is not answered yet', async () => {
    const { result } = renderHookWithStore(() => usePresenter());

    act(() => result.current.onChange(changeEvent('forest')));
    expect(result.current.value).toBe('forest');
    expect(result.current.isLoading).toBe(true);
    expect(result.current.showClear).toBe(false);

    await flushDebounce();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.showClear).toBe(true);
  });

  it('clears the field', async () => {
    const { result } = renderHookWithStore(() => usePresenter());
    act(() => result.current.onChange(changeEvent('forest')));
    await flushDebounce();

    act(() => result.current.onClear());

    expect(result.current.value).toBe('');
    expect(result.current.showClear).toBe(false);
  });
});
