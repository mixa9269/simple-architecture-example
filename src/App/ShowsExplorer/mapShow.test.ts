import { describe, expect, it } from 'vitest';
import { mapShow, stripHtml } from './mapShow';
import { makeTvmazeShow } from './testFixtures';

describe('mapShow', () => {
  it('maps a TVmaze show to the app model', () => {
    expect(mapShow(makeTvmazeShow())).toEqual({
      id: 1,
      name: 'Murder, She Wrote',
      genres: ['Drama', 'Crime'],
      imageUrl: 'https://img/medium.jpg',
      year: '1984',
      rating: 7.9,
      summary: 'A mystery writer & sleuth.',
      url: 'https://www.tvmaze.com/shows/1',
    });
  });

  it('handles missing optional fields', () => {
    const show = mapShow(
      makeTvmazeShow({ image: null, premiered: null, rating: null, summary: null, genres: null }),
    );

    expect(show.imageUrl).toBeNull();
    expect(show.year).toBeNull();
    expect(show.rating).toBeNull();
    expect(show.summary).toBe('');
    expect(show.genres).toEqual([]);
  });
});

describe('stripHtml', () => {
  it('removes tags and decodes entities', () => {
    expect(stripHtml('<p>Tom &amp; <i>Jerry</i></p>')).toBe('Tom & Jerry');
  });
});
