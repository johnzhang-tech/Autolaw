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
  const headingId = id ? `${id}-heading` : undefined;
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
