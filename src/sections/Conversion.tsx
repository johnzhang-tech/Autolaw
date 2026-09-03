import { Button } from '../components/primitives/Button';
import { SCHEDULE_URL, TRIAL_ENABLED, TRIAL_URL } from '../config';
import './Conversion.css';

export function Conversion() {
  return (
    <section id="contact" className="al-section al-conv al-on-navy" aria-labelledby="conv-heading">
      <div className="al-container al-conv__inner">
        <h2 id="conv-heading" className="al-conv__title">Prove it on one of your matters.</h2>
        {/*
          Written for the call, because the call is what exists. The trial is behind
          TRIAL_ENABLED: /trial is gated off on case-app and app.autolaw.ai does not resolve,
          and a closing button that opens a browser error is the last impression a visitor
          gets. When the switch is on, the trial is described as what it is — one report,
          chronologized — and never as "upload a case file", which it cannot take.
        */}
        <p className="al-conv__sub">
          Bring a matter you already know. We walk through it in the workflow you practice,
          and you judge the chronology, the conflicts, and the missing records against what
          you know is in the file.
        </p>
        <div className="al-conv__ctas">
          <Button href={SCHEDULE_URL} variant="inverse" size="lg" withCaret>Schedule a call</Button>
          {TRIAL_ENABLED && (
            <Button href={TRIAL_URL} variant="inverse-secondary" size="lg">Analyze one report</Button>
          )}
        </div>
        {TRIAL_ENABLED && (
          <p className="al-conv__fine">
            Or upload one QME, AME, or IME report and see it chronologized, with every fact
            cited to its page.
          </p>
        )}
        <p className="al-conv__fine">
          Personal injury and workers&rsquo; compensation run as separate workflows &mdash; tell
          us which one you practice and you will see that workflow, not a generic demo.
        </p>
      </div>
    </section>
  );
}
