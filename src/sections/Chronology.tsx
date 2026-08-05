import { useState } from 'react';
import { Chip } from '../components/primitives/Chip';
import { CHRONOLOGY } from '../data/demoCase';
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

          <div className="al-detail__actions">
            {/*
              "Confirm" and "Flag" are unambiguous beside the fact they act on and
              meaningless read out of context, which is how a screen reader reaches them.
              The accessible names say what is confirmed and that nothing is recorded.
            */}
            <button type="button" className="al-mini al-mini--go">{event.action}</button>
            <button type="button" className="al-mini" aria-label="Confirm this fact (demonstration only)">Confirm</button>
            <button type="button" className="al-mini" aria-label="Flag this fact for review (demonstration only)">Flag</button>
          </div>
        </div>
      </div>
    </div>
  );
}
