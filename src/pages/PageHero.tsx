import type { ReactNode } from 'react';
import './PageHero.css';

interface Props {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
}

/**
 * The lead block of a standalone page: eyebrow, the page's single <h1>, and a standfirst.
 *
 * A <div>, not a <header>, for the reason recorded in Hero.tsx: it sits inside <main>,
 * where HTML-AAM scopes <header> to generic — but @testing-library/dom's role resolver
 * does not apply that constraint, so a <header> here reads as a second banner landmark.
 * No landmark is wanted for lead content, so the tag buys nothing and costs ambiguity.
 */
export function PageHero({ eyebrow, title, intro, children }: Props) {
  return (
    <div className="al-section al-phero">
      <div className="al-container al-phero__inner">
        <p className="al-sec__eyebrow">{eyebrow}</p>
        <h1 className="al-phero__title">{title}</h1>
        {intro && <p className="al-phero__sub">{intro}</p>}
        {children}
      </div>
    </div>
  );
}
