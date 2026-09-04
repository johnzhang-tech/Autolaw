import { useRef, useState, type KeyboardEvent } from 'react';
import { BODY_REGIONS, SAMPLE_MARK, type BodyRegion } from '../data/demoCase';
import './Silhouette.css';

/**
 * Visual top-to-bottom order, left before right, so the arrow keys feel physical.
 * Ordered by each region's own centre in HITS below — lumbar (centre 210) sits above the
 * hands (247), which an earlier order had reversed. The test asserts the two agree rather
 * than restating this list, so the order cannot drift from the drawing again.
 */
export const SIL_ORDER = ['cervical', 'shoulder', 'shoulder-right', 'lumbar', 'hand-left', 'hand-right', 'knee-left', 'knee'] as const;

/**
 * Hit targets in figure units (viewBox 220×440). Each side is ≥ 27 units: see the test.
 *
 * `label[1]` is a text BASELINE, not a centre, so it sits about 5 units below its
 * region's own centre (`y + h / 2`) for the label to look level with it. With no
 * connector drawn, that alignment is what tells a reader which label belongs to which
 * region, so the test asserts it. No two regions at the same height share a side, so
 * every label can take its ideal position without colliding with a neighbour.
 */
export const HITS: Record<(typeof SIL_ORDER)[number], { x: number; y: number; w: number; h: number; r: number; label: [number, number]; anchor: 'start' | 'end' }> = {
  // Right-side labels anchor 'end' at x=216 (a 4-unit margin mirroring the left side's
  // x=4) so the text grows leftward, toward the figure, and stays inside the 220-wide
  // viewBox. Anchored 'start' at x=176 they measured up to 265 in a real browser —
  // jsdom can't see that clipping, since it never lays out SVG text.
  cervical:         { x: 96,  y: 60,  w: 28, h: 27, r: 8,  label: [216, 78],  anchor: 'end' },
  shoulder:         { x: 56,  y: 90,  w: 30, h: 28, r: 10, label: [4, 109],    anchor: 'start' },
  'shoulder-right': { x: 134, y: 90,  w: 30, h: 28, r: 10, label: [216, 109], anchor: 'end' },
  'hand-left':      { x: 30,  y: 232, w: 28, h: 30, r: 9,  label: [4, 252],   anchor: 'start' },
  'hand-right':     { x: 162, y: 232, w: 28, h: 30, r: 9,  label: [216, 252], anchor: 'end' },
  lumbar:           { x: 86,  y: 194, w: 48, h: 32, r: 10, label: [216, 215], anchor: 'end' },
  'knee-left':      { x: 78,  y: 306, w: 28, h: 28, r: 9,  label: [4, 325],   anchor: 'start' },
  knee:             { x: 114, y: 306, w: 28, h: 28, r: 9,  label: [216, 325], anchor: 'end' },
};

/* One outline. Front view, no face, no musculature: medical illustration in restraint. */
const OUTLINE = 'M110 12c-15 0-26 12-26 27 0 12 6 22 15 26v12c-22 3-40 11-50 26-8 12-11 30-13 50l-7 66c-1 8 3 13 9 13s10-4 11-10l9-58 4-22v44c-3 30-4 62-2 92l7 110c1 10 6 15 13 15s11-5 11-14l4-108 8-56 8 56 4 108c0 9 4 14 11 14s12-5 13-15l7-110c2-30 1-62-2-92v-44l4 22 9 58c1 6 5 10 11 10s10-5 9-13l-7-66c-2-20-5-38-13-50-10-15-28-23-50-26v-12c9-4 15-14 15-26 0-15-11-27-26-27z';

type Key = (typeof SIL_ORDER)[number];

/**
 * The spoken status for each tone. Read straight off `BodyRegion['tone']` — a
 * structural fact of the data — rather than inferred by sniffing row prose, so a
 * region worded differently from the others can never be misclassified.
 */
const STATUS: Record<BodyRegion['tone'], string> = {
  accepted: 'accepted body part',
  disputed: 'not an accepted body part, disputed',
  none: 'not an accepted body part, no records',
};

/**
 * The body-part figure the WC workflow's Injury & Work Status screen is built around.
 * Regions are real buttons; the status is in each button's name and in a label beside
 * the figure, so colour is never the only carrier.
 */
export function Silhouette() {
  const [activeKey, setActiveKey] = useState<Key>('lumbar');
  const refs = useRef<Partial<Record<Key, SVGRectElement | null>>>({});
  const region = BODY_REGIONS.find((r) => r.key === activeKey)!;

  function onKeyDown(e: KeyboardEvent, key: Key) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveKey(key); return; }
    const fwd = e.key === 'ArrowRight' || e.key === 'ArrowDown';
    const back = e.key === 'ArrowLeft' || e.key === 'ArrowUp';
    if (!fwd && !back) return;
    e.preventDefault();
    const i = SIL_ORDER.indexOf(key);
    const next = SIL_ORDER[(i + (fwd ? 1 : SIL_ORDER.length - 1)) % SIL_ORDER.length];
    setActiveKey(next);
    refs.current[next]?.focus();
  }

  return (
    <div className="al-sil al-on-navy">
      <div className="al-sil__head">
        <div>
          <div className="al-sil__title">Injury &amp; Work Status</div>
          <div className="al-sil__note">Select a region, or use the arrow keys</div>
        </div>
        <span className="al-sil__mark">{SAMPLE_MARK}</span>
      </div>
      <div className="al-sil__body">
        <div className="al-sil__fig">
          <svg viewBox="0 0 220 440" role="group" aria-label="Body region selector">
            <path className="al-sil__outline" d={OUTLINE} />
            {SIL_ORDER.map((key) => {
              const meta = BODY_REGIONS.find((r) => r.key === key)!;
              const h = HITS[key];
              const on = key === activeKey;
              const tone = meta.tone === 'accepted' ? 'on' : meta.tone;
              return (
                <g key={key}>
                  {/* No connector line: at this figure size a label is wider than the
                      gutter beside it, so any line long enough to reach one would cross
                      it. The label sits at its region's own height, on its own side, and
                      carries the status in words — which is what the colour must not be
                      the only carrier of. */}
                  <text
                    className={`al-sil__label al-sil__label--${tone}`}
                    x={h.label[0]}
                    y={h.label[1]}
                    textAnchor={h.anchor}
                    aria-hidden="true"
                  >{meta.label}</text>
                  <rect
                    ref={(el) => { refs.current[key] = el; }}
                    className={`al-sil__region al-sil__region--${tone}${on ? ' is-on' : ''}`}
                    x={h.x} y={h.y} width={h.w} height={h.h} rx={h.r}
                    tabIndex={0}
                    role="button"
                    aria-pressed={on}
                    aria-label={`${meta.label}, ${STATUS[meta.tone]}`}
                    onClick={() => setActiveKey(key)}
                    onKeyDown={(e) => onKeyDown(e, key)}
                  />
                </g>
              );
            })}
          </svg>
          <div className="al-sil__legend">
            <span><i className="al-sil__sw al-sil__sw--on" />Accepted</span>
            <span><i className="al-sil__sw al-sil__sw--disputed" />Disputed</span>
            <span><i className="al-sil__sw al-sil__sw--none" />No records</span>
          </div>
        </div>

        <div className="al-sil__detail al-on-canvas" data-testid="sil-detail" aria-live="polite">
          <h4>{region.label}</h4>
          <p className="al-sil__plain">{region.plain}</p>
          <div className="al-sil__rows">
            {region.rows.map((row) => (
              <div key={row.label} className={`al-sil__row${row.warn ? ' is-warn' : ''}`}>
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
