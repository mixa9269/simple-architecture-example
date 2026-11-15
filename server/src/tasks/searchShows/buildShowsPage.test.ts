import { describe, expect, it } from 'vitest';
import { makeShow } from '~/testFixtures';
import { buildShowsPage } from './buildShowsPage';

const shows = [
  makeShow({ id: 1, genres: ['Drama'] }),
  makeShow({ id: 2, genres: ['Comedy'] }),
  makeShow({ id: 3, genres: ['Drama'] }),
  makeShow({ id: 4, genres: ['Drama'] }),
  makeShow({ id: 5, genres: ['Drama'] }),
];
const ids = (items: { id: number }[]) => items.map((show) => show.id);

describe('buildShowsPage', () => {
  it('filters by genre and paginates the filtered shows', () => {
    const page = buildShowsPage('forest', shows, 'Drama', 2);

    expect(page).toMatchObject({
      query: 'forest',
      genres: ['Comedy', 'Drama'],
      genre: 'Drama',
      page: 2,
      totalPages: 2,
      total: 5,
      filteredTotal: 4,
    });
    expect(ids(page.shows)).toEqual([5]);
  });

  it('ignores a genre that the shows do not have', () => {
    const page = buildShowsPage('forest', shows, 'Horror', 1);

    expect(page.genre).toBeNull();
    expect(page.filteredTotal).toBe(5);
  });

  it('clamps a page that is out of range', () => {
    expect(buildShowsPage('forest', shows, null, 9).page).toBe(2);
    expect(buildShowsPage('forest', [], null, 3).page).toBe(1);
  });
});
