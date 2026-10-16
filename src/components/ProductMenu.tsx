import {
  ASK_AL_FEATURE_ID,
  AVAILABILITY_LABEL,
  FEATURES,
  PHASES,
  type Phase,
} from '../data/product';
import { ASK_AL_ENABLED } from '../config';
import { ProductIcon } from './ProductIcon';

const PHASE_ORDER: ReadonlyArray<Phase> = ['pre-lit', 'litigation'];

interface ProductMenuProps {
  id?: string;
  mobile?: boolean;
  onNavigate?: () => void;
}

export function ProductMenu({ id, mobile = false, onNavigate }: ProductMenuProps) {
  const shown = FEATURES.filter((feature) => ASK_AL_ENABLED || feature.id !== ASK_AL_FEATURE_ID);

  return (
    <div
      id={id}
      className={`al-pmenu${mobile ? ' al-pmenu--mobile' : ''}`}
      aria-label="Product features"
    >
      <div className="al-pmenu__grid">
        {PHASE_ORDER.map((phase) => (
          <section key={phase} className="al-pmenu__phase" aria-labelledby={`${id ?? 'mobile-product'}-${phase}`}>
            <div className="al-pmenu__phase-head">
              <h3 id={`${id ?? 'mobile-product'}-${phase}`}>{PHASES[phase].heading}</h3>
              <p>{PHASES[phase].line}</p>
            </div>
            <ul>
              {shown.filter((feature) => feature.phases.includes(phase)).map((feature) => {
                const label = feature.availability === 'live'
                  ? null
                  : AVAILABILITY_LABEL[feature.availability];
                const inner = (
                  <>
                    <span className="al-pmenu__item-main">
                      <ProductIcon featureId={feature.id} icon={feature.icon} size="menu" />
                      <span>{feature.name}</span>
                    </span>
                    {label && <small>{label}</small>}
                  </>
                );

                return (
                  <li key={feature.id}>
                    {feature.slug ? (
                      <a href={`/product/${feature.slug}/`} onClick={onNavigate}>{inner}</a>
                    ) : (
                      <span className="al-pmenu__future">{inner}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
