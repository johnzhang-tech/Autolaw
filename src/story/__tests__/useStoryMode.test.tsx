import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useStoryMode, PINNED_QUERY } from '../useStoryMode';
import { mockMatchMedia } from '../../test-utils/media';

afterEach(() => vi.unstubAllGlobals());

describe('useStoryMode', () => {
  it('is stacked when matchMedia does not exist, so nothing pins in an environment it cannot measure', () => {
    vi.stubGlobal('matchMedia', undefined);
    expect(renderHook(() => useStoryMode()).result.current).toBe('stacked');
  });

  it('is pinned only when the viewport is wide and motion is not reduced', () => {
    mockMatchMedia(true);
    expect(renderHook(() => useStoryMode()).result.current).toBe('pinned');
    expect(window.matchMedia).toHaveBeenCalledWith(PINNED_QUERY);
  });

  it('is stacked when the query does not match', () => {
    mockMatchMedia(false);
    expect(renderHook(() => useStoryMode()).result.current).toBe('stacked');
  });

  it('asks for both conditions in one query', () => {
    expect(PINNED_QUERY).toContain('min-width: 900px');
    expect(PINNED_QUERY).toContain('prefers-reduced-motion: no-preference');
  });
});
