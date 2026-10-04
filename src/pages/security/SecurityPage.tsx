import { PageShell } from '../PageShell';
import { PageHero } from '../PageHero';
import { Section } from '../../components/primitives/Section';
import { Button } from '../../components/primitives/Button';
import { AI_USE_URL, CERTIFICATIONS, CONTACT_EMAIL, SCHEDULE_URL, SUBPROCESSORS_URL } from '../../config';
import { AI_CARDS, AUDIT_CARDS, PRIVACY_CARDS, TRUST_LAST_VERIFIED } from '../../data/trust';
import { TrustCardView } from './TrustCardView';
import './SecurityPage.css';

/*
 * EVERY STATEMENT ON THIS PAGE IS TRUE IN THE PRODUCT TODAY, OR IS MARKED AS PLANNED
 * WITH ITS QUARTER.
 *
 * The privacy, model and audit copy comes from src/data/trust.ts, where each card names
 * the claim ids that prove it in case-app's evidence record (docs/trust/evidence-annex.md).
 * Change the evidence first, then the data file; do not write a claim into this file.
 * src/pages/security/__tests__/trustGuard.ts lists the vocabulary that is still unverified.
 *
 * The ethics questions and the illustration-pilot controls below are kept as they were.
 * The pilot controls were not part of the 2026-10-03 trust review and are flagged for a
 * later check against media-engine.
 */

const BAR_GUIDANCE = 'https://www.calbar.ca.gov/sites/default/files/portals/0/documents/ethics/Generative-AI-Practical-Guidance.pdf';

const ILLUSTRATION_CONTROLS = [
  {
    title: 'The record has to be sufficient',
    body: 'The pilot refuses to start when the record is too thin to support an accident or injury scene.',
  },
  {
    title: 'Every scene stays inside the evidence',
    body: 'A scene contract binds what may be shown to the record. If the record does not state something, the scene must not depict it.',
  },
  {
    title: 'The render is checked again',
    body: 'The system re-inspects each render for problems such as reversed impact direction or an over-claimed spinal level.',
  },
  {
    title: 'A failed check stops the work',
    body: 'The pilot parks a failed render for attorney review instead of presenting it as finished work.',
  },
  {
    title: 'Approval creates a verifiable record',
    body: 'After human approval, the system hash-verifies the locked exhibit so a later change can be detected.',
  },
];

