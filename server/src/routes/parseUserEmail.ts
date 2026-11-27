import type { Request } from 'express';
import { normalizeEmail } from '~/tasks/logIn';

/** The identity of a request: the `X-User-Email` header (null when absent). */
export const parseUserEmail = (req: Request): string | null => {
  const email = req.get('X-User-Email');
  return email ? normalizeEmail(email) : null;
};
