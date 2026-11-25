import { describe, expect, it } from 'vitest';
import { buildSearchUrl, getUrlState, readSearchUrl } from './searchUrl';

const state = { query: 'murder', genre: 'Drama', page: 2 };

describe('readSearchUrl', () => {
  it('reads the query, genre and page', () => {
    expect(readSearchUrl('?q=murder&genre=Drama&page=2')).toEqual(state);
  });

  it('falls back to defaults for missing or invalid values', () => {
    expect(readSearchUrl('')).toEqual({ query: '', genre: null, page: 1 });
    expect(readSearchUrl('?q=%20x%20&genre=&page=-3').page).toBe(1);
    expect(readSearchUrl('?q=%20x%20&page=1.5')).toEqual({ query: 'x', genre: null, page: 1 });
  });
});

describe('buildSearchUrl', () => {
  it('writes only non-default values', () => {
    expect(buildSearchUrl(state)).toBe('?q=murder&genre=Drama&page=2');
    expect(buildSearchUrl({ query: 'kill bill', genre: null, page: 1 })).toBe('?q=kill+bill');
  });

  it('writes nothing without a query', () => {
    expect(buildSearchUrl({ query: '', genre: 'Drama', page: 2 })).toBe('');
  });

  it('round-trips through readSearchUrl', () => {
    expect(readSearchUrl(buildSearchUrl(state))).toEqual(state);
  });
});

describe('getUrlState', () => {
  it('keeps the URL while a query loads', () => {
    expect(getUrlState('loading', state)).toBeNull();
  });

  it('writes the full state on success and only the query otherwise', () => {
    expect(getUrlState('success', state)).toBe(state);
    expect(getUrlState('error', state)).toEqual({ query: 'murder', genre: null, page: 1 });
    expect(getUrlState('idle', { ...state, query: '' })).toEqual({ query: '', genre: null, page: 1 });
  });
});
