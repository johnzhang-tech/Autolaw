import { Button } from '../components/primitives/Button';
import { TRIAL_URL, CONTACT_EMAIL } from '../config';
import './Conversion.css';

export function Conversion() {
  return (
    <section id="contact" className="al-section al-conv al-on-navy" aria-labelledby="conv-heading">
      <div className="al-container al-conv__inner">
        <h2 id="conv-heading" className="al-conv__title">Prove it on one of your matters.</h2>
        {/*
          Written as self-serve because /trial is what exists. The previous copy promised
          a serviced engagement ("Bring a single case file. We will return...") six inches
          above a button that opens a signup form — two different products on one screen,
          and the buyer notices which one the button actually delivers.
        */}
        <p className="al-conv__sub">
          Upload a single case file. You will get back a source-linked chronology, the conflicts
          we found, and the records that are missing &mdash; so you can judge the output against
          a matter you already know.
        </p>
        <div className="al-conv__ctas">
          <Button href={TRIAL_URL} variant="inverse" size="lg" withCaret>Analyze one case</Button>
          {/* "Email us", not "Talk to us": the link opens a mail client, and this buyer
              would rather be told that than discover it. */}
          <Button href={`mailto:${CONTACT_EMAIL}`} variant="inverse-secondary" size="lg">Email us</Button>
        </div>
        <p className="al-conv__fine">
          Personal injury and workers&rsquo; compensation are set up separately &mdash; tell us
          which one you practice and you will see that workflow, not a generic demo.
        </p>
      </div>
    </section>
  );
}
