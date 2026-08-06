import { Section } from '../components/primitives/Section';
import './Transformation.css';

/*
 * This explainer is shared by both practices and PI is the default tab, so the list has
 * to name PI documents as well as comp ones. It previously named only comp records — a PI
 * attorney reading it saw someone else's file.
 */
const INPUTS = [
  'Intake calls', 'Police and incident reports', 'ER and hospital records',
  'Treating physician reports', 'QME/AME reports', 'PTP reports', 'Imaging',
  'Billing and liens', 'Wage records', 'Subpoenaed records', 'Prior claims',
  'Correspondence',
];

const BRAIN = [
  { text: 'Every fact cited to document, page, sentence', tone: 'verified' },
  { text: 'One timeline across every provider and every date', tone: 'verified' },
  { text: 'Conflicts surfaced, never auto-resolved', tone: 'conflict' },
  { text: 'Records referenced in the file but never produced', tone: 'conflict' },
  { text: 'Attorney confirms before it becomes truth', tone: 'verified' },
] as const;

const OUTPUTS = [
  'Source-linked chronology', 'Missing-evidence checklist', 'Issue map & conflicts',
  'QME/AME analysis', 'Demand-ready narrative',
];

function Arrow() {
  return (
    <div className="al-tf__arrow" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d="M4 12h15m0 0l-5-5m5 5l-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function Transformation() {
  return (
    <Section
      id="transformation"
      eyebrow="How it works"
      heading="From scattered evidence to case intelligence"
      intro="Records arrive continuously and never in order. The middle stage is the product."
    >
      <div className="al-tf">
        <div className="al-tf__stage">
          <p className="al-tf__n">Step 1</p>
          <h3 className="al-tf__t">What arrives</h3>
          <ul className="al-tf__docs">
            {INPUTS.map((d) => <li key={d}>{d}</li>)}
          </ul>
        </div>

        <Arrow />

        <div className="al-tf__stage al-tf__stage--brain al-on-navy">
          <p className="al-tf__n">Step 2</p>
          <h3 className="al-tf__t">One connected case file</h3>
          <ul className="al-tf__rows">
            {BRAIN.map((r) => (
              <li key={r.text} className={`al-tf__row al-tf__row--${r.tone}`}>
                <i aria-hidden="true" />{r.text}
              </li>
            ))}
          </ul>
        </div>

        <Arrow />

        <div className="al-tf__stage">
          <p className="al-tf__n">Step 3</p>
          <h3 className="al-tf__t">What you get</h3>
          <ul className="al-tf__outs">
            {OUTPUTS.map((o) => <li key={o}>{o}</li>)}
          </ul>
        </div>
      </div>
    </Section>
  );
}
