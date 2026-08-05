import { CASE_SUMMARY, SIGNALS } from '../data/demoCase';
import './SignalCockpit.css';

export function SignalCockpit() {
  const label =
    `Case signal cockpit for a demonstration case: ` +
    SIGNALS.map((s) => `${s.count} ${s.label.toLowerCase()}`).join(', ') + '.';

  return (
    <div className="al-cockpit al-on-navy" role="img" aria-label={label}>
      <div className="al-cockpit__top">
        <div>
          <div className="al-cockpit__case">{CASE_SUMMARY.title}</div>
          <div className="al-cockpit__meta">{CASE_SUMMARY.meta}</div>
        </div>
        <span className="al-cockpit__live">
          <i className="al-cockpit__pulse" aria-hidden="true" />
          Live
        </span>
      </div>
      <div className="al-cockpit__tiles">
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
