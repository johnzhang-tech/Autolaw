import { useRef } from 'react';
import { Hero } from '../sections/Hero';
import { CHAPTERS } from './chapters';
import { Stage, InlineState } from './Stage';
import { ChapterList } from './ChapterList';
import { useStoryMode } from './useStoryMode';
import { useActiveChapter } from './useActiveChapter';
import './Story.css';

/**
 * The top of the home page: hero copy, then seven chapters, beside one stage that pins
 * and changes as the chapters pass. One grid holds both columns so the stage can stay
 * put from the first paint to chapter 7.
 *
 * Stacked mode (narrow, or reduced motion, or no matchMedia): no sticky column, no
 * observer, no transitions. The same state components render inline under each chapter.
 */
export function Story() {
  const mode = useStoryMode();
  const grid = useRef<HTMLDivElement>(null);
  const active = useActiveChapter(grid, mode === 'pinned');
  const pinned = mode === 'pinned';

  return (
    <section
      id="story"
      className="al-section al-story"
      aria-labelledby="story-heading"
      data-mode={mode}
      tabIndex={-1}
    >
      <div className="al-container al-story__grid" ref={grid}>
        <div className="al-story__copy">
          <Hero />
          <h2 id="story-heading" className="al-visually-hidden">How Autolaw works, on one matter</h2>

          {!pinned && (
            <div className="al-story__inline"><InlineState chapter={0} /></div>
          )}

          <ol className="al-story__chapters">
            {CHAPTERS.map((c) => (
              <li
                key={c.id}
                id={c.id}
                data-chapter={c.index}
                data-active={pinned && active === c.index ? '' : undefined}
                className="al-chapter"
                tabIndex={-1}
              >
                <p className="al-chapter__n">Chapter {c.index}</p>
                <h3 className="al-chapter__h">{c.heading}</h3>
                <p className="al-chapter__p">{c.body}</p>
                {!pinned && (
                  <div className="al-story__inline"><InlineState chapter={c.index} /></div>
                )}
              </li>
            ))}
          </ol>
        </div>

        {pinned && (
          <div className="al-story__stage">
            <ChapterList active={active} />
            <Stage chapter={active} />
          </div>
        )}
      </div>
    </section>
  );
}
