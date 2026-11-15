import { describe, expect, it } from 'vitest';
import { clampPage, getTotalPages, PAGE_SIZE, paginate } from './paginate';

const items = [1, 2, 3, 4, 5, 6, 7];

describe('paginate', () => {
  it('uses 3 items per page', () => {
    expect(PAGE_SIZE).toBe(3);
    expect(paginate(items, 1)).toEqual([1, 2, 3]);
    expect(paginate(items, 2)).toEqual([4, 5, 6]);
    expect(paginate(items, 3)).toEqual([7]);
  });

  it('counts total pages, at least one', () => {
    expect(getTotalPages(7)).toBe(3);
    expect(getTotalPages(6)).toBe(2);
    expect(getTotalPages(0)).toBe(1);
  });

  it('clamps the page into the valid range', () => {
    expect(clampPage(5, 3)).toBe(3);
    expect(clampPage(0, 3)).toBe(1);
    expect(clampPage(2, 3)).toBe(2);
  });
});
