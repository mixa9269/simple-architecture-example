import { describe, expect, it } from 'vitest';
import { collectGenres } from './collectGenres';
import { makeShow } from './testFixtures';

describe('collectGenres', () => {
  it('returns unique genres sorted alphabetically', () => {
    const shows = [
      makeShow({ id: 1, genres: ['Drama', 'Crime'] }),
      makeShow({ id: 2, genres: ['Comedy', 'Drama'] }),
    ];

    expect(collectGenres(shows)).toEqual(['Comedy', 'Crime', 'Drama']);
  });

  it('returns an empty list when there are no shows or genres', () => {
    expect(collectGenres([])).toEqual([]);
    expect(collectGenres([makeShow({ genres: [] })])).toEqual([]);
  });
});
