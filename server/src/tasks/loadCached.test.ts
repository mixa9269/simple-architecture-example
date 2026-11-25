import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearCache } from '~/entities/cache';
import { CACHE_TTL_MS, loadCached } from './loadCached';

beforeEach(() => {
  vi.useFakeTimers();
  clearCache();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('loadCached', () => {
  it('answers the same key from the cache within 5 minutes', async () => {
    const load = vi.fn(async () => [{ id: 1 }]);

    await loadCached('search:girls', load);
    vi.advanceTimersByTime(CACHE_TTL_MS - 1);

    expect(await loadCached('search:girls', load)).toEqual([{ id: 1 }]);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('loads again when the cache entry is 5 minutes old', async () => {
    const load = vi.fn().mockResolvedValueOnce('old').mockResolvedValueOnce('new');

    await loadCached('show:1', load);
    vi.advanceTimersByTime(CACHE_TTL_MS);

    expect(await loadCached('show:1', load)).toBe('new');
    expect(await loadCached('show:1', load)).toBe('new');
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('keeps different keys apart', async () => {
    const load = vi.fn(async () => []);

    await loadCached('search:a', load);
    await loadCached('search:b', load);

    expect(load).toHaveBeenCalledTimes(2);
  });

  it('does not cache a failure: it throws, the calling task catches', async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error('down')).mockResolvedValueOnce('ok');

    await expect(loadCached('show:1', load)).rejects.toThrow('down');
    expect(await loadCached('show:1', load)).toBe('ok');
  });
});
