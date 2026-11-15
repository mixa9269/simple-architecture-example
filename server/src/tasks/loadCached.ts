import { readCache, writeCache } from '~/entities/cache';

export const CACHE_TTL_MS = 5 * 60_000;

/**
 * Loads data at most once per CACHE_TTL_MS for the same key:
 * `await loadCached('search:girls', () => tvmaze.shows.search('girls'))`.
 * Fewer calls to the external API. An inner helper: it throws, the calling task catches.
 */
export const loadCached = async <T>(key: string, load: () => Promise<T>): Promise<T> => {
  const now = Date.now();
  const cached = readCache(key);
  if (cached && now - cached.storedAt < CACHE_TTL_MS) return cached.data as T;

  const data = await load();
  writeCache(key, data, now);
  return data;
};
