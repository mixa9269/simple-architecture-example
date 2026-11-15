// Builds the result every task returns (TaskResult); not a task itself, so it lives in lib/.
import type { TaskResult } from '~shared/taskResult';

export type { TaskResult } from '~shared/taskResult';

/** A task succeeded: `return success(data)` at the end of its `try`. */
export const success = <T>(data: T): TaskResult<T> => ({ ok: true, data });

/**
 * A task failed: `return failure(error, signal)` in its `catch`.
 * Logs the error (not for a cancelled request) and reports its message to the presenter.
 */
export const failure = (error: unknown, signal?: AbortSignal): TaskResult<never> => {
  if (!signal?.aborted) console.error(error);
  return { ok: false, error: error instanceof Error ? error.message : 'Something went wrong' };
};
