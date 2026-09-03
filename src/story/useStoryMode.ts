import { useEffect, useState } from 'react';

export type StoryMode = 'pinned' | 'stacked';

/**
 * One query, both conditions. The pinned layout needs room for two columns and it moves
 * the stage as you scroll, so a reduced-motion preference turns it off outright rather
 * than merely shortening its transitions. A viewport shorter than 720px cannot show a
 * pinned stage and its chapter at once, so it stacks too.
 */
export const PINNED_QUERY = '(min-width: 900px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)';

function read(): StoryMode {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'stacked';
  return window.matchMedia(PINNED_QUERY).matches ? 'pinned' : 'stacked';
}

export function useStoryMode(): StoryMode {
  const [mode, setMode] = useState<StoryMode>(read);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia(PINNED_QUERY);
    const onChange = () => setMode(mql.matches ? 'pinned' : 'stacked');
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return mode;
}
