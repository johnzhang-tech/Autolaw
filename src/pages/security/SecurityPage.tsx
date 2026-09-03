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

const DATA = [
  {
    title: 'Your case content never trains a model',
    body: 'Case content is never used to train or fine-tune any model — ours or a vendor’s.',
  },
  {
    title: 'Documents can come from where they already are',
    body: 'Autolaw connects to Dropbox, so a matter can be built from the case documents your firm already stores there.',
  },
  {
    title: 'Retention',
    body: 'Case data is kept while the account is active and deleted within 90 days of an account ending, or earlier on request. That is what the privacy policy states, and it is all it states.',
  },
];

const ACCESS = [
  {
    title: 'One firm, one boundary',
    body: 'Every case, every document, and every background job belongs to exactly one firm. The rule is enforced on our servers — not by hiding things in the browser, which is a control any visitor can defeat with the developer tools.',
  },
  {
    title: 'Document access is recorded',
    body: 'Who opened which document, and when, is recorded and reviewable — so “who opened this file” has an answer rather than an assumption.',
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
        id="data"
        eyebrow="Your data"
        heading="What we do with your case data"
        intro="Two things decide whether a case file can go anywhere near a vendor: what happens to the content, and where the documents come from."
      >
        <div className="al-secp__grid al-secp__grid--three">
          {DATA.map((c) => (
            <div key={c.title} className="al-secp__card">
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="access"
        eyebrow="Access"
        heading="Who can see it"
        intro="Separation between firms is enforced on our servers rather than in the browser, and every document opened is on the record."
      >
        <div className="al-secp__grid">
          {ACCESS.map((c) => (
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
        eyebrow="Model limits"
        heading="What the model is not allowed to do"
        intro="The constraints below are legal before they are technical, which is why none of them is offered as a preference to be turned off."
      >
        <div className="al-secp__grid al-secp__grid--three">
          {LIMITS.map((c) => (
            <div key={c.title} className="al-secp__card al-secp__card--navy">
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </div>
          ))}
        </div>
        <p className="al-secp__why">
          Why a person has to confirm: date of injury, employer, and claim status carry
          statute-of-limitations and jurisdictional consequences. A value that decides whether
          a claim is still alive, and where it can be brought, is not something a model gets to
          assert on its own. So Autolaw proposes, and a person at your firm confirms.
        </p>
        <div className="al-secp__kinds">
          <p>Grounding takes one of seven concrete forms. Every citation the assistant gives is one of these, and each opens the source:</p>
          <ul>
            {CITATION_KINDS.map((k) => <li key={k}>{k}</li>)}
          </ul>
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
