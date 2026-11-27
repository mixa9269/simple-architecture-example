import type { LoginAnswer } from '~shared/api';
import { registerUser } from '~/entities/users';
import { badRequest, failure, success, type ServerTaskResult } from '~/lib/taskResult';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The same address however it is typed: " Ann@Mail.com " → "ann@mail.com". */
export const normalizeEmail = (email: string) => email.trim().toLowerCase();

/**
 * Logs a user in by email — no password, no sign-up: the first login creates the user.
 * Logging in again with the same email gives back the same user (and their favorites).
 */
export const logIn = (rawEmail: string): ServerTaskResult<LoginAnswer> => {
  try {
    const email = normalizeEmail(rawEmail);
    if (!EMAIL.test(email)) return badRequest('Enter a valid email');
    return success({ user: registerUser(email) });
  } catch (error) {
    return failure(error);
  }
};
