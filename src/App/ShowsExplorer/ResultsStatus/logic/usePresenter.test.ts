import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  FOREST_SHOWS,
  flushDebounce,
  flushRequests,
  resetSearch,
  run,
  stubShowsApi,
} from '~/App/ShowsExplorer/tasks/searchTestUtils';
import { typeQuery } from '~/App/ShowsExplorer/tasks/typeQuery';
import { errorResponse } from '~/testUtils/fixtures';
import { renderHookWithStore } from '~/testUtils/storeTestUtils';
import { usePresenter } from './usePresenter';

beforeEach(() => {
  vi.useFakeTimers();
  resetSearch();
});

afterEach(() => {
  resetSearch();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('ResultsStatus usePresenter', () => {
  it('summarizes the found shows, or says nothing was found', async () => {
    stubShowsApi({ forest: FOREST_SHOWS });
    const { result } = renderHookWithStore(() => usePresenter());

    run(() => typeQuery('forest'));
    await flushDebounce();
    expect(result.current).toMatchObject({ variant: 'summary', summary: '7 shows found' });

    run(() => typeQuery('nothing'));
    await flushDebounce();
    expect(result.current.variant).toBe('empty');
    expect(result.current.emptyMessage).toContain('“nothing”');
  });

  it('shows the error and retries', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn(async () => errorResponse(502, { error: 'TVmaze is down' })));
    const { result } = renderHookWithStore(() => usePresenter());
    run(() => typeQuery('forest'));
    await flushDebounce();
    expect(result.current).toMatchObject({ variant: 'error', errorMessage: 'TVmaze is down' });

    stubShowsApi({ forest: FOREST_SHOWS });
    act(() => void result.current.onRetry());
    await flushRequests();
    expect(result.current.variant).toBe('summary');
  });

  it('says the server is waking up when an answer takes longer than 3 seconds', async () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => {})));
    const { result } = renderHookWithStore(() => usePresenter());
    run(() => typeQuery('forest'));
    await flushDebounce();
    expect(result.current.variant).toBe('none');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(result.current.variant).toBe('waking');

    run(() => typeQuery(''));
    expect(result.current.variant).toBe('none');
  });
});
