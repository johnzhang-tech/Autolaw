import type { ChapterIndex } from './chapters';
import { Signals } from './states/Signals';
import { Arrival } from './states/Arrival';
import { ChronologyState, phaseFor } from './states/ChronologyState';
import { AskPreview } from './states/AskPreview';
import { Review } from './states/Review';
import { Output } from './states/Output';
import './Stage.css';

interface StageProps {
  chapter: ChapterIndex;
  /** Entry transitions. Off for the inline (stacked) copies, which never change state. */
  animate?: boolean;
}

/**
 * The navy panel. Renders one state per chapter. A labelled region rather than
 * aria-hidden: it holds real controls in the chronology states, and hidden focusable
 * content is an accessibility failure. No live region either — the chapter text beside
 * it is the narrative, and announcing every transition would be noise.
 */
export function Stage({ chapter, animate = true }: StageProps) {
  return (
    <div
      className={`al-stage al-on-navy${animate ? ' al-stage--live' : ''}`}
      data-chapter={chapter}
      data-testid="stage"
      role="region"
      aria-label="Demonstration of one matter"
    >
      <StageState chapter={chapter} animate={animate} />
    </div>
  );
}

/** The inline copy used by the stacked layout: same panel, no transitions, no region role
 *  (the chapter heading above it is its label there). */
export function InlineState({ chapter }: { chapter: ChapterIndex }) {
  return (
    <div className="al-stage al-on-navy" data-chapter={chapter} data-testid="stage">
      <StageState chapter={chapter} animate={false} />
    </div>
  );
}

export function StageState({ chapter, animate = true }: { chapter: ChapterIndex; animate?: boolean }) {
  switch (chapter) {
    case 0: return <Signals />;
    case 1: return <Arrival animate={animate} />;
    case 2:
    case 3:
    case 4: return <ChronologyState key="chronology" phase={phaseFor(chapter)} />;
    case 5: return <AskPreview />;
    case 6: return <Review />;
    case 7: return <Output />;
  }
}
