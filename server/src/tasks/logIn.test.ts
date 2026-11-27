import { beforeEach, describe, expect, it } from 'vitest';
import { clearUsers, hasUser } from '~/entities/users';
import { logIn } from './logIn';

beforeEach(() => {
  clearUsers();
});

describe('logIn', () => {
  it('registers the normalized email', () => {
    expect(logIn(' Ann@Mail.com ')).toEqual({ ok: true, data: { user: { email: 'ann@mail.com' } } });
    expect(hasUser('ann@mail.com')).toBe(true);
  });

  it('rejects an invalid email without registering anything', () => {
    expect(logIn('ann@')).toEqual({
      ok: false,
      error: { kind: 'bad-request', message: 'Enter a valid email' },
    });
    expect(hasUser('ann@')).toBe(false);
  });
});
