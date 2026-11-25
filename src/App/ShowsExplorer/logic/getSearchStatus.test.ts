import { describe, expect, it } from 'vitest';
import { getSearchStatus } from './getSearchStatus';

const params = { query: 'murder', genre: null, page: 1 };
const settled = { query: 'murder', params, isFetching: false, error: null };

describe('getSearchStatus', () => {
  it('is idle for an empty field', () => {
    expect(getSearchStatus({ ...settled, query: '  ', params: null })).toBe('idle');
  });

  it('is loading while the typed text is not asked yet (debounce) or is being fetched', () => {
    expect(getSearchStatus({ ...settled, query: 'murd' })).toBe('loading');
    expect(getSearchStatus({ ...settled, params: null })).toBe('loading');
    expect(getSearchStatus({ ...settled, isFetching: true })).toBe('loading');
  });

  it('reports success or error once the answer has arrived', () => {
    expect(getSearchStatus(settled)).toBe('success');
    expect(getSearchStatus({ ...settled, query: ' murder ' })).toBe('success');
    expect(getSearchStatus({ ...settled, error: 'boom' })).toBe('error');
  });
});
