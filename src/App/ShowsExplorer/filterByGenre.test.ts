import { describe, expect, it } from 'vitest';
import { filterByGenre } from './filterByGenre';
import { makeShow } from './testFixtures';

const drama = makeShow({ id: 1, genres: ['Drama'] });
const comedy = makeShow({ id: 2, genres: ['Comedy'] });
const dramedy = makeShow({ id: 3, genres: ['Comedy', 'Drama'] });
const shows = [drama, comedy, dramedy];

describe('filterByGenre', () => {
  it('returns all shows when no genre is selected', () => {
    expect(filterByGenre(shows, null)).toBe(shows);
  });

  it('keeps only shows of the selected genre', () => {
    expect(filterByGenre(shows, 'Comedy')).toEqual([comedy, dramedy]);
  });

  it('returns an empty list when no show matches', () => {
    expect(filterByGenre(shows, 'Horror')).toEqual([]);
  });
});
