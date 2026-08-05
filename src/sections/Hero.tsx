import { Button } from '../components/primitives/Button';
import { SignalCockpit } from './SignalCockpit';
import { TRIAL_URL, WALKTHROUGH_URL } from '../config';
import './Hero.css';

const TRUST = [
  'Source-linked evidence',
  'Human review controls',
  'Auditable access',
  'SOC 2 Type II & HIPAA',
];

function Tick() {
  return (
    <svg className="al-hero__tick" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2 6.5l2.5 2.5L10 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Hero() {
  return (
    <header className="al-section al-hero">
      <div className="al-container al-hero__grid">
        <div>
          <p className="al-hero__eyebrow">
            AI-native case intelligence for personal injury &amp; workers&rsquo; compensation firms
          </p>
          <h1 className="al-hero__title">Turn case complexity into legal advantage.</h1>
          <p className="al-hero__sub">
            Autolaw transforms intake calls, medical records, expert reports, and case files
            into a living, source-linked Case Brain &mdash; helping your team understand the
            case, uncover missing evidence, and prepare stronger work product faster.
          </p>
          <div className="al-hero__ctas">
            <Button href={TRIAL_URL} variant="primary" size="lg" withCaret>
              Analyze one case
            </Button>
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
        <SignalCockpit />
      </div>
    </header>
  );
}
