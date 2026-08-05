import { useRef, useState } from 'react';
import { Section } from '../components/primitives/Section';
import { PRACTICE_OUTPUTS, type PracticeArea } from '../data/demoCase';
import './PracticeSolutions.css';

const AREAS: Array<{ key: PracticeArea; label: string }> = [
  { key: 'PI', label: 'Personal Injury' },
  { key: 'WC', label: "Workers' Compensation" },
];

export function PracticeSolutions() {
  const [active, setActive] = useState<PracticeArea>('PI');
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const content = PRACTICE_OUTPUTS[active];

  function onKeyDown(e: React.KeyboardEvent) {
    const fwd = e.key === 'ArrowRight';
    const back = e.key === 'ArrowLeft';
    if (!fwd && !back) return;
    e.preventDefault();
    const i = AREAS.findIndex((a) => a.key === active);
    const next = AREAS[(i + (fwd ? 1 : AREAS.length - 1)) % AREAS.length];
    setActive(next.key);
    refs.current[next.key]?.focus();
  }

  return (
    <Section
      id="solutions"
      eyebrow="Solutions"
      heading="Two practices, two products"
      intro="Personal injury and workers' compensation are isolated in the application at the route, navigation, and data layer — so each practice sees its own case, not a relabelled version of the other."
    >
      <div className="al-seg" role="tablist" aria-label="Practice area" onKeyDown={onKeyDown}>
        {AREAS.map((a) => (
          <button
            key={a.key}
            ref={(el) => { refs.current[a.key] = el; }}
            type="button"
            role="tab"
            id={`tab-${a.key}`}
            aria-controls={`panel-${a.key}`}
            aria-selected={active === a.key}
            tabIndex={active === a.key ? 0 : -1}
            onClick={() => setActive(a.key)}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div
        className="al-practice al-on-navy"
        id={`panel-${active}`}
        role="tabpanel"
        aria-labelledby={`tab-${active}`}
        tabIndex={0}
      >
        <h3>{content.heading}</h3>
        <p>{content.intro}</p>
        <div className="al-practice__outs">
          {content.items.map((item) => (
            <div key={item.title} className="al-practice__out">
              <b>{item.title}</b>
              <span>{item.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
