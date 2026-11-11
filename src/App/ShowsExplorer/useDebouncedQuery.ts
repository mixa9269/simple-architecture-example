import { useEffect, useState } from 'react';

/**
 * Debounces typing, but applies an emptied field at once:
 * the request in flight is cancelled, and the same query typed back is a new request.
 */
export function useDebouncedQuery(query: string, delayMs: number): string {
  const [debounced, setDebounced] = useState(query);

  // Adjusting state while rendering: https://react.dev/learn/you-might-not-need-an-effect
  if (!query && debounced) setDebounced('');

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebounced(query), delayMs);
    return () => clearTimeout(timeoutId);
  }, [query, delayMs]);

  return debounced;
}
