import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePresenter } from './usePresenter';

const props = (overrides = {}) => ({
  value: 'forest',
  isLoading: false,
  onChange: vi.fn(),
  onClear: vi.fn(),
  ...overrides,
});

describe('SearchInput usePresenter', () => {
  it('passes the typed text on as a string', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => usePresenter(props({ onChange })));

    result.current.onChange({ currentTarget: { value: 'pine' } } as React.ChangeEvent<HTMLInputElement>);

    expect(onChange).toHaveBeenCalledWith('pine');
  });

  it('shows the clear button only for a typed, settled field', () => {
    expect(renderHook(() => usePresenter(props())).result.current.showClear).toBe(true);
    expect(renderHook(() => usePresenter(props({ isLoading: true }))).result.current.showClear).toBe(false);
    expect(renderHook(() => usePresenter(props({ value: '' }))).result.current.showClear).toBe(false);
  });

  it('clears the field', () => {
    const onClear = vi.fn();
    const { result } = renderHook(() => usePresenter(props({ onClear })));

    result.current.onClear();

    expect(onClear).toHaveBeenCalledOnce();
  });
});
