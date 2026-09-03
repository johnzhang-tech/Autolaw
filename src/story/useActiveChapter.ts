import { useEffect, useState, type RefObject } from 'react';
import type { ChapterIndex } from './chapters';

/**
 * A chapter is active while its block crosses the band between 33% and 40% down the
 * viewport — roughly the upper third, where a reader's eye rests. Negative margins shrink
 * the observer's root to that band.
 */
export const CHAPTER_ROOT_MARGIN = '-33% 0px -60% 0px';

/**
 * Which chapter the reader is on. Observes every `[data-chapter]` descendant of
 * `container`. The highest chapter in the band wins, so a tall block that is still in
 * view does not pull the stage back while the next heading is being read. When nothing
 * is in the band the last value is kept — below chapter 7 the stage has unpinned anyway —
 * except when chapter 1 is still below the viewport top, which means the reader is back
 * in the hero and state 0 is right.
 */
export function useActiveChapter(
  container: RefObject<HTMLElement | null>,
  enabled: boolean,
): ChapterIndex {
  const [active, setActive] = useState<ChapterIndex>(0);
  const [wasEnabled, setWasEnabled] = useState(enabled);

  // Reset to chapter 0 the moment `enabled` goes false, adjusted during render (React's
  // documented pattern) rather than in the effect below, so there is no extra render
  // between the flag flipping and the reset taking effect.
  if (enabled !== wasEnabled) {
    setWasEnabled(enabled);
    if (!enabled) setActive(0);
  }

  useEffect(() => {
    if (!enabled) return;
    const root = container.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;

    const blocks = [...root.querySelectorAll<HTMLElement>('[data-chapter]')];
    const inBand = new Set<number>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const n = Number((entry.target as HTMLElement).dataset.chapter);
          if (entry.isIntersecting) inBand.add(n);
          else inBand.delete(n);
        }
        if (inBand.size > 0) {
          setActive(Math.max(...inBand) as ChapterIndex);
          return;
        }
        const first = entries.find((e) => (e.target as HTMLElement).dataset.chapter === '1');
        if (first && first.boundingClientRect.top > 0) setActive(0);
      },
      { rootMargin: CHAPTER_ROOT_MARGIN, threshold: 0 },
    );

    blocks.forEach((b) => io.observe(b));
    return () => io.disconnect();
  }, [container, enabled]);

  return active;
}
