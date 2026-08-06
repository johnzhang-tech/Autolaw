import { Button } from '../components/primitives/Button';
import { SignalCockpit } from './SignalCockpit';
import { TRIAL_URL, WALKTHROUGH_URL } from '../config';
import './Hero.css';

/*
 * "SOC 2 Type II & HIPAA" put the two on one line as if they were the same kind of thing.
 * SOC 2 Type II is an audited attestation; HIPAA has no certifying body, and what a firm
 * can actually receive is a signed BAA. See the note on CERTIFICATIONS in config.ts.
 */
const TRUST = [
  'Source-linked evidence',
  'Attorney confirms every fact',
  'Auditable access',
  'SOC 2 Type II · BAA on request',
];

function Tick() {
  return (
    <svg className="al-hero__tick" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2 6.5l2.5 2.5L10 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Hero() {
  /*
   * Deliberately a <div>, not a <header>. Hero sits inside <main>, where HTML-AAM maps
   * <header> to generic rather than banner — but only in implementations that apply the
   * element-scoping constraint. @testing-library/dom 10.4.1 does not (aria-query 5.3.0
   * declares the constraint; the role resolver builds its selector from the element name
   * and attributes only), so a <header> here is reported as a second banner landmark
   * sitting inside main. The tag bought nothing — every style here is class-based and no
   * landmark is wanted for the lead content — so the ambiguity is not worth carrying.
   */
  return (
    <div className="al-section al-hero">
      <div className="al-container al-hero__grid">
        <div>
          <p className="al-sec__eyebrow">
            AI-native case intelligence for personal injury &amp; workers&rsquo; compensation firms
          </p>
          <h1 className="al-hero__title">
            Turn case complexity into legal advantage. Know where every fact came from.
          </h1>
          <p className="al-hero__sub">
            Autolaw reads the intake calls, medical records, and expert reports in a file and
            builds one connected case file &mdash; every fact citing its document, page, and
            sentence. Where two records disagree, you see both.
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
    </div>
  );
}
