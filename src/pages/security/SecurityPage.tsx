import { PageShell } from '../PageShell';
import { PageHero } from '../PageHero';
import { Section } from '../../components/primitives/Section';
import { Button } from '../../components/primitives/Button';
import { CERTIFICATIONS, CONTACT_EMAIL, SCHEDULE_URL } from '../../config';
import { CITATION_KINDS } from '../../data/demoCase';
import './SecurityPage.css';

/*
 * EVERY CLAIM ON THIS PAGE IS IMPLEMENTED IN THE PRODUCT TODAY.
 *
 * This page is read by an enterprise buyer's security reviewer, whose job is to find the
 * sentence that is not true. One invented detail — a retention window, an encryption
 * algorithm, a test cadence — turns a page of real controls into a page they have to
 * verify line by line, and the deal slows down for a claim nobody needed.
 *
 * So: nothing goes on this page that is not already built. Where a reviewer would expect
 * a number we cannot supply, the answer is "the SOC 2 Type II report, under NDA" — which
 * is both true and the answer they actually wanted. src/pages/security/__tests__ enforces
 * this with a vocabulary guard; if you are here to add a claim, add it to the guard's
 * allowed set only after confirming the control exists in case-app.
 */

const PRIVATE_DATA = [
  {
    title: 'Documents can come from where they already are',
    body: 'Autolaw connects to Dropbox, so a matter can be built from the case documents your firm already stores there.',
  },
  {
    title: 'Retention',
    body: 'Case data is kept while the account is active and deleted within 90 days of an account ending, and you may request deletion at any time, except where retention is required by law. That is what the privacy policy states, and it is all it states.',
  },
  {
    title: 'One firm, one boundary',
    body: 'Every case, every document, and every background job belongs to exactly one firm. The rule is enforced on our servers — not by hiding things in the browser, which is a control any visitor can defeat with the developer tools.',
  },
  {
    title: 'Document access is recorded',
    body: 'Who opened which document, and when, is recorded and reviewable — so “who opened this file” has an answer rather than an assumption.',
  },
];

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

const LIMITS = [
  {
    title: 'Autolaw proposes; a person confirms',
    body: 'Autolaw reads a document and proposes a value. Someone at your firm confirms it before it counts as a fact in the case. Nothing the model produces becomes case truth on its own.',
  },
  {
    title: 'Conflicts are surfaced, never silently resolved',
    body: 'When two documents disagree, both stay visible, each with its own date and source. Autolaw does not pick a winner and hide the loser.',
  },
  {
    title: 'Uncited findings never sit among cited ones',
    body: 'A finding with no source in the record stays visibly separate from findings that cite one. It is never folded into a list of supported facts where it would read as one.',
  },
];

export function SecurityPage() {
  return (
    <PageShell>
      {/*
        `title` carries a literal curly apostrophe rather than &rsquo;. It is a JSX string
        attribute, where an HTML entity is not decoded and would reach the reader as the
        characters "&rsquo;" — the same trap noted on Solutions' intro.
      */}
      <PageHero
        eyebrow="Security"
        title="How Autolaw handles your firm’s case data"
        intro={
          <>
            Everything below is a control that exists in the product today, described in the
            terms your reviewer will ask about. Where a reviewer needs more detail than we
            publish, the SOC&nbsp;2 Type&nbsp;II report is available under NDA.
          </>
        }
      >
        <ul className="al-secp__badges" aria-label="Attestations and safeguards">
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
        intro="The answer has to be visible in the controls: one firm boundary, reviewable document access, stated retention, and a BAA before protected health information arrives."
      >
        <div className="al-secp__grid al-secp__grid--two-by-two">
          {PRIVATE_DATA.map((c) => (
            <div key={c.title} className="al-secp__card">
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="model-limits"
        tone="navy"
        eyebrow="Question two"
        heading="Does my case train your model?"
        intro="No. Case content is never used to train or fine-tune any model — ours or a vendor’s. The same boundary applies to what the model may assert about the case."
      >
        <div className="al-secp__grid al-secp__grid--three">
          {LIMITS.map((c) => (
            <div key={c.title} className="al-secp__card al-secp__card--navy">
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </div>
          ))}
        </div>
        <div className="al-secp__kinds">
          <p>Grounding takes one of seven concrete forms. Every citation the assistant gives is one of these, and each opens the source:</p>
          <ul>
            {CITATION_KINDS.map((k) => <li key={k}>{k}</li>)}
          </ul>
        </div>
        <p className="al-secp__why">
          Why a person has to confirm: date of injury, employer, and claim status carry
          statute-of-limitations and jurisdictional consequences. A value that decides whether
          a claim is still alive, and where it can be brought, is not something a model gets to
          assert on its own. So Autolaw proposes, and a person at your firm confirms.
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
        eyebrow="Attestations and agreements"
        heading="What we have been audited against, and what has no audit"
        intro="Two different things are often listed side by side as if they were the same. They are not, so they are described separately here."
      >
        <div className="al-secp__grid">
          <div className="al-secp__card">
            <h3>SOC 2 Type II</h3>
            <p>
              Autolaw holds a SOC&nbsp;2 Type&nbsp;II report &mdash; an audited attestation, issued
              by an outside firm, covering a period of operation rather than a point in time. The
              report is available under NDA, and it is the right place to send a reviewer whose
              questions go past this page.
            </p>
          </div>
          <div className="al-secp__card">
            <h3>HIPAA safeguards</h3>
            <p>
              HIPAA works differently, and the difference matters to a reviewer. There is no
              certifying body for HIPAA and no audit that issues a HIPAA certificate, so no
              vendor can hold one. What a firm can actually be given is HIPAA safeguards and a
              business associate agreement, signed on request. That is what Autolaw offers, and
              it is not the same kind of thing as the SOC&nbsp;2 attestation above.
            </p>
          </div>
        </div>
      </Section>

      <Section
        id="reviewer"
        eyebrow="For your reviewer"
        heading="Getting the report or a BAA"
        intro="Both are handled by email today, and both are answered by a person rather than a portal."
      >
        <div className="al-secp__ask">
          <ul className="al-secp__asks">
            <li>
              <b>The SOC 2 Type II report</b>
              <span>Sent under NDA. Ask and we will start the NDA.</span>
            </li>
            <li>
              <b>A business associate agreement</b>
              <span>
                Signed on request &mdash; ask for it before any protected health information
                reaches the system.
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
            <Button href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Security review request')}`} variant="primary" size="lg">
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
