import { useEffect, useState } from 'react';
import { ASK_AL_PREVIEW, SAMPLE_MARK } from '../../data/demoCase';
import './states.css';

/**
 * Reveal `full` one character at a time over `ms`. Returns a cancel function. Uses
 * setTimeout rather than rAF so the total time is bounded whatever the frame rate.
 */
export function typeOut(full: string, ms: number, onTick: (s: string) => void): () => void {
  const step = Math.max(8, Math.floor(ms / Math.max(1, full.length)));
  let i = 0;
  let timer = 0;
  const tick = () => {
    i += 1;
    onTick(full.slice(0, i));
    if (i < full.length) timer = window.setTimeout(tick, step);
  };
  timer = window.setTimeout(tick, step);
  return () => window.clearTimeout(timer);
}

/** Typing is a longer beat than a transition. It is text appearing, not the page moving. */
const TYPE_MS = 900;

/** State 5. One question typed in, one grounded answer, its citations as chips. */
export function AskPreview() {
  const [typed, setTyped] = useState('');
  const done = typed === ASK_AL_PREVIEW.question;

  useEffect(() => typeOut(ASK_AL_PREVIEW.question, TYPE_MS, setTyped), []);

  return (
    <div className="al-state al-ask" data-testid="state-ask">
      <div className="al-state__top">
        <div>
          <div className="al-state__case">Ask AL</div>
          <div className="al-state__meta">Answers only from this case file</div>
        </div>
        <span className="al-state__mark">{SAMPLE_MARK}</span>
      </div>

      <div className="al-ask__input" aria-label="Question">
        <span className="al-ask__q" data-testid="ask-question">{typed}<i className="al-ask__caret" aria-hidden="true" /></span>
        <span className="al-ask__go">Ask →</span>
      </div>

      <div className={`al-ask__answer${done ? ' is-in' : ''}`} data-testid="ask-answer" aria-live="off">
        <p>
          {ASK_AL_PREVIEW.answer.map((s, i) => (
            <span key={i}>
              {s.text}{s.cite !== null && <sup>[{s.cite}]</sup>}{i < ASK_AL_PREVIEW.answer.length - 1 ? ' ' : ''}
            </span>
          ))}
        </p>
        <ul className="al-ask__chips" aria-label="Citations">
          {ASK_AL_PREVIEW.chips.map((c) => (
            <li key={c.n} data-testid="ask-chip">
              <b>{c.n}</b>
              <span>{c.kind}</span>
              <span>{c.document}</span>
              <span>pg. {c.page}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
