import type { ReactNode } from 'react';
import './Section.css';

interface Props {
  id?: string;
  eyebrow?: string;
  heading?: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
  tone?: 'canvas' | 'navy';
}

export function Section({ id, eyebrow, heading, intro, children, tone = 'canvas' }: Props) {
  /*
   * Only label the landmark when the <h2> it points at actually renders. A dangling
   * aria-labelledby is worse than none: the reference resolves to nothing, the section
   * ends up with an empty accessible name, and it silently stops being exposed as a
   * region — so a landmark-labelling test would pass while the section is unlabelled.
   */
  const headingId = id && heading ? `${id}-heading` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`al-section al-sec al-sec--${tone}${tone === 'navy' ? ' al-on-navy' : ''}`}
    >
      <div className="al-container">
        {eyebrow && <p className="al-sec__eyebrow">{eyebrow}</p>}
        {heading && <h2 id={headingId} className="al-sec__heading">{heading}</h2>}
        {intro && <p className="al-sec__intro">{intro}</p>}
        {children}
      </div>
    </section>
  );
}
