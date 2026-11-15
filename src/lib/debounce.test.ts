import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce } from './debounce';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('debounce', () => {
  it('runs once with the last arguments after the calls stop', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 400);

    debounced('m');
    vi.advanceTimersByTime(399);
    debounced('mur');
    vi.advanceTimersByTime(399);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith('mur');
  });

  it('drops the pending call on cancel', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 400);

    debounced('dark');
    debounced.cancel();
    vi.advanceTimersByTime(400);

    expect(fn).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
