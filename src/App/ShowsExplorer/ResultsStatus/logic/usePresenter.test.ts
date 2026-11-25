import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Props } from '~/App/ShowsExplorer/ResultsStatus/types';
import { usePresenter } from './usePresenter';

const props = (overrides: Partial<Props> = {}): Props => ({
  status: 'success',
  query: 'forest',
  genre: null,
  error: null,
  totalCount: 7,
  filteredCount: 7,
  waitingFor: null,
  onRetry: vi.fn(),
  ...overrides,
});

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('ResultsStatus usePresenter', () => {
  it('summarizes the found shows, or says nothing was found', () => {
    expect(renderHook(() => usePresenter(props())).result.current).toMatchObject({
      variant: 'summary',
      summary: '7 shows found',
    });
    const empty = renderHook(() => usePresenter(props({ totalCount: 0, query: 'nothing' })));
    expect(empty.result.current.variant).toBe('empty');
    expect(empty.result.current.emptyMessage).toContain('“nothing”');
  });

  it('shows the error with Retry', () => {
    const onRetry = vi.fn();
    const { result } = renderHook(() =>
      usePresenter(props({ status: 'error', error: 'TVmaze is down', totalCount: 0, onRetry })),
    );

    expect(result.current).toMatchObject({ variant: 'error', errorMessage: 'TVmaze is down' });
    result.current.onRetry();
    expect(onRetry).toHaveBeenCalled();
  });

  it('says the server is waking up after 3 seconds of waiting, and starts over for new params', () => {
    const asked = { query: 'forest', genre: null, page: 1 };
    const { result, rerender } = renderHook((p: Props) => usePresenter(p), {
      initialProps: props({ status: 'loading', totalCount: 0, waitingFor: asked }),
    });
    expect(result.current.variant).toBe('none');

    act(() => void vi.advanceTimersByTime(3000));
    expect(result.current.variant).toBe('waking');

    rerender(props({ status: 'loading', totalCount: 0, waitingFor: { ...asked, page: 2 } }));
    expect(result.current.variant).toBe('none');
  });
});
