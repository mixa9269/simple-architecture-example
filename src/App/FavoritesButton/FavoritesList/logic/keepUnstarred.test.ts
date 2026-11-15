import { describe, expect, it } from 'vitest';
import { makeShow } from '~/testUtils/fixtures';
import { keepUnstarred } from './keepUnstarred';

const [dark, fargo, pine] = [1, 2, 3].map((id) => makeShow({ id, name: `Show ${id}` }));

describe('keepUnstarred', () => {
  it('keeps an unstarred show in its place', () => {
    expect(keepUnstarred([dark, fargo, pine], [dark, pine])).toEqual([dark, fargo, pine]);
  });

  it('puts shows that appeared after opening first', () => {
    expect(keepUnstarred([fargo], [pine, fargo])).toEqual([pine, fargo]);
    expect(keepUnstarred([], [dark, fargo])).toEqual([dark, fargo]); // loaded after opening
  });

  it('keeps the order of the opened list when a show is starred back', () => {
    expect(keepUnstarred([dark, fargo], [fargo, dark])).toEqual([dark, fargo]);
  });
});
