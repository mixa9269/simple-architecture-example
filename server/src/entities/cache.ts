/** One cached answer of the external API. */
export interface CacheEntry {
  data: unknown;
  /** Date.now() when the answer was stored */
  storedAt: number;
}

/** In-memory cache of TVmaze answers, keyed by the request path. */
const cache: Record<string, CacheEntry> = {};

export function readCache(key: string): CacheEntry | undefined {
  return cache[key];
}

export function writeCache(key: string, data: unknown, storedAt: number) {
  cache[key] = { data, storedAt };
}

/** Tests only: start from an empty cache. */
export function clearCache() {
  for (const key of Object.keys(cache)) delete cache[key];
}
