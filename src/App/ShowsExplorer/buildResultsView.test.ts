import { describe, expect, it } from 'vitest';
import { buildResultsView } from './buildResultsView';
import { makeShow } from './testFixtures';

const shows = [
  makeShow({ id: 1, genres: ['Drama'] }),
  makeShow({ id: 2, genres: ['Comedy'] }),
  makeShow({ id: 3, genres: ['Drama'] }),
  makeShow({ id: 4, genres: ['Drama'] }),
  makeShow({ id: 5, genres: ['Drama'] }),
];
const ids = (items: { id: number }[]) => items.map((show) => show.id);

describe('buildResultsView', () => {
  it('filters by genre and paginates the filtered shows', () => {
    const view = buildResultsView(shows, 'Drama', 2);

    expect(view.genres).toEqual(['Comedy', 'Drama']);
    expect(view.activeGenre).toBe('Drama');
    expect(view.totalPages).toBe(2);
    expect(ids(view.pageItems)).toEqual([5]);
  });

  it('ignores a genre that the shows do not have', () => {
    const view = buildResultsView(shows, 'Horror', 1);

    expect(view.activeGenre).toBeNull();
    expect(view.filteredShows).toHaveLength(5);
  });

  it('clamps a page that is out of range', () => {
    expect(buildResultsView(shows, null, 9).page).toBe(2);
    expect(buildResultsView([], null, 3).page).toBe(1);
  });
});
