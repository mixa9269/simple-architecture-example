import { describe, expect, it } from 'vitest';
import { getReturnPath } from './getReturnPath';

describe('getReturnPath', () => {
  it('goes back to the page that sent the user to log in', () => {
    expect(getReturnPath({ from: '/?q=dark&page=2' })).toBe('/?q=dark&page=2');
  });

  it('goes home without a usable `from`', () => {
    expect(getReturnPath(null)).toBe('/');
    expect(getReturnPath({ from: 'https://evil.example' })).toBe('/');
    expect(getReturnPath({ from: '/login' })).toBe('/');
  });
});
