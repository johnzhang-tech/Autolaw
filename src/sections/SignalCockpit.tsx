import { CASE_SUMMARY, SIGNALS } from '../data/demoCase';
import './SignalCockpit.css';

export function SignalCockpit() {
  /*
   * "Cockpit" is an internal name for the panel. It appeared only here, which made a
   * screen-reader user the one person on the site who had to learn it.
   */
  const label =
    `Demonstration case summary: ` +
    SIGNALS.map((s) => `${s.count} ${s.label.toLowerCase()}`).join(', ') + '.';

  return (
    <div className="al-cockpit al-on-navy" role="img" aria-label={label}>
      <div className="al-cockpit__top">
        <div>
          <div className="al-cockpit__case">{CASE_SUMMARY.title}</div>
          <div className="al-cockpit__meta">{CASE_SUMMARY.meta}</div>
        </div>
        {/*
          Not "Live", and no pulse. The figures below are static and fictional; an
          animated indicator over them manufactured an impression of activity that
          nothing behind it supports — the same defect as the placeholder logos this
          rebuild removed, and it was hidden from screen readers on top of that.
        */}
        <span className="al-cockpit__live">Sample data</span>
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
