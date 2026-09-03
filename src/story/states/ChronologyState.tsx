import { useEffect, useState } from 'react';
import { Chip } from '../../components/primitives/Chip';
import { CHRONOLOGY, SAMPLE_MARK, type ChronologyEvent } from '../../data/demoCase';
import { SCHEDULE_URL, TRIAL_ENABLED, TRIAL_URL } from '../../config';
import './states.css';

export type Phase = 'connected' | 'conflict' | 'missing';

export function phaseFor(chapter: 2 | 3 | 4): Phase {
  return chapter === 2 ? 'connected' : chapter === 3 ? 'conflict' : 'missing';
}

/** Which event each phase opens. Indexes into CHRONOLOGY, which is in date order. */
export const PHASE_EVENT: Record<Phase, number> = { connected: 0, conflict: 3, missing: 2 };

interface SpineProps {
  selected: number;
  onSelect: (i: number) => void;
  phase: Phase;
}

/** The timeline. Every event is a real button; the citation line is always visible. */
export function Spine({ selected, onSelect, phase }: SpineProps) {
  return (
    <ul className="al-spine" data-phase={phase}>
      {CHRONOLOGY.map((e, i) => (
        <li key={e.date + e.title} className={`al-ev al-ev--${e.tone}`}>
          <button type="button" aria-expanded={i === selected} onClick={() => onSelect(i)}>
            <span className="al-ev__title">{e.title}</span>
            <span className="al-ev__cite">{e.date} · {e.source} · {e.page}</span>
            {e.flag && (
              <span className="al-ev__flag"><Chip tone="conflict">{e.flag}</Chip></span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}

/**
 * A page facsimile: the cited sentence set in the record face on a white page, with
 * faint rules standing in for the surrounding text. This is the site's rendering of what
 * the product does when a citation is opened — the page, with the passage highlighted.
 */
function PageFacsimile({ quote, page }: { quote: [string, string, string]; page: string }) {
  return (
    <div className="al-page" data-testid="page-facsimile">
      <div className="al-page__rules" aria-hidden="true"><i /><i /><i /></div>
      <p className="al-page__quote">
        {quote[0]}<mark>{quote[1]}</mark>{quote[2]}
      </p>
      <div className="al-page__rules" aria-hidden="true"><i /><i /></div>
      <span className="al-page__no">{page}</span>
    </div>
  );
}

export function CitationCard({ event, phase }: { event: ChronologyEvent; phase: Phase }) {
  return (
    <div className="al-cite al-on-canvas" data-testid="citation-card">
      <div className="al-cite__head">
        <span className="al-cite__src">{event.source}</span>
        <span className="al-cite__pg">{event.page}</span>
      </div>

      {event.warning && (
        <div className="al-cite__warn">
          <b>{event.warning.title}</b>
          <span>{event.warning.body}</span>
        </div>
      )}

      {event.quote && <PageFacsimile quote={event.quote} page={event.page} />}

      {event.counterpart && (
        <div className="al-cite__counter" data-testid="counterpart">
          <div className="al-cite__head">
            <span className="al-cite__src">{event.counterpart.source}</span>
            <span className="al-cite__pg">{event.counterpart.page}</span>
          </div>
          <p className="al-cite__quote">
            {event.counterpart.quote[0]}<mark>{event.counterpart.quote[1]}</mark>{event.counterpart.quote[2]}
          </p>
        </div>
      )}

      <dl className="al-cite__meta">
        {event.meta.map(([k, v]) => (
          <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
        ))}
        {event.confidence !== null && (
          <div>
            <dt>Extraction confidence</dt>
            <dd>
              <span className="al-conf"><span className="al-conf__fill" style={{ width: `${event.confidence}%` }} /></span>
              {event.confidence}%
            </dd>
          </div>
        )}
        {phase === 'missing' && (
          <div><dt>Review state</dt><dd>Needs review</dd></div>
        )}
      </dl>

      <div className="al-cite__actions">
        {/* Labels, not controls: what the product offers on a fact. "Confirm" and "Dismiss"
            are the review queue's own words. */}
        <ul className="al-cite__offers">
          <li>{event.action}</li>
          <li>Confirm</li>
          <li>Dismiss</li>
        </ul>
        {TRIAL_ENABLED ? (
          <a className="al-mini al-mini--go" href={TRIAL_URL}>Try this on one of your reports</a>
        ) : (
          <a className="al-mini al-mini--go" href={SCHEDULE_URL}>See it on your own matter</a>
        )}
      </div>
    </div>
  );
}

/**
 * States 2, 3 and 4 in one component so the spine's DOM persists across them and the
 * card genuinely rises out of the row that produced it. A phase change moves the
 * selection; a click moves it again. The phase does not fight the reader afterwards.
 */
export function ChronologyState({ phase }: { phase: Phase }) {
  const [selected, setSelected] = useState(PHASE_EVENT[phase]);

  useEffect(() => {
    setSelected(PHASE_EVENT[phase]);
  }, [phase]);

  const event = CHRONOLOGY[selected];

  return (
    <div className="al-state al-chron" data-testid="state-chronology" data-phase={phase}>
      <div className="al-state__top">
        <div>
          <div className="al-state__case">Medical chronology</div>
          <div className="al-state__meta">Select any event</div>
        </div>
        <span className="al-state__mark">{SAMPLE_MARK}</span>
      </div>
      <div className="al-chron__body">
        <Spine selected={selected} onSelect={setSelected} phase={phase} />
        <CitationCard event={event} phase={phase} />
      </div>
    </div>
  );
}
