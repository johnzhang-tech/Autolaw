import { Section } from '../../components/primitives/Section';
import { FeatureCard } from './FeatureCard';
import { ASK_AL_FEATURE_ID, FEATURES, PHASES, PLATFORM, type Phase } from '../../data/product';
import { usePractice } from '../../practice/PracticeContext';
import { ASK_AL_ENABLED } from '../../config';
import './Product.css';

const PHASE_ORDER: ReadonlyArray<Phase> = ['pre-lit', 'litigation'];

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
      intro="From the first record through the fight that follows. Explore the work Autolaw puts within reach at each phase."
    >
      <div className="al-prod__columns">
        {PHASE_ORDER.map((phase) => (
          <div key={phase} className="al-prod__col" data-testid={`column-${phase}`}>
            <h3 className="al-prod__phase">{PHASES[phase].heading}</h3>
            <p className="al-prod__phase-line">{PHASES[phase].line}</p>
            <ul className="al-prod__cards">
              {columnFeatures(phase).map((f) => (
                <li key={f.id}>
                  <FeatureCard feature={f} practice={practice} />
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
