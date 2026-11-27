import type { LoginAnswer, LoginRequest } from '~shared/api';
import { callApi } from './callApi';

/** /api/login — email-only login, no password. */
export const auth = {
  login: (email: string) =>
    callApi<LoginAnswer>('/api/login', { method: 'POST', body: { email } satisfies LoginRequest }),
};
