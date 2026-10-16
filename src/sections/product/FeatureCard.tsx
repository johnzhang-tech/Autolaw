import { AVAILABILITY_LABEL, type Feature } from '../../data/product';
import type { Practice } from '../../practice/PracticeContext';
import { ProductIcon } from '../../components/ProductIcon';

const PRACTICE_BADGE: Record<'PI' | 'WC', string> = {
  PI: 'Personal injury',
  WC: 'Workers’ comp',
};

export function FeatureCard({ feature, practice }: {
  feature: Feature;
  practice: Practice;
}) {
  const label = feature.availability === 'live' ? null : AVAILABILITY_LABEL[feature.availability];
  const line = practice === 'WC' && feature.wcLine ? feature.wcLine : feature.line;
  const content = (
    <span className="al-feat__content">
      <ProductIcon featureId={feature.id} icon={feature.icon} size="card" />
      <span className="al-feat__copy">
        <span className="al-feat__top">
          <span className="al-feat__head">
            <span className="al-feat__name">{feature.name}</span>
            {label && <span className="al-feat__tag">{label}</span>}
            {feature.practice !== 'both' && (
              <span className="al-feat__badge">{PRACTICE_BADGE[feature.practice]}</span>
            )}
          </span>
          {feature.slug && <i className="al-feat__arrow" aria-hidden="true">→</i>}
        </span>
        <span className="al-feat__line">{line}</span>
      </span>
    </span>
  );

  if (feature.slug) {
    return (
      <a
        className="al-feat al-feat--link"
        data-testid="feature-card"
        data-availability={feature.availability}
        href={`/product/${feature.slug}/`}
      >
        {content}
      </a>
    );
  }

  return (
    <article
      className="al-feat al-feat--future"
      data-testid="feature-card"
      data-availability={feature.availability}
    >
      {content}
    </article>
  );
}
