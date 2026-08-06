import { useState } from 'react';
import { Chip } from '../components/primitives/Chip';
import { CHRONOLOGY } from '../data/demoCase';
import { TRIAL_URL } from '../config';
import './Chronology.css';

export function Chronology() {
  const [active, setActive] = useState(0);
  const event = CHRONOLOGY[active];

  return (
    <div className="al-chron al-on-navy">
      <div className="al-chron__head">
        <h3 className="al-chron__title">Medical chronology</h3>
        <p className="al-chron__note">Demonstration data &middot; select any event</p>
      </div>

      <div className="al-chron__body">
        <ul className="al-chron__spine">
          {CHRONOLOGY.map((e, i) => (
            <li key={e.date + e.title} className={`al-ev al-ev--${e.tone}`}>
              <button
                type="button"
                aria-expanded={i === active}
                onClick={() => setActive(i)}
              >
                <span className="al-ev__date">{e.date}</span>
                <span className="al-ev__title">{e.title}</span>
                <span className="al-ev__provider">{e.provider}</span>
                {e.flag && (
                  <span className="al-ev__flag">
                    <Chip tone="conflict">{e.flag}</Chip>
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>

        <div
          className="al-chron__detail al-on-canvas"
          data-testid="chronology-detail"
          aria-live="polite"
        >
          <div className="al-detail__head">
            <span className="al-detail__src">{event.source}</span>
            <span className="al-detail__pg">{event.page}</span>
          </div>

          {event.warning && (
            <div className="al-detail__warn">
              <b>{event.warning.title}</b>
              {event.warning.body}
            </div>
          )}

          {event.quote && (
            <p className="al-detail__quote">
              {event.quote[0]}
              <mark>{event.quote[1]}</mark>
              {event.quote[2]}
            </p>
          )}

          <dl className="al-detail__meta">
            {event.meta.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
            {/*
              Named "Extraction confidence", not "Confidence". A bare percentage sitting
              next to a Confirm button reads as the machine's view of whether the fact is
              true, which competes with the promise that only an attorney makes it one.
              The label says what the number actually measures.
            */}
            {event.confidence !== null && (
              <div>
                <dt>Extraction confidence</dt>
                <dd>
                  <span className="al-conf">
                    <span className="al-conf__fill" style={{ width: `${event.confidence}%` }} />
                  </span>
                  {event.confidence}%
                </dd>
              </div>
            )}
          </dl>

          {/*
            These name the actions the product offers on a fact; on this page they are
            labels, not controls. Rendering them as <button> made them focusable, announced
            as buttons, and completely inert — a dead "Draft records request" on the section
            whose whole argument is that it demonstrates rather than asserts. The one live
            action is the trial link, which is the thing a visitor can actually do next.
          */}
          <div className="al-detail__actions">
            <ul className="al-detail__offers">
              <li>{event.action}</li>
              <li>Confirm</li>
              <li>Flag</li>
            </ul>
            <a className="al-mini al-mini--go" href={TRIAL_URL}>
              Try this on your own case
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
