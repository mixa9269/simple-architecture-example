import { hasUser } from '~/entities/users';
import { success, unauthorized, type ServerTaskResult } from '~/lib/taskResult';

/**
 * The logged-in user of a request (inner helper of the favorites tasks).
 * An email that never logged in — or was forgotten by a server restart — must log in again.
 */
export const requireUser = (email: string | null): ServerTaskResult<string> =>
  email && hasUser(email) ? success(email) : unauthorized('Log in to use favorites');
