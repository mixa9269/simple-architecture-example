// Builds the result every task returns (TaskResult); not a task itself, so it lives in lib/.
import type { TaskResult } from '~shared/taskResult';
import { TvmazeError } from '~/tvmaze/requestTvmaze';

/** Why a task failed; routes turn the kind into an HTTP status (routes/sendResult.ts). */
export interface TaskError {
  kind: 'bad-request' | 'unauthorized' | 'not-found' | 'unavailable' | 'unexpected';
  message: string;
}

export type ServerTaskResult<T> = TaskResult<T, TaskError>;

/** A task succeeded: `return success(data)` at the end of its `try`. */
export const success = <T>(data: T): ServerTaskResult<T> => ({ ok: true, data });

/** Bad input: the caller asked for something invalid. Not logged, it is not our failure. */
export const badRequest = (message: string): ServerTaskResult<never> => ({
  ok: false,
  error: { kind: 'bad-request', message },
});

/** No logged-in user: the client must log in first. Not logged, it is not our failure. */
export const unauthorized = (message: string): ServerTaskResult<never> => ({
  ok: false,
  error: { kind: 'unauthorized', message },
});

/** A task failed: `return failure(error)` in its `catch`. Logs the error and names its kind. */
export const failure = (error: unknown): ServerTaskResult<never> => {
  console.error(error);
  if (error instanceof TvmazeError && error.status === 404) {
    return { ok: false, error: { kind: 'not-found', message: 'Show not found' } };
  }
  if (error instanceof TvmazeError) {
    return { ok: false, error: { kind: 'unavailable', message: error.message } };
  }
  return { ok: false, error: { kind: 'unexpected', message: 'Something went wrong' } };
};
