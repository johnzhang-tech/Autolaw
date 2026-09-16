import { useId, useState, type ReactNode } from 'react';
import { AVAILABILITY_LABEL, type Feature } from '../../data/product';
import type { Practice } from '../../practice/PracticeContext';

const PRACTICE_BADGE: Record<'PI' | 'WC', string> = {
  PI: 'Personal injury',
  WC: 'Workers’ comp',
};

/**
 * One feature, collapsed to a name and a line until someone asks for more.
 *
 * The availability label is rendered from data, never typed into JSX. A feature that is
 * not `live` carries its label here and nowhere else, which is what the claim guard
 * checks — so promoting a roadmap feature to a live claim takes a deliberate data edit.
 */
export function FeatureCard({ feature, practice, visual }: {
  feature: Feature;
  practice: Practice;
  visual?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const label = feature.availability === 'live' ? null : AVAILABILITY_LABEL[feature.availability];
  const line = practice === 'WC' && feature.wcLine ? feature.wcLine : feature.line;

  return (
    <div className="al-feat" data-testid="feature-card" data-availability={feature.availability}>
      <button
        type="button"
        className="al-feat__toggle"
        aria-expanded={open}
        // aria-controls must name an element that exists in the DOM. The panel below is
        // only mounted while open, so pointing at panelId while collapsed would reference
        // nothing — an invalid ARIA relationship rather than a merely unhelpful one.
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen(!open)}
      >
        <span className="al-feat__name">{feature.name}</span>
        {label && <span className="al-feat__tag">{label}</span>}
        {feature.practice !== 'both' && (
          <span className="al-feat__badge">{PRACTICE_BADGE[feature.practice]}</span>
        )}
        <i className="al-feat__chev" aria-hidden="true" />
      </button>

      <p className="al-feat__line">{line}</p>

      {open && (
        <div id={panelId} className="al-feat__panel">
          <ul className="al-feat__detail">
            {feature.detail.map((d) => <li key={d}>{d}</li>)}
          </ul>
          {visual && <div className="al-feat__visual">{visual}</div>}
          <p className="al-feat__foot">
            <span className="al-feat__output">{feature.output}</span>
          </p>
        </div>
      )}
    </div>
  );
}
