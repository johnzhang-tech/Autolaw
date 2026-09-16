import type { ReactNode } from 'react';
import './states.css';

/**
 * The navy ground every state is painted on.
 *
 * Stage.tsx owned this pair of classes until the story engine was deleted, at which point
 * the requirement became a sentence in a comment — and a sentence is not enforceable.
 * Every state sets inverse ink, so a state rendered without `al-stage` is white text on
 * the cream canvas; jsdom paints nothing, so no test catches it either. Rendering through
 * this component is the contract instead: the ground cannot be left behind.
 *
 * `al-on-navy` is not decoration beside it. It swaps --al-ring for its inverse, which is
 * what keeps the focus ring visible on the real controls the chronology states hold.
 *
 * The panel has no height of its own. The hero opts into a tall one so its composition
 * does not depend on which state is inside; a panel inside a feature card takes the height
 * of its content.
 */
export function StatePanel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`al-stage al-on-navy${className ? ` ${className}` : ''}`}>{children}</div>
  );
}
