import { describe, expect, it } from 'vitest';
import { getSearchStatus } from './getSearchStatus';
import { makeAnswer } from './testFixtures';

const request = { query: 'murder', genre: null, page: 1 };
const success = makeAnswer({ request });
const failure = makeAnswer({ request, result: null, error: 'boom' });

describe('getSearchStatus', () => {
  it('is idle for an empty field', () => {
    expect(getSearchStatus('', null, null)).toBe('idle');
  });

  it('is loading while the field is not committed as a request yet', () => {
    expect(getSearchStatus('murd', null, null)).toBe('loading');
    expect(getSearchStatus('murde', request, success)).toBe('loading');
  });

  it('is loading until the answer to the current request arrives', () => {
    expect(getSearchStatus('murder', request, null)).toBe('loading');
    expect(getSearchStatus('murder', { ...request }, success)).toBe('loading'); // retry
    expect(getSearchStatus('murder', { ...request, page: 2 }, success)).toBe('loading'); // next page
  });

  it('reports success or error for the current request', () => {
    expect(getSearchStatus('murder', request, success)).toBe('success');
    expect(getSearchStatus('murder', request, failure)).toBe('error');
  });
});