export function SecurityPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Security"
        title="How Autolaw handles your firm’s case data"
        intro={
          <>
            Everything below is true in the product today, or is marked as planned with its
            quarter. Last verified {TRUST_LAST_VERIFIED}. A firm evaluating Autolaw can read the
            full Trust Pack, with the evidence behind each statement and the limits we have not
            closed yet, under a confidentiality agreement.
          </>
        }
      >
        <ul className="al-secp__badges" aria-label="Audits and agreements">
          {CERTIFICATIONS.map((c) => (
            <li key={c.label} className="al-secp__badge">
              <span className="al-secp__mark" aria-hidden="true">{c.mark}</span>
              <span className="al-secp__badge-text">
                <b>{c.label}</b>
                <span>{c.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </PageHero>

      <Section
        id="privacy"
        eyebrow="Question one"
        heading="Does my client’s medical data stay private?"
        intro="The answer is in the controls: each firm’s data is kept apart, opening a document is recorded, traffic and storage are encrypted, and retention is stated."
      >
        <div className="al-secp__grid al-secp__grid--two-by-two">
          {PRIVACY_CARDS.map((c) => <TrustCardView key={c.title} card={c} />)}
        </div>
      </Section>

      <Section
        id="model-limits"
        tone="navy"
        eyebrow="Question two"
        heading="Does my case train your model?"
        intro="No. Autolaw trains no models on your data, and the AI providers that read your documents work under paid terms that do not allow them to train on it."
      >
        <div className="al-secp__grid al-secp__grid--three">
          {AI_CARDS.map((c) => <TrustCardView key={c.title} card={c} tone="navy" />)}
        </div>
        <p className="al-secp__more">
          <a href={AI_USE_URL}>Read how Autolaw uses AI with your files</a>
          <span aria-hidden="true"> · </span>
          <a href={SUBPROCESSORS_URL}>See every subprocessor</a>
        </p>
      </Section>

      <Section
        id="client-questions"
        eyebrow="Question three"
        heading="What should I tell my client?"
        intro="These are questions to take to your firm’s ethics counsel, not legal advice from a software company. The State Bar’s current guidance is the starting point."
      >
        <div className="al-secp__grid al-secp__grid--three al-secp__ethics">
          <div className="al-secp__card">
            <h3>Could this affect confidentiality or privilege?</h3>
            <p>Ask how the system collects, uses, stores, and discloses client information, and match the safeguards to the access the tool receives.</p>
          </div>
          <div className="al-secp__card">
            <h3>When should I tell my client?</h3>
            <p>Consider the technology, its risks, the scope of the representation, and whether its use materially affects decision-making.</p>
          </div>
          <div className="al-secp__card">
            <h3>May AI costs be passed through?</h3>
            <p>Separate general firm overhead from a cost incurred for the particular matter, then review the fee agreement, actual cost, and consent requirements.</p>
          </div>
        </div>
        <a className="al-secp__guidance" href={BAR_GUIDANCE} target="_blank" rel="noreferrer">
          Read the State Bar of California’s 2026 Practical Guidance <span aria-hidden="true">↗</span>
        </a>
      </Section>

      <Section
        id="illustration-controls"
        tone="navy"
        eyebrow="Early access"
        heading="How does the illustration pilot keep the evidence in charge?"
        intro="The pilot runs with our team on your case. It does not replace attorney review, and it does not turn an unsupported scene into evidence."
      >
        <div className="al-secp__control-list">
          {ILLUSTRATION_CONTROLS.map((control, index) => (
            <div key={control.title} className="al-secp__control">
              <span aria-hidden="true">0{index + 1}</span>
              <div>
                <h3>{control.title}</h3>
                <p>{control.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="certifications"
        eyebrow="Audits and agreements"
        heading="What has been audited, and what has not yet"
        intro="SOC 2 and HIPAA are often listed side by side as if they were the same kind of thing. They are not, so they are described separately here."
      >
        <div className="al-secp__grid">
          {AUDIT_CARDS.map((c) => <TrustCardView key={c.title} card={c} />)}
        </div>
      </Section>

      <Section
        id="reviewer"
        eyebrow="For your reviewer"
        heading="Getting the full Trust Pack"
        intro="A person sends it, under a confidentiality agreement, rather than a portal."
      >
        <div className="al-secp__ask">
          <ul className="al-secp__asks">
            <li>
              <b>The full Trust Pack</b>
              <span>
                Every statement with the evidence behind it, the limits we have not closed yet,
                and a dated plan for each. Sent under a confidentiality agreement; ask and we
                will start one.
              </span>
            </li>
            <li>
              <b>Your firm’s security questionnaire</b>
              <span>We complete it directly, in your format.</span>
            </li>
            <li>
              <b>A security issue</b>
              <span>
                Report it to {CONTACT_EMAIL} with “Security” in the subject line. A written
                incident-response plan, with notice to affected firms within 72 hours of
                confirming a breach, is planned for Q4 2026.
              </span>
            </li>
            <li>
              <b>A question this page does not answer</b>
              <span>
                Ask it directly. We would rather answer a specific question than publish a
                general claim we have not measured.
              </span>
            </li>
          </ul>
          <div className="al-secp__ctas">
            <Button href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Trust Pack request')}`} variant="primary" size="lg">
              Email {CONTACT_EMAIL}
            </Button>
            <Button href={SCHEDULE_URL} variant="secondary" size="lg" withCaret>
              Schedule a call
            </Button>
          </div>
        </div>
      </Section>
    </PageShell>
  );
}
