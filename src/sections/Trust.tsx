import { Section } from '../components/primitives/Section';
import { CUSTOMER_LOGOS, CERTIFICATIONS, PRIVACY_TEXT, PRIVACY_URL } from '../config';
import './Trust.css';

/*
 * Written for a practising attorney, so no vendor vocabulary: "tenant isolation" names a
 * lease to this reader, "deep-linked" and "separate lane" name nothing at all, and
 * "extraction" is our word for our own component. Each claim below states what happens.
 */
const CONTROLS = [
  { title: 'Your data does not train models', body: 'Case content is never used to train or fine-tune any model, ours or a vendor’s.' },
  { title: 'No other firm can see your cases', body: 'Every case, document, and job belongs to one firm. The rule is enforced on our servers, not in the browser.' },
  { title: 'Auditable access', body: 'Who opened which document, and when, is recorded and reviewable.' },
  { title: 'Human confirmation required', body: 'Autolaw proposes. It never writes case truth on its own. An attorney confirms each value before it counts as a fact.' },
  /*
   * The pricing model, not a price. No one in this category publishes numbers, but the
   * model itself is the differentiator: record-review vendors bill per page, and a firm
   * that has been quoted per-page reads this line and immediately knows the difference.
   */
  { title: 'No per-page or per-document fees', body: 'A thousand-page file does not cost more to review than a hundred-page one. Record-review vendors bill by the page; Autolaw does not, so the size of a file never decides whether it is worth analysing.' },
];

const ROWS: Array<[string, string, string]> = [
  ['Where a fact came from', 'Summarizes; sources approximate or absent', 'Document, page, and the exact sentence — one click opens it'],
  ['Two documents disagree', 'Picks one, silently', 'Surfaced as a conflict with both sources and dates'],
  ['A fact with no support', 'Reads identically to a supported one', 'Kept apart from cited facts and labeled uncited'],
  ['What is missing from the file', 'Cannot know what it was never given', 'Detects referenced-but-absent records and lists what is needed'],
  ['Becoming case truth', 'Output is the answer', 'Proposes only; an attorney confirms before anything is recorded'],
  ['Practice fit', 'Generic', 'Separate PI and workers’ comp workflows on one engine, each with its own screens and outputs'],
  ['Your data', 'Consumer terms; retention varies', 'Walled off per firm, every document opened is logged, never used to train models'],
];

function Cross() {
  return (
    <svg className="al-mk__i" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M3.5 3.5l7 7m0-7l-7 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function Check() {
  return (
    <svg className="al-mk__i" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M2.5 7.5l3 3 6-6.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Trust() {
  return (
    <Section
      id="trust"
      eyebrow="Trust"
      heading="Why not just upload the file to a chatbot?"
      intro="Every row below is a behavior implemented in the application, not an adjective."
    >
      <div className="al-trust__badges">
        {CERTIFICATIONS.map((c) => (
          <div key={c.label} className="al-badge">
            <span className="al-badge__mark" aria-hidden="true">{c.mark}</span>
            <div>
              <b>{c.label}</b>
              <span>{c.detail}</span>
            </div>
          </div>
        ))}
      </div>

      {CUSTOMER_LOGOS.length > 0 && (
        <div data-testid="logo-wall" className="al-trust__wall-wrap">
          <p className="al-trust__wall-label">Trusted by:</p>
          <ul className="al-trust__wall">
            {CUSTOMER_LOGOS.map((l) => (
              <li key={l.name}><img src={l.src} alt={l.name} loading="lazy" /></li>
            ))}
          </ul>
        </div>
      )}

      <div className="al-trust__controls">
        {CONTROLS.map((c, i) => (
          <div key={c.title} className="al-ctrl">
            <b>{c.title}</b>
            {i === 0 ? (
              <p>
                {c.body}
                {PRIVACY_TEXT.length > 0 && (
                  <>
                    {' '}<a href={PRIVACY_URL}>Privacy policy</a>
                  </>
                )}
              </p>
            ) : (
              <p>{c.body}</p>
            )}
          </div>
        ))}
      </div>

      <div className="al-cmp">
        {/*
          Focusable so keyboard users can scroll the table horizontally. That makes it an
          interactive control, so it needs a role and a name of its own — otherwise a screen
          reader announces nothing on arrival.
        */}
        <div
          className="al-cmp__scroller"
          data-testid="comparison-scroller"
          tabIndex={0}
          role="region"
          aria-label="Comparison table, scrollable"
        >
          <table>
            {/* Count derived, not written out: a hardcoded "seven" goes stale silently
                the first time a row is added, and only a screen-reader user hears it. */}
            <caption className="al-visually-hidden">
              Comparison of a general-purpose chatbot and Autolaw across {ROWS.length} requirements
            </caption>
            <thead>
              <tr>
                <th scope="col">Requirement</th>
                <th scope="col">General-purpose chatbot</th>
                <th scope="col">Autolaw</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([req, chatbot, autolaw]) => (
                <tr key={req}>
                  <th scope="row">{req}</th>
                  <td><span className="al-mk al-mk--no"><Cross /></span>{chatbot}</td>
                  <td><span className="al-mk al-mk--yes"><Check /></span>{autolaw}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  );
}
