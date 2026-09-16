import type { ReactNode } from 'react';
import { Section } from '../../components/primitives/Section';
import { FeatureCard } from './FeatureCard';
import { ASK_AL_FEATURE_ID, FEATURES, PHASES, PLATFORM, type Phase } from '../../data/product';
import { usePractice } from '../../practice/PracticeContext';
import { ASK_AL_ENABLED } from '../../config';
import { StatePanel } from '../visuals/StatePanel';
import { AskPreview } from '../visuals/AskPreview';
import { ChronologyState } from '../visuals/ChronologyState';
import { Output } from '../visuals/Output';
import './Product.css';

const PHASE_ORDER: ReadonlyArray<Phase> = ['pre-lit', 'litigation'];

/**
 * The three features that have a visual, keyed by the id they carry in product.ts — so a
 * renamed or deleted feature loses its visual rather than mounting it under a card that
 * no longer means what the visual shows.
 *
 * Every one is wrapped in StatePanel: the states paint inverse ink and StatePanel is the
 * navy ground under it. FeatureCard mounts what it is given only while the card is open,
 * so nothing here renders on a page nobody has opened a card on.
 *
 * AskPreview types its question in with setTimeout, which no CSS media query can disable.
 * The pinned stage used to hand it `animate={false}` whenever its reduced-motion query
 * failed; that query went with the story, and adding a matchMedia hook back so a demo can
 * type inside a disclosure is not a trade worth making. It renders static.
 */
const VISUALS: Record<string, ReactNode> = {
  'medical-chronologies': <StatePanel><ChronologyState /></StatePanel>,
  [ASK_AL_FEATURE_ID]: <StatePanel><AskPreview animate={false} /></StatePanel>,
  'case-management-summary': <StatePanel><Output /></StatePanel>,
};

/**
 * What the firm gets, by the phase of the case it belongs to.
 *
 * A feature appears in every phase column its `phases` list names — Ask AL and the
 * chronologies genuinely serve both, and splitting them would describe a product nobody
 * ships. Unbuilt features never enter a column: they sit in the "Coming next" row, which
 * is what keeps the columns readable as a list of things you can use on Monday.
 */
export function Product() {
  const { practice } = usePractice();
  const shown = FEATURES.filter((f) => ASK_AL_ENABLED || f.id !== ASK_AL_FEATURE_ID);
  const columnFeatures = (phase: Phase) =>
    shown.filter((f) => f.phases.includes(phase) && f.availability !== 'coming-next');
  const comingNext = shown.filter((f) => f.availability === 'coming-next');

  return (
    <Section
      id="product"
      eyebrow="Product"
      heading="What Autolaw does for your firm"
      intro="Two phases of the case, and the work Autolaw does in each. Open any one to see what it produces."
    >
      <div className="al-prod__columns">
        {PHASE_ORDER.map((phase) => (
          <div key={phase} className="al-prod__col" data-testid={`column-${phase}`}>
            <h3 className="al-prod__phase">{PHASES[phase].heading}</h3>
            <p className="al-prod__phase-line">{PHASES[phase].line}</p>
            <ul className="al-prod__cards">
              {columnFeatures(phase).map((f) => (
                <li key={f.id}>
                  <FeatureCard feature={f} practice={practice} visual={VISUALS[f.id]} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="al-prod__strip" data-testid="platform-strip">
        <h3 className="al-prod__strip-head">Across every phase</h3>
        <ul>
          {PLATFORM.map((p) => (
            <li key={p.id}><b>{p.name}</b><span>{p.line}</span></li>
          ))}
        </ul>
      </div>

      {comingNext.length > 0 && (
        <div className="al-prod__next" data-testid="coming-next">
          <h3 className="al-prod__next-head">Coming next</h3>
          <ul className="al-prod__cards al-prod__cards--next">
            {comingNext.map((f) => (
              <li key={f.id}><FeatureCard feature={f} practice={practice} /></li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  );
}
