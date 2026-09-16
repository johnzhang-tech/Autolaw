import { useId, useState, type ReactNode } from 'react';
import { AVAILABILITY_LABEL, type Feature } from '../../data/product';
import type { Practice } from '../../practice/PracticeContext';

/*
 * Deliberately short forms, and deliberately not shared with the `AREAS` copy in
 * Solutions.tsx (which spells out "Workers’ compensation"). This badge sits inside a
 * card that has no room for the long form — do not consolidate the two into one constant.
 */
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
        {/*
          Name, tag, and badge share this wrapper so they can wrap onto a second line as a
          group while the chevron — a sibling of the wrapper, not of these three — stays
          pinned beside the first line instead of being pushed onto a lonely row of its own.
        */}
        <span className="al-feat__head">
          <span className="al-feat__name">{feature.name}</span>
          {/*
            JSX drops the whitespace between adjacent expression children (there is no text
            node between two `{...}` siblings), so without the literal `{' '}` below the
            accessible name runs the parts together: "NameTagBadge". CSS `gap` in Task 3
            handles the visible spacing regardless; this space is what a screen reader needs.
          */}
          {label && (
            <>
              {' '}
              <span className="al-feat__tag">{label}</span>
            </>
          )}
          {feature.practice !== 'both' && (
            <>
              {' '}
              <span className="al-feat__badge">{PRACTICE_BADGE[feature.practice]}</span>
            </>
          )}
        </span>
        <i className="al-feat__chev" aria-hidden="true" />
      </button>

      <p className="al-feat__line">{line}</p>

      {open && (
        <div id={panelId} className="al-feat__panel">
          <ul className="al-feat__detail">
            {feature.detail.map((d, i) => <li key={i}>{d}</li>)}
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
