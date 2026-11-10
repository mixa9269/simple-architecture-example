import { describe, expect, it } from 'vitest';
import { getSearchStatus } from './getSearchStatus';

const success = { key: 'murder#0', shows: [], error: null };
const failure = { key: 'murder#0', shows: [], error: 'boom' };

describe('getSearchStatus', () => {
  it('is idle for an empty query', () => {
    expect(getSearchStatus('', '', '#0', null)).toBe('idle');
  });

  it('is loading while the query is being debounced', () => {
    expect(getSearchStatus('murd', 'mur', 'mur#0', null)).toBe('loading');
  });

  it('is loading until the result for the current request arrives', () => {
    expect(getSearchStatus('murder', 'murder', 'murder#0', null)).toBe('loading');
    expect(getSearchStatus('murder', 'murder', 'murder#1', success)).toBe('loading');
  });

  it('reports success or error for the current request', () => {
    expect(getSearchStatus('murder', 'murder', 'murder#0', success)).toBe('success');
    expect(getSearchStatus('murder', 'murder', 'murder#0', failure)).toBe('error');
  });
});
