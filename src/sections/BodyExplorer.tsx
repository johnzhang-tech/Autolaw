import { useRef, useState } from 'react';
import { BODY_REGIONS } from '../data/demoCase';
import './BodyExplorer.css';

/** Hit-area rectangles, matched to the figure drawn below. */
const HITS: Record<string, { x: number; y: number; w: number; h: number; r: number }> = {
  cervical: { x: 47, y: 37, w: 26, h: 13, r: 5 },
  shoulder: { x: 18, y: 50, w: 20, h: 20, r: 8 },
  lumbar: { x: 44, y: 96, w: 32, h: 26, r: 7 },
  knee: { x: 61, y: 196, w: 18, h: 18, r: 7 },
};

/** Ordered to match visual top-to-bottom so arrow keys feel physical. */
const ORDER = ['cervical', 'shoulder', 'lumbar', 'knee'];

export function BodyExplorer() {
  const [activeKey, setActiveKey] = useState('lumbar');
  const refs = useRef<Record<string, SVGRectElement | null>>({});
  const region = BODY_REGIONS.find((r) => r.key === activeKey)!;

  function onKeyDown(e: React.KeyboardEvent, key: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveKey(key);
      return;
    }
    const fwd = e.key === 'ArrowRight' || e.key === 'ArrowDown';
    const back = e.key === 'ArrowLeft' || e.key === 'ArrowUp';
    if (!fwd && !back) return;
    e.preventDefault();
    const i = ORDER.indexOf(key);
    const next = ORDER[(i + (fwd ? 1 : ORDER.length - 1)) % ORDER.length];
    setActiveKey(next);
    refs.current[next]?.focus();
  }

  return (
    <div className="al-bx al-on-navy">
      <h3 className="al-bx__title">Body explorer</h3>
      <p className="al-bx__note">
        Demonstration data &middot; teal marks a claimed region &middot; use arrow keys or click
      </p>

      <div className="al-bx__body">
        <div className="al-bx__fig">
          <svg viewBox="0 0 120 260" role="group" aria-label="Body region selector">
            <g className="al-bx__base">
              <circle cx="60" cy="22" r="15" />
              <rect x="46" y="38" width="28" height="10" rx="4" />
              <rect x="36" y="48" width="48" height="66" rx="12" />
              <rect x="38" y="112" width="44" height="40" rx="8" />
              <rect x="20" y="52" width="14" height="62" rx="7" />
              <rect x="86" y="52" width="14" height="62" rx="7" />
              <rect x="22" y="112" width="12" height="40" rx="6" />
              <rect x="86" y="112" width="12" height="40" rx="6" />
              <rect x="42" y="152" width="16" height="60" rx="8" />
              <rect x="62" y="152" width="16" height="60" rx="8" />
              <rect x="42" y="212" width="16" height="36" rx="8" />
              <rect x="62" y="212" width="16" height="36" rx="8" />
            </g>
            {ORDER.map((key) => {
              const meta = BODY_REGIONS.find((r) => r.key === key)!;
              const hit = HITS[key];
              const on = key === activeKey;
              return (
                <rect
                  key={key}
                  ref={(el) => { refs.current[key] = el; }}
                  className={`al-bx__region${meta.claimed ? ' is-claimed' : ''}${on ? ' is-on' : ''}`}
                  x={hit.x} y={hit.y} width={hit.w} height={hit.h} rx={hit.r}
                  tabIndex={0}
                  role="button"
                  aria-pressed={on}
                  aria-label={`${meta.label}${meta.claimed ? ', claimed' : ''}`}
                  onClick={() => setActiveKey(key)}
                  onKeyDown={(e) => onKeyDown(e, key)}
                />
              );
            })}
          </svg>
          <div className="al-bx__legend">
            <span><i style={{ background: 'var(--al-teal)' }} />Claimed</span>
            <span><i style={{ background: 'var(--al-state-neutral)' }} />Not claimed</span>
          </div>
        </div>

        <div className="al-bx__info al-on-canvas" data-testid="body-detail" aria-live="polite">
          <h4>{region.label}</h4>
          <p className="al-bx__plain">{region.plain}</p>
          <div className="al-bx__rows">
            {region.rows.map((row) => (
              <div key={row.label} className={`al-bx__row${row.warn ? ' is-warn' : ''}`}>
                <b>{row.label}</b>
                <span>{row.value}</span>
                <cite data-testid="cite">{row.cite}</cite>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
