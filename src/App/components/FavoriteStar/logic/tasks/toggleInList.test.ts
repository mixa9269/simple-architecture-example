import { describe, expect, it } from 'vitest';
import { makeShow } from '~/testUtils/fixtures';
import { toggleInList } from './toggleInList';

const [dark, fargo] = [1, 2].map((id) => makeShow({ id, name: `Show ${id}` }));

describe('toggleInList', () => {
  it('puts a new show first', () => {
    expect(toggleInList([fargo], dark)).toEqual([dark, fargo]);
  });

  it('removes a show that is there', () => {
    expect(toggleInList([dark, fargo], dark)).toEqual([fargo]);
  });
});
