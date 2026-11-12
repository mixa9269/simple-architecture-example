import { describe, expect, it } from 'vitest';
import { getShownAnswer } from './getShownAnswer';
import { makeAnswer, makeShow } from './testFixtures';

const found = makeAnswer({ shows: [makeShow()] });

describe('getShownAnswer', () => {
  it('shows the current answer once it has arrived', () => {
    expect(getShownAnswer('success', found)).toBe(found);
    const empty = makeAnswer();
    expect(getShownAnswer('success', empty)).toBe(empty);
  });

  it('keeps found shows on screen while the next query loads', () => {
    expect(getShownAnswer('loading', found)).toBe(found);
  });

  it('has nothing to keep after an empty or failed answer, or before the first one', () => {
    expect(getShownAnswer('loading', makeAnswer())).toBeNull();
    expect(getShownAnswer('loading', makeAnswer({ error: 'boom' }))).toBeNull();
    expect(getShownAnswer('loading', null)).toBeNull();
  });

  it('shows nothing for an empty field or an error', () => {
    expect(getShownAnswer('idle', found)).toBeNull();
    expect(getShownAnswer('error', makeAnswer({ error: 'boom' }))).toBeNull();
  });
});
