import { Button } from '../components/primitives/Button';
import { TRIAL_ENABLED, TRIAL_URL, SCHEDULE_URL, HOW_IT_WORKS_URL, WALKTHROUGH_URL } from '../config';
import '../components/primitives/Section.css';
import './Hero.css';

const TRUST = [
  'Source-linked evidence',
  'Attorney confirms every fact',
  'SOC 2 Type II',
  'BAA on request',
];

function Tick() {
  return (
    <svg className="al-hero__tick" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2 6.5l2.5 2.5L10 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The h1 doubles as the name of the section around it, so HeroSection can point
 * aria-labelledby here instead of repeating the copy in an aria-label. Exported rather
 * than spelled out at both ends: an id that is typed twice is an id that drifts, and a
 * dangling aria-labelledby costs the landmark its name silently.
 */
export const HERO_HEADING_ID = 'hero-heading';

/**
 * Copy only. The panel beside it belongs to HeroSection, which owns the grid both sit in.
 * One-sentence H1 so the panel is the second thing a visitor sees rather than the fifth;
 * the old headline lives on in <title> and og:title.
 */
export function Hero() {
  return (
    <div className="al-hero">
      <p className="al-sec__eyebrow">
        Case intelligence for personal injury &amp; workers&rsquo; compensation firms
      </p>
      <h1 id={HERO_HEADING_ID} className="al-hero__title">Know where every fact came from.</h1>
      <p className="al-hero__sub">
        Autolaw reads the medical records, expert reports, and case documents in a file and
        builds one connected case file. Every fact cites its document, page, and sentence.
        Where two records disagree, you see both.
      </p>
      <div className="al-hero__ctas">
        <Button href={SCHEDULE_URL} variant="primary" size="lg" withCaret>
          Schedule a call
        </Button>
        <Button href={HOW_IT_WORKS_URL} variant="secondary" size="lg">
          See how it works
        </Button>
        {TRIAL_ENABLED && (
          <Button href={TRIAL_URL} variant="secondary" size="lg">
            Analyze one report
          </Button>
        )}
        {WALKTHROUGH_URL && (
          <Button href={WALKTHROUGH_URL} variant="secondary" size="lg">
            Watch a 3-minute case walkthrough
          </Button>
        )}
      </div>
      <ul className="al-hero__strip">
        {TRUST.map((t) => (
          <li key={t}><Tick />{t}</li>
        ))}
      </ul>
    </div>
  );
}
