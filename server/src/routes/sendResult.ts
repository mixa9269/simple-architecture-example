import type { Response } from 'express';
import type { ApiError } from '~shared/api';
import type { ServerTaskResult, TaskError } from '~/lib/taskResult';

const STATUS: Record<TaskError['kind'], number> = {
  'bad-request': 400,
  unauthorized: 401,
  'not-found': 404,
  unavailable: 502,
  unexpected: 500,
};

/** Sends a task result: the data as JSON, or the error as `ApiError` with the matching status. */
export const sendResult = <T>(res: Response<T | ApiError>, result: ServerTaskResult<T>) => {
  if (result.ok) return res.json(result.data);
  return res.status(STATUS[result.error.kind]).json({ error: result.error.message });
};
