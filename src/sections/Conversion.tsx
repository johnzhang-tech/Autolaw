import { Button } from '../components/primitives/Button';
import { TRIAL_URL, CONTACT_EMAIL } from '../config';
import './Conversion.css';

export function Conversion() {
  return (
    <section id="contact" className="al-section al-conv al-on-navy" aria-labelledby="conv-heading">
      <div className="al-container al-conv__inner">
        <h2 id="conv-heading" className="al-conv__title">Prove it on one of your matters.</h2>
        <p className="al-conv__sub">
          Bring a single case file. We will return a source-linked chronology, the conflicts we
          found, and the records that are missing &mdash; so you can judge the output against a
          matter you already know.
        </p>
        <div className="al-conv__ctas">
          <Button href={TRIAL_URL} variant="inverse" size="lg" withCaret>Analyze one case</Button>
          <Button href={`mailto:${CONTACT_EMAIL}`} variant="inverse-secondary" size="lg">Talk to us</Button>
        </div>
        <p className="al-conv__fine">
          Personal injury and workers&rsquo; compensation are onboarded separately &mdash; tell us
          which practice and you will get that workflow, not a generic demo.
        </p>
      </div>
    </section>
  );
}
