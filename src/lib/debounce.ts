/** A function that runs `fn` once the calls stop for `ms`; `.cancel()` drops the pending call. */
export interface Debounced<A extends unknown[]> {
  (...args: A): void;
  cancel: () => void;
}

/** Hand-written debounce: a utility, not a task (see .claude/rules/sa-tasks-layer.md). */
export const debounce = <A extends unknown[]>(fn: (...args: A) => unknown, ms: number) => {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const debounced = ((...args: A) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as Debounced<A>;

  debounced.cancel = () => clearTimeout(timer);
  return debounced;
};
