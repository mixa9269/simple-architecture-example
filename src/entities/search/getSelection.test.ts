import { describe, expect, it } from 'vitest';
import { getSelection } from './getSelection';
import { makeShowsPage } from './testFixtures';

const request = { query: 'forest', genre: 'Drama', page: 2 };

describe('getSelection', () => {
  it('follows the request while it loads, so the controls respond at once', () => {
    expect(getSelection('loading', request, makeShowsPage())).toEqual({ genre: 'Drama', page: 2 });
  });

  it('follows what the server applied once the answer arrived', () => {
    const result = makeShowsPage({ genre: null, page: 1 }); // genre dropped, page clamped
    expect(getSelection('success', request, result)).toEqual({ genre: null, page: 1 });
  });

  it('falls back to all genres and page 1 without results', () => {
    expect(getSelection('idle', null, null)).toEqual({ genre: null, page: 1 });
    expect(getSelection('error', request, null)).toEqual({ genre: null, page: 1 });
  });
});
