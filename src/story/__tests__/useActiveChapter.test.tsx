import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRef } from 'react';
import { useActiveChapter, CHAPTER_ROOT_MARGIN } from '../useActiveChapter';
import { installFakeIntersectionObserver } from '../../test-utils/media';

function mount(enabled: boolean) {
  const root = document.createElement('div');
  for (let i = 1; i <= 7; i++) {
    const block = document.createElement('div');
    block.dataset.chapter = String(i);
    root.appendChild(block);
  }
  document.body.appendChild(root);
  const hook = renderHook(() => {
    const ref = useRef<HTMLElement | null>(root);
    return useActiveChapter(ref, enabled);
  });
  return { root, hook, block: (n: number) => root.children[n - 1] };
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('useActiveChapter', () => {
  it('starts at chapter 0 and observes every chapter block with the upper-third band', () => {
    const IO = installFakeIntersectionObserver();
    const { hook } = mount(true);
    expect(hook.result.current).toBe(0);
    expect(IO.instances).toHaveLength(1);
    expect(IO.instances[0].observed).toHaveLength(7);
    expect(IO.instances[0].options?.rootMargin).toBe(CHAPTER_ROOT_MARGIN);
  });

  it('activates the highest chapter currently in the band', () => {
    const IO = installFakeIntersectionObserver();
    const { hook, block } = mount(true);
    act(() => IO.instances[0].fire([{ target: block(2), isIntersecting: true }]));
    expect(hook.result.current).toBe(2);
    act(() => IO.instances[0].fire([{ target: block(3), isIntersecting: true }]));
    expect(hook.result.current).toBe(3);
    act(() => IO.instances[0].fire([{ target: block(3), isIntersecting: false }]));
    expect(hook.result.current).toBe(2);
  });

  it('holds the last chapter when nothing is in the band below the story, and returns to 0 above it', () => {
    const IO = installFakeIntersectionObserver();
    const { hook, block } = mount(true);
    act(() => IO.instances[0].fire([{ target: block(7), isIntersecting: true }]));
    act(() => IO.instances[0].fire([{ target: block(7), isIntersecting: false, boundingClientRect: { top: -900 } }]));
    expect(hook.result.current).toBe(7);
    // Scrolled back above chapter 1: its block is below the viewport top.
    act(() => IO.instances[0].fire([{ target: block(1), isIntersecting: false, boundingClientRect: { top: 400 } }]));
    expect(hook.result.current).toBe(0);
  });

  it('does nothing when disabled, and when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    expect(mount(true).hook.result.current).toBe(0);
    const IO = installFakeIntersectionObserver();
    expect(mount(false).hook.result.current).toBe(0);
    expect(IO.instances).toHaveLength(0);
  });
});
