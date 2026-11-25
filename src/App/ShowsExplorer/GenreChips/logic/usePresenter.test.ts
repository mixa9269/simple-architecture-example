import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePresenter } from './usePresenter';

describe('GenreChips usePresenter', () => {
  it('adds "All" in front of the genres and selects it without a genre', () => {
    const { result } = renderHook(() =>
      usePresenter({ genres: ['Comedy', 'Drama'], selectedGenre: null, onChange: vi.fn() }),
    );

    expect(result.current.items.map((item) => item.label)).toEqual(['All', 'Comedy', 'Drama']);
    expect(result.current.value).toBe('__all__');
  });

  it('reports a genre, and null for "All"', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      usePresenter({ genres: ['Drama'], selectedGenre: 'Drama', onChange }),
    );
    expect(result.current.value).toBe('Drama');

    result.current.onChange('Drama');
    result.current.onChange('__all__');

    expect(onChange.mock.calls).toEqual([['Drama'], [null]]);
  });
});
