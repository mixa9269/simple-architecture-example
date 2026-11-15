import { useEffect, useState } from 'react';

/**
 * True when `active` has lasted `ms` for the same `key` (e.g. one request waits for the server).
 * The flag is bound to the key, so a new key starts fresh without resetting anything.
 */
export function useIsSlow(key: unknown, active: boolean, ms = 3000): boolean {
  const [slowKey, setSlowKey] = useState<unknown>(null);

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setSlowKey(key), ms);
    return () => clearTimeout(timer);
  }, [key, active, ms]);

  return active && key !== null && slowKey === key;
}
