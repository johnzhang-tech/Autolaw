import { CASE_SUMMARY, SIGNALS, SAMPLE_MARK } from '../../data/demoCase';
import './states.css';

/** State 0. The hero's panel: case identity and the six signal tiles. */
export function Signals() {
  const label =
    `Demonstration case summary: ` +
    SIGNALS.map((s) => `${s.count} ${s.label.toLowerCase()}`).join(', ') + '.';

  return (
    <div className="al-state al-signals" data-testid="state-signals" role="img" aria-label={label}>
      <div className="al-state__top">
        <div>
          <div className="al-state__case">{CASE_SUMMARY.title}</div>
          <div className="al-state__meta">{CASE_SUMMARY.meta}</div>
        </div>
        <span className="al-state__mark">{SAMPLE_MARK}</span>
      </div>
      <div className="al-signals__tiles">
        {SIGNALS.map((s) => (
          <div key={s.label} className={`al-tile al-tile--${s.tone}`}>
            <div className="al-tile__n">{s.count}</div>
            <div className="al-tile__l">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
