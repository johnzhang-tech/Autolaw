import { useEffect, useState } from 'react';
import { ARRIVALS, DOCUMENT_COUNT, SAMPLE_MARK } from '../../data/demoCase';
import './states.css';

const COUNT_MS = 240; // --al-duration-slow; the ceiling for any motion on the site

/** State 1. Documents land in arrival order and the total ticks to 214. */
export function Arrival() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / COUNT_MS);
      setCount(Math.round(t * DOCUMENT_COUNT));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="al-state al-arrival" data-testid="state-arrival">
      <div className="al-state__top">
        <div>
          <div className="al-state__case">Documents received</div>
          <div className="al-state__meta">In the order they arrived, not the order they happened</div>
        </div>
        <span className="al-state__mark">{SAMPLE_MARK}</span>
      </div>
      <div className="al-arrival__count">
        <span data-testid="arrival-count">{count}</span>
        <span className="al-arrival__of">of {DOCUMENT_COUNT}</span>
      </div>
      <ul className="al-arrival__chips" aria-label="Documents by type">
        {ARRIVALS.map((g, i) => (
          <li key={g.label} style={{ ['--i' as string]: i }}>
            {g.label}{g.count > 1 ? ` ×${g.count}` : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}
