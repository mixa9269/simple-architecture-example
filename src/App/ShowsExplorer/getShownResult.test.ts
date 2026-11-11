import { describe, expect, it } from 'vitest';
import { getShownResult } from './getShownResult';
import { makeResult, makeShow } from './testFixtures';

const found = makeResult({ shows: [makeShow()] });

describe('getShownResult', () => {
  it('shows the current result once it has arrived', () => {
    expect(getShownResult('success', found)).toBe(found);
    expect(getShownResult('success', makeResult())).toEqual(makeResult());
  });

  it('keeps found shows on screen while the next query loads', () => {
    expect(getShownResult('loading', found)).toBe(found);
  });

  it('has nothing to keep after an empty or failed answer, or before the first one', () => {
    expect(getShownResult('loading', makeResult())).toBeNull();
    expect(getShownResult('loading', makeResult({ error: 'boom' }))).toBeNull();
    expect(getShownResult('loading', null)).toBeNull();
  });

  it('shows nothing for an empty field or an error', () => {
    expect(getShownResult('idle', found)).toBeNull();
    expect(getShownResult('error', makeResult({ error: 'boom' }))).toBeNull();
  });
});
