import { OUTPUT_ROWS, EXPORT_RULE, SAMPLE_MARK } from '../../data/demoCase';
import './states.css';

/** State 7. What the firm takes away, and the rule that gates the export. */
export function Output() {
  return (
    <div className="al-state al-output" data-testid="state-output">
      <div className="al-state__top">
        <div>
          <div className="al-state__case">Work product</div>
          <div className="al-state__meta">Every line traceable to a page</div>
        </div>
        <span className="al-state__mark">{SAMPLE_MARK}</span>
      </div>

      <ul className="al-output__rows">
        {OUTPUT_ROWS.map((r) => (
          <li key={r.label}>
            <b>{r.label}</b>
            <span>{r.value}</span>
          </li>
        ))}
      </ul>

      <div className="al-output__export">
        <span className="al-review__btn al-review__btn--go" aria-disabled="true">Export DOCX</span>
        <p>{EXPORT_RULE}</p>
      </div>
    </div>
  );
}
