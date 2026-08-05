import { Section } from '../components/primitives/Section';
import { CUSTOMER_LOGOS, CERTIFICATIONS } from '../config';
import './Trust.css';

const CONTROLS = [
  { title: 'Your data does not train models', body: 'Case content is never used to train or fine-tune any model, ours or a vendor’s.' },
  { title: 'Tenant isolation', body: 'Every case, document, and job is scoped to your firm end-to-end, enforced server-side.' },
  { title: 'Auditable access', body: 'Who opened which document, and when, is recorded and reviewable.' },
  { title: 'Human confirmation required', body: 'Extraction proposes; it never writes case truth. An attorney confirms before a value becomes fact.' },
];

const ROWS: Array<[string, string, string]> = [
  ['Where a fact came from', 'Summarizes; sources approximate or absent', 'Document, page, and the exact sentence — deep-linked'],
  ['Two documents disagree', 'Picks one, silently', 'Surfaced as a conflict with both sources and dates'],
  ['A fact with no support', 'Reads identically to a supported one', 'Held in a separate lane and never grouped with cited facts'],
  ['What is missing from the file', 'Cannot know what it was never given', 'Detects referenced-but-absent records and drafts the request'],
  ['Becoming case truth', 'Output is the answer', 'Proposes only; an attorney confirms before anything is recorded'],
  ['Practice fit', 'Generic', 'PI and WC isolated at the route, navigation, and data layer'],
  ['Your data', 'Consumer terms; retention varies', 'Tenant-isolated, auditable, never used to train models'],
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
      heading="Why not simply upload the file to a chatbot"
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
        {CONTROLS.map((c) => (
          <div key={c.title} className="al-ctrl">
            <b>{c.title}</b>
            <p>{c.body}</p>
          </div>
        ))}
      </div>

      <div className="al-cmp">
        <div className="al-cmp__scroller" data-testid="comparison-scroller" tabIndex={0}>
          <table>
            <caption className="al-visually-hidden">
              Comparison of a general-purpose chatbot and Autolaw across seven requirements
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
