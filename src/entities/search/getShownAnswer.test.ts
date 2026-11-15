import { describe, expect, it } from 'vitest';
import { getShownAnswer } from './getShownAnswer';
import { makeAnswer, makeShow, makeShowsPage } from './testFixtures';

const found = makeAnswer({ result: makeShowsPage({ shows: [makeShow()] }) });
const empty = makeAnswer();
const failed = makeAnswer({ result: null, error: 'boom' });

describe('getShownAnswer', () => {
  it('shows the current answer once it has arrived', () => {
    expect(getShownAnswer('success', found)).toBe(found);
    expect(getShownAnswer('success', empty)).toBe(empty);
  });

  it('keeps found shows on screen while the next query, genre or page loads', () => {
    expect(getShownAnswer('loading', found)).toBe(found);
  });

  it('has nothing to keep after an empty or failed answer, or before the first one', () => {
    expect(getShownAnswer('loading', empty)).toBeNull();
    expect(getShownAnswer('loading', failed)).toBeNull();
    expect(getShownAnswer('loading', null)).toBeNull();
  });

  it('shows nothing for an empty field or an error', () => {
    expect(getShownAnswer('idle', found)).toBeNull();
    expect(getShownAnswer('error', failed)).toBeNull();
  });
});
