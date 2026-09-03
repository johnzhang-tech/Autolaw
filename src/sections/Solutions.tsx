import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Section } from '../components/primitives/Section';
import { Silhouette } from './Silhouette';
import { usePractice, type Practice } from '../practice/PracticeContext';
import { PI_PANEL, WC_PANEL, SAMPLE_MARK, type PanelTab } from '../data/demoCase';
import './Solutions.css';

const AREAS: Array<{ key: Practice; label: string }> = [
  { key: 'PI', label: 'Personal injury' },
  { key: 'WC', label: 'Workers’ compensation' },
];

/** A roving-tabindex tab strip. Generic so both panels use one implementation. */
function TabStrip({ name, tabs, active, onChange }: { name: string; tabs: ReadonlyArray<PanelTab>; active: string; onChange: (id: string) => void }) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  function onKeyDown(e: KeyboardEvent) {
    const fwd = e.key === 'ArrowRight';
    const back = e.key === 'ArrowLeft';
    if (!fwd && !back) return;
    e.preventDefault();
    const i = tabs.findIndex((t) => t.id === active);
    const next = tabs[(i + (fwd ? 1 : tabs.length - 1)) % tabs.length];
    onChange(next.id);
    refs.current[next.id]?.focus();
  }
  return (
    <div className="al-sol__tabs" role="tablist" aria-label={name} onKeyDown={onKeyDown}>
      {tabs.map((t) => (
        <button
          key={t.id}
          ref={(el) => { refs.current[t.id] = el; }}
          type="button"
          role="tab"
          id={`sol-tab-${t.id}`}
          aria-selected={t.id === active}
          aria-controls={`sol-screen-${t.id}`}
          tabIndex={t.id === active ? 0 : -1}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function Screen({ id, children }: { id: string; children: ReactNode }) {
  return <div id={`sol-screen-${id}`} role="tabpanel" aria-labelledby={`sol-tab-${id}`} className="al-sol__screen">{children}</div>;
}

function PiPanel() {
  const [tab, setTab] = useState('medical');
  return (
    <div className="al-sol__panel al-on-navy" data-testid="sol-panel">
      <div className="al-sol__head">
        <div><div className="al-sol__title">PI Overview</div><div className="al-sol__note">The personal injury workflow’s screens</div></div>
        <span className="al-sol__mark">{SAMPLE_MARK}</span>
      </div>
      <TabStrip name="PI screens" tabs={PI_PANEL.tabs} active={tab} onChange={setTab} />
      {tab === 'medical' && (
        <Screen id="medical">
          <ul className="al-sol__tiers" aria-label="Evidence tiers">
            {PI_PANEL.evidenceTiers.map((t) => <li key={t}>{t}</li>)}
          </ul>
          <dl className="al-sol__rows">
            {PI_PANEL.medical.map((m) => (
              <div key={m.label}><dt>{m.label}</dt><dd>{m.value}<span className="al-sol__tier">{m.tier}</span></dd></div>
            ))}
          </dl>
        </Screen>
      )}
      {tab === 'liability' && (
        <Screen id="liability">
          <ul className="al-sol__readiness">
            {PI_PANEL.liability.map((l) => (
              <li key={l.component}><span>{l.component}</span><b className={l.state === 'Complete' ? 'is-complete' : 'is-open'}>{l.state}</b></li>
            ))}
          </ul>
        </Screen>
      )}
      {tab === 'damages' && (
        <Screen id="damages">
          <dl className="al-sol__rows">
            {PI_PANEL.wage.map((w) => <div key={w.label}><dt>{w.label}</dt><dd>{w.value}</dd></div>)}
          </dl>
        </Screen>
      )}
      <p className="al-sol__outputs"><b>What it produces:</b> {PI_PANEL.outputs.join(' · ')}</p>
    </div>
  );
}

function WcPanel() {
  const [tab, setTab] = useState('summary');
  return (
    <div className="al-sol__panel al-on-navy" data-testid="sol-panel">
      <div className="al-sol__head">
        <div><div className="al-sol__title">WC Intelligence</div><div className="al-sol__note">The workers’ compensation workflow’s screens</div></div>
        <span className="al-sol__mark">{SAMPLE_MARK}</span>
      </div>
      <TabStrip name="WC screens" tabs={WC_PANEL.tabs} active={tab} onChange={setTab} />
      {tab === 'summary' && (
        <Screen id="summary">
          <ul className="al-sol__cards">
            {WC_PANEL.readiness.map((c) => (
              <li key={c.label}><span>{c.label}</span><b>{c.value}</b><small>{c.detail}</small></li>
            ))}
          </ul>
        </Screen>
      )}
      {tab === 'injury' && (
        <Screen id="injury"><Silhouette /></Screen>
      )}
      {tab === 'benefits' && (
        <Screen id="benefits">
          <ul className="al-sol__cards">
            {WC_PANEL.benefits.map((b) => <li key={b.label}><span>{b.label}</span><b>{b.value}</b></li>)}
          </ul>
        </Screen>
      )}
      {tab === 'disputes' && (
        <Screen id="disputes">
          <div className="al-sol__dispute">
            <div className="al-sol__badges"><span>{WC_PANEL.conflict.severity}</span><span>{WC_PANEL.conflict.category}</span><span className="is-status">{WC_PANEL.conflict.status}</span></div>
            <b>{WC_PANEL.conflict.title}</b>
            <p>{WC_PANEL.conflict.explanation}</p>
          </div>
          <div className="al-sol__dispute al-sol__dispute--missing">
            <div className="al-sol__badges"><span>{WC_PANEL.missing.type}</span><span className="is-status">{WC_PANEL.missing.status}</span></div>
            <b>{WC_PANEL.missing.title}</b>
            <p>{WC_PANEL.missing.summary}</p>
            <p className="al-sol__needed">{WC_PANEL.missing.needed}</p>
          </div>
        </Screen>
      )}
      <p className="al-sol__outputs"><b>What it produces:</b> {WC_PANEL.outputs.join(' · ')}</p>
    </div>
  );
}

export function Solutions() {
  const { practice, setPractice } = usePractice();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  function onKeyDown(e: KeyboardEvent) {
    const fwd = e.key === 'ArrowRight';
    const back = e.key === 'ArrowLeft';
    if (!fwd && !back) return;
    e.preventDefault();
    const i = AREAS.findIndex((a) => a.key === practice);
    const next = AREAS[(i + (fwd ? 1 : AREAS.length - 1)) % AREAS.length];
    setPractice(next.key);
    refs.current[next.key]?.focus();
  }

  return (
    <Section
      id="solutions"
      eyebrow="Solutions"
      heading="Two practices, two workflows"
      intro="Personal injury and workers’ compensation run as separate workflows on one engine, not one workflow with the labels swapped. These are the screens each one opens."
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
            aria-selected={practice === a.key}
            tabIndex={practice === a.key ? 0 : -1}
            onClick={() => setPractice(a.key)}
          >
            {a.label}
          </button>
        ))}
      </div>
      <div id={`panel-${practice}`} role="tabpanel" aria-labelledby={`tab-${practice}`}>
        {practice === 'PI' ? <PiPanel /> : <WcPanel />}
      </div>
    </Section>
  );
}
