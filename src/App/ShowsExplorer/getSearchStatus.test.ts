import { describe, expect, it } from 'vitest';
import { getSearchStatus } from './getSearchStatus';
import { makeAnswer } from './testFixtures';

const request = { query: 'murder' };
const success = makeAnswer({ request });
const failure = makeAnswer({ request, error: 'boom' });

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
    expect(getSearchStatus('murder', { query: 'murder' }, success)).toBe('loading'); // retry
  });

  it('reports success or error for the current request', () => {
    expect(getSearchStatus('murder', request, success)).toBe('success');
    expect(getSearchStatus('murder', request, failure)).toBe('error');
  });
});
