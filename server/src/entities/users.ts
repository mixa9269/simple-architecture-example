import type { User } from '~shared/api';

/** In-memory users, keyed by their (normalized) email. A user exists once they have logged in. */
const users: Record<string, User> = {};

export function registerUser(email: string): User {
  users[email] ??= { email };
  return users[email];
}

export function hasUser(email: string): boolean {
  return email in users;
}

/** Tests only: start with no users. */
export function clearUsers() {
  for (const email of Object.keys(users)) delete users[email];
}
