import { Button } from '../components/primitives/Button';
import { usePractice, type Practice } from '../practice/PracticeContext';
import { PRACTICE_CLOSING } from '../data/demoCase';
import { TRIAL_ENABLED, TRIAL_URL } from '../config';
import './Conversion.css';

const AREAS: Array<{ key: Practice; label: string }> = [
  { key: 'PI', label: 'Personal injury' },
  { key: 'WC', label: 'Workers’ compensation' },
];

/**
 * Practice-specific, from the choice made in Solutions. The button carries the practice
 * to the call page so its first question is already answered.
 */
export function Conversion() {
  const { practice, setPractice } = usePractice();
  const closing = PRACTICE_CLOSING[practice];
  return (
    <section id="contact" className="al-section al-conv al-on-navy" aria-labelledby="conv-heading">
      <div className="al-container al-conv__inner">
        <h2 id="conv-heading" className="al-conv__title">{closing.heading}</h2>
        <div className="al-conv__switch" role="group" aria-label="Practice">
          {AREAS.map((a) => (
            <button key={a.key} type="button" aria-pressed={practice === a.key} onClick={() => setPractice(a.key)}>{a.label}</button>
          ))}
        </div>
        <p className="al-conv__sub">{closing.body}</p>
        <div className="al-conv__ctas">
          <Button href={closing.href} variant="inverse" size="lg" withCaret>Schedule a call</Button>
          {TRIAL_ENABLED && (
            <Button href={TRIAL_URL} variant="inverse-secondary" size="lg">Analyze one report</Button>
          )}
        </div>
        {TRIAL_ENABLED && (
          <p className="al-conv__fine">Or upload one QME, AME, or IME report and see it chronologized, with every fact cited to its page.</p>
        )}
      </div>
    </section>
  );
}
