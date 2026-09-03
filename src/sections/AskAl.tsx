import { useRef, useState, type KeyboardEvent } from 'react';
import { Section } from '../components/primitives/Section';
import { ASK_AL_QA, SAMPLE_MARK, type Citation } from '../data/demoCase';
import './AskAl.css';

function CitationCard({ c }: { c: Citation }) {
  return (
    <div className="al-askal__card al-on-canvas" data-testid="askal-card">
      <div className="al-askal__card-head">
        <span className="al-askal__kind">{c.kind}</span>
        <span className="al-askal__status">{c.reviewStatus}</span>
      </div>
      <div className="al-askal__card-src">
        <b>{c.document}</b>
        <span>page {c.page}</span>
      </div>
      <p className="al-askal__excerpt">{c.excerpt}</p>
    </div>
  );
}

/**
 * Ask AL, limited to what ships: an answer from the case file, a citation on every
 * sentence, and a refusal when the file cannot support the question. No streaming, no
 * suggested prompts, no actions — those are roadmap, and the claim guard bans the words.
 */
export function AskAl() {
  const [active, setActive] = useState(0);
  const [openChip, setOpenChip] = useState<number | null>(null);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const q = ASK_AL_QA[active];
  const card = openChip === null ? null : q.citations.find((c) => c.n === openChip) ?? null;

  const select = (i: number) => {
    setActive(i);
    setOpenChip(null);
  };

  function onKeyDown(e: KeyboardEvent) {
    const fwd = e.key === 'ArrowRight' || e.key === 'ArrowDown';
    const back = e.key === 'ArrowLeft' || e.key === 'ArrowUp';
    if (!fwd && !back) return;
    e.preventDefault();
    const n = ASK_AL_QA.length;
    const next = (active + (fwd ? 1 : n - 1)) % n;
    select(next);
    tabs.current[next]?.focus();
  }

  return (
    <Section
      id="ask-al"
      eyebrow="Ask AL"
      heading="Ask the file, not the model"
      intro="Ask AL answers from the case file and nothing else. Every sentence cites a source you can open. Ask for something the file cannot support and it tells you so."
    >
      <div className="al-askal al-on-navy">
        <div className="al-askal__top">
          <div>
            <div className="al-askal__case">Ask AL</div>
            <div className="al-askal__meta">Demo matter — lumbar &amp; left shoulder</div>
          </div>
          <span className="al-askal__mark">{SAMPLE_MARK}</span>
        </div>

        {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus -- roving-tabindex
            pattern: onKeyDown delegates arrow keys to the child role="tab" buttons, which
            already carry tabIndex 0/-1; the tablist wrapper itself is never a tab stop. */}
        <div className="al-askal__questions" role="tablist" aria-label="Questions" onKeyDown={onKeyDown}>
          {ASK_AL_QA.map((item, i) => (
            <button
              key={item.id}
              ref={(el) => { tabs.current[i] = el; }}
              type="button"
              role="tab"
              id={`askal-tab-${item.id}`}
              aria-selected={i === active}
              aria-controls="askal-panel"
              tabIndex={i === active ? 0 : -1}
              onClick={() => select(i)}
            >
              {item.question}
            </button>
          ))}
        </div>

        <div id="askal-panel" role="tabpanel" aria-labelledby={`askal-tab-${q.id}`} className="al-askal__panel">
          <p className={`al-askal__answer${q.refusal ? ' al-askal__answer--refusal' : ''}`} data-testid="askal-answer">
            {q.answer.map((s, i) => (
              <span key={i}>
                {s.text}{s.cite !== null && <sup>[{s.cite}]</sup>}{i < q.answer.length - 1 ? ' ' : ''}
              </span>
            ))}
          </p>

          {q.citations.length > 0 && (
            <ul className="al-askal__chips" aria-label="Citations">
              {q.citations.map((c) => (
                <li key={c.n}>
                  <button
                    type="button"
                    data-testid="askal-chip"
                    aria-expanded={openChip === c.n}
                    aria-controls={openChip === c.n ? 'askal-card' : undefined}
                    onClick={() => setOpenChip(openChip === c.n ? null : c.n)}
                  >
                    <b>{c.n}</b>
                    <span>{c.kind}</span>
                    <span>{c.document}</span>
                    <span>pg. {c.page}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {card && <div id="askal-card"><CitationCard c={card} /></div>}
        </div>

        <p className="al-askal__foot">
          Available in every case today. It answers from the case file only, cites every
          sentence, and declines what it cannot ground.
        </p>
      </div>
    </Section>
  );
}
