# Autolaw Product Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the seven-chapter scroll story with a Pre-Litigation / Litigation feature grid named in the practice's own vocabulary, then fix navigation, Security and About around it.

**Architecture:** One data module (`src/data/product.ts`) is the single source of truth for every feature, its sales line, its practice, its phases and its availability. A `Product` section renders two phase columns of `FeatureCard`s plus a cross-phase strip and a "Coming next" row. The story engine's stage visuals survive as standalone components mounted inside expanded cards; the pinned-scroll orchestration is deleted. The claim guard grows two rules so an unbuilt feature cannot be silently promoted to a live one.

**Tech Stack:** React 19 + TypeScript, Vite, Vitest + Testing Library, ESLint (react-hooks, jsx-a11y). Styling is hand-written CSS using the `--al-*` tokens in `src/styles/tokens.css`. `npm test` runs lint then the suite.

**Spec:** `docs/superpowers/specs/2026-09-15-autolaw-product-section-design.md`

---

### Task 1: The product data module

**Files:**
- Create: `src/data/product.ts`
- Test: `src/data/__tests__/product.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { FEATURES, PLATFORM, PHASES, type Feature } from '../product';

const inPhase = (p: 'pre-lit' | 'litigation') => FEATURES.filter((f) => f.phases.includes(p));

describe('product data', () => {
  it('gives every feature a sales line and something to expand into', () => {
    FEATURES.forEach((f: Feature) => {
      expect(f.name.length).toBeGreaterThan(0);
      expect(f.line.length).toBeGreaterThan(0);
      expect(f.detail.length).toBeGreaterThanOrEqual(2);
      expect(f.phases.length).toBeGreaterThan(0);
    });
  });

  it('uses unique ids', () => {
    expect(new Set(FEATURES.map((f) => f.id)).size).toBe(FEATURES.length);
  });

  it('fills both phase columns', () => {
    expect(inPhase('pre-lit').length).toBeGreaterThanOrEqual(8);
    expect(inPhase('litigation').length).toBeGreaterThanOrEqual(5);
  });

  it('promises no output for a feature that does not exist yet', () => {
    FEATURES.filter((f) => f.availability === 'coming-next')
      .forEach((f) => expect(f.output).toBe('Not yet available'));
  });

  it('keeps every phase heading and its line', () => {
    expect(PHASES['pre-lit'].heading).toBe('Pre-Litigation');
    expect(PHASES['litigation'].heading).toBe('Litigation');
    Object.values(PHASES).forEach((p) => expect(p.line.length).toBeGreaterThan(0));
  });

  it('names the cross-phase strip items', () => {
    expect(PLATFORM.length).toBeGreaterThanOrEqual(3);
    PLATFORM.forEach((p) => expect(p.line.length).toBeGreaterThan(0));
  });

  it('claims no accuracy percentage anywhere in the copy', () => {
    const all = FEATURES.flatMap((f) => [f.line, f.wcLine ?? '', ...f.detail]).join(' ');
    expect(all).not.toMatch(/\d+\s*%/);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/data/__tests__/product.test.ts`
Expected: FAIL — cannot find module `../product`.

- [ ] **Step 3: Write the data module**

Create `src/data/product.ts`:

```ts
/**
 * Every feature the site names, in one place.
 *
 * `availability` is a claim, not a decoration. `live` renders no label, so the absence
 * of a label IS the assertion that a customer can reach the feature today. Nothing may
 * be moved to `live` without checking case-app: see the audit recorded in
 * docs/superpowers/specs/2026-09-15-autolaw-product-section-design.md, and the guard in
 * src/__tests__/claims.test.tsx that fails the build if a non-live feature loses its label.
 */
export type Availability = 'live' | 'early-access' | 'coming-next';
export type Phase = 'pre-lit' | 'litigation';

/**
 * Deliberately NOT named `Practice`. PracticeContext already exports that name for the
 * visitor's chosen practice, which is 'PI' | 'WC' with no 'both' — two same-named types
 * with different members is how a file ends up importing the wrong one and still compiling.
 */
export type FeaturePractice = 'PI' | 'WC' | 'both';

export interface Feature {
  id: string;
  name: string;
  line: string;
  /** Practice-specific replacement for `line`. Only the Damages Ledger needs one today. */
  wcLine?: string;
  practice: FeaturePractice;
  phases: ReadonlyArray<Phase>;
  availability: Availability;
  detail: ReadonlyArray<string>;
  output: string;
}

export const AVAILABILITY_LABEL: Record<Exclude<Availability, 'live'>, string> = {
  'early-access': 'Early access',
  'coming-next': 'Coming next',
};

export const PHASES: Record<Phase, { heading: string; line: string }> = {
  'pre-lit': {
    heading: 'Pre-Litigation',
    line: 'Build the file. Prove the damages. Send the demand.',
  },
  litigation: {
    heading: 'Litigation',
    line: 'The same file, ready for the fight.',
  },
};

export const FEATURES: ReadonlyArray<Feature> = [
  {
    id: 'ask-al',
    name: 'Ask AL',
    line: 'Ask anything about the case. Every answer cites document, page, and line.',
    practice: 'both',
    phases: ['pre-lit', 'litigation'],
    availability: 'live',
    detail: [
      'Answers come from this case file and nothing else.',
      'Every sentence carries a citation you can open.',
      'Ask for something the file cannot support and it says so.',
    ],
    output: 'On screen, in every case',
  },
  {
    id: 'medical-chronologies',
    name: 'Medical Chronologies',
    line: 'Thousands of pages become one dated treatment story, cited and exportable.',
    practice: 'both',
    phases: ['pre-lit', 'litigation'],
    availability: 'live',
    detail: [
      'Every visit, procedure, and opinion in date order.',
      'Each entry names the document, page, and sentence it came from.',
      'Split at the date of loss, so before and after read separately.',
    ],
    output: 'Word export',
  },
  {
    id: 'significance-brief',
    name: 'Medical Significance Brief',
    line: 'What actually matters in the records, pulled out and sourced.',
    practice: 'both',
    phases: ['pre-lit'],
    availability: 'live',
    detail: [
      'The findings that carry the case, separated from the routine ones.',
      'Injuries by body part, with the evidence behind each.',
    ],
    output: 'Word export',
  },
  {
    id: 'missing-records',
    name: 'Missing Records & Gaps',
    line: 'See what the records reference but nobody produced.',
    practice: 'both',
    phases: ['pre-lit'],
    availability: 'live',
    detail: [
      'Imaging and reports cited by other documents but absent from the file.',
      'Treatment gaps that a defense adjuster will find first if you do not.',
    ],
    output: 'On screen',
  },
  {
    id: 'qme-ame',
    name: 'QME/AME Deep Analysis',
    line: 'Every medical-legal opinion side by side, contradictions surfaced.',
    practice: 'WC',
    phases: ['pre-lit', 'litigation'],
    availability: 'live',
    detail: [
      'QME, AME, and treating-physician opinions on one page.',
      'Where the doctors disagree, both positions stay visible with their dates.',
      'Work status, restrictions, and disputed body parts, as each report states them.',
    ],
    output: 'On screen',
  },
  {
    id: 'damages-ledger',
    name: 'Damages Ledger',
    line: 'Every medical bill, lien, and benefit payment in one running total.',
    wcLine: 'Reconcile the benefit printout — every TTD, PD, and medical payment — against what is owed.',
    practice: 'both',
    phases: ['pre-lit'],
    availability: 'live',
    detail: [
      'Bills, liens, and benefits together, so the number is never assembled by hand.',
      'An explanation of benefits folds into the bill it belongs to.',
      'A lien with no stated amount says so rather than guessing.',
    ],
    output: 'On screen',
  },
  {
    id: 'demand-packages',
    name: 'Demand Packages',
    line: 'An evidence-backed demand, exported only after an attorney approves it.',
    practice: 'PI',
    phases: ['pre-lit'],
    availability: 'live',
    detail: [
      'Built from the chronology and the ledger, in your firm’s template.',
      'Section by section, each one approved before it counts.',
      'Export refuses figures nobody approved.',
    ],
    output: 'Word export',
  },
  {
    id: 'case-value',
    name: 'Case Value & Howell Analysis',
    line: 'Three scenarios, Howell and Pebley views, future care.',
    practice: 'PI',
    phases: ['pre-lit'],
    availability: 'live',
    detail: [
      'Conservative, base, and aggressive scenarios from the same evidence.',
      'Billed versus paid, the way California argues it.',
      'Future care carried into the total rather than bolted on.',
    ],
    output: 'On screen, with a Howell summary export',
  },
  {
    id: 'negotiation',
    name: 'Negotiation Tracking',
    line: 'Demand sent, offers, counters, best offer, on one timeline.',
    practice: 'PI',
    phases: ['pre-lit'],
    availability: 'live',
    detail: [
      'Every move in the negotiation against one matter.',
      'The adjuster and carrier on the record with it.',
    ],
    output: 'On screen',
  },
  {
    id: 'case-management-summary',
    name: 'Case Management Summary',
    line: 'Claim info, both chronologies, treatment, providers, damages — one document.',
    practice: 'both',
    phases: ['litigation'],
    availability: 'live',
    detail: [
      'Pre-litigation and litigation chronologies in a single summary.',
      'Providers, bills, wage loss, costs advanced, and experts alongside them.',
    ],
    output: 'Word export',
  },
  {
    id: 'conflicts',
    name: 'Conflicting Records & Opinions',
    line: 'Where the record disagrees with itself, both sources visible.',
    practice: 'both',
    phases: ['litigation'],
    availability: 'live',
    detail: [
      'Two records that cannot both be true are flagged, not reconciled.',
      'Each side keeps its own date, author, and page.',
      'Autolaw does not pick a winner. An attorney resolves it.',
    ],
    output: 'On screen',
  },
  {
    id: 'deadlines',
    name: 'Deadlines & Statute of Limitations',
    line: 'What is running, and what closes next.',
    practice: 'both',
    phases: ['litigation'],
    availability: 'live',
    detail: [
      'The limitations estimate from the date of loss and the jurisdiction.',
      'Said plainly when it cannot be determined, rather than guessed.',
    ],
    output: 'On screen',
  },
  {
    id: 'illustrations',
    name: 'Accident & Injury Illustrations',
    line: 'Illustrations built only from what the record supports.',
    practice: 'both',
    phases: ['litigation'],
    availability: 'early-access',
    detail: [
      'Collision reconstruction, injury mechanism, treatment, and daily limitations.',
      'What the record does not state is not drawn — every scene is bound to the evidence behind it.',
      'A second model re-inspects each finished image for reversed impact direction or an over-claimed spinal level, and an attorney approves it before it locks.',
      'Running today with our team on your case, during a pilot.',
    ],
    output: 'Stills, and short video on request',
  },
  {
    id: 'discovery-responses',
    name: 'Discovery Responses',
    line: 'Answer form and special interrogatories, production, and admissions from the file you already have.',
    practice: 'both',
    phases: ['litigation'],
    availability: 'coming-next',
    detail: [
      'The served set broken into numbered requests, each matched to facts already in the file.',
      'Your firm’s standing objections applied by request type.',
    ],
    output: 'Not yet available',
  },
  {
    id: 'deposition-review',
    name: 'Deposition Review',
    line: 'Every deposition read and cited before the transcript goes cold.',
    practice: 'both',
    phases: ['litigation'],
    availability: 'coming-next',
    detail: [
      'Testimony that contradicts the medical record, flagged by page and line.',
      'For workers’ compensation, the applicant and QME/AME depositions the case turns on.',
    ],
    output: 'Not yet available',
  },
];

/** Cross-phase. Not a column — these run under every feature above. */
export const PLATFORM: ReadonlyArray<{ id: string; name: string; line: string }> = [
  {
    id: 'case-files',
    name: 'Case Files',
    line: 'Upload or sync from Dropbox. Every page read, classified, and searchable.',
  },
  {
    id: 'review-queue',
    name: 'Attorney Review Queue',
    line: 'Autolaw proposes. Someone at your firm confirms before it counts as a fact.',
  },
  {
    id: 'firm-access',
    name: 'Firm Roles & Access',
    line: 'One firm, one boundary. Who opened which document is on the record.',
  },
];
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `npx vitest run src/data/__tests__/product.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
git add src/data/product.ts src/data/__tests__/product.test.ts
git commit -m "Name every feature the site sells, in one module"
```

---

### Task 2: The expandable feature card

**Files:**
- Create: `src/sections/product/FeatureCard.tsx`
- Test: `src/sections/product/__tests__/FeatureCard.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeatureCard } from '../FeatureCard';
import type { Feature } from '../../../data/product';

const live: Feature = {
  id: 'demo', name: 'Medical Chronologies', line: 'One dated treatment story.',
  practice: 'both', phases: ['pre-lit'], availability: 'live',
  detail: ['Every visit in order.', 'Each entry cites its page.'], output: 'Word export',
};

const soon: Feature = { ...live, id: 'soon', name: 'Discovery Responses', availability: 'coming-next', output: 'Not yet available' };
const wcOnly: Feature = { ...live, id: 'wc', name: 'QME/AME Deep Analysis', practice: 'WC' };

describe('FeatureCard', () => {
  it('shows the name and the sales line before anything is opened', () => {
    render(<FeatureCard feature={live} practice="PI" />);
    expect(screen.getByRole('button', { name: /medical chronologies/i })).toBeInTheDocument();
    expect(screen.getByText('One dated treatment story.')).toBeInTheDocument();
  });

  it('keeps the detail collapsed until asked', () => {
    render(<FeatureCard feature={live} practice="PI" />);
    expect(screen.getByRole('button', { name: /medical chronologies/i })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Every visit in order.')).not.toBeInTheDocument();
  });

  it('opens and closes on click, and reports it', async () => {
    const user = userEvent.setup();
    render(<FeatureCard feature={live} practice="PI" />);
    const toggle = screen.getByRole('button', { name: /medical chronologies/i });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Every visit in order.')).toBeInTheDocument();
    expect(screen.getByText('Word export')).toBeInTheDocument();
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('labels a feature that is not live, and never labels one that is', () => {
    const { unmount } = render(<FeatureCard feature={soon} practice="PI" />);
    expect(screen.getByText('Coming next')).toBeInTheDocument();
    unmount();
    render(<FeatureCard feature={live} practice="PI" />);
    expect(screen.queryByText('Coming next')).not.toBeInTheDocument();
    expect(screen.queryByText('Early access')).not.toBeInTheDocument();
  });

  it('badges a feature that belongs to one practice only', () => {
    render(<FeatureCard feature={wcOnly} practice="PI" />);
    expect(screen.getByText('Workers’ comp')).toBeInTheDocument();
  });

  it('swaps in the practice-specific line when the visitor is on that practice', () => {
    const ledger: Feature = { ...live, id: 'ledger', line: 'PI line.', wcLine: 'WC line.' };
    const { unmount } = render(<FeatureCard feature={ledger} practice="WC" />);
    expect(screen.getByText('WC line.')).toBeInTheDocument();
    unmount();
    render(<FeatureCard feature={ledger} practice="PI" />);
    expect(screen.getByText('PI line.')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/sections/product/__tests__/FeatureCard.test.tsx`
Expected: FAIL — cannot find module `../FeatureCard`.

- [ ] **Step 3: Write the component**

Create `src/sections/product/FeatureCard.tsx`:

```tsx
import { useId, useState, type ReactNode } from 'react';
import { AVAILABILITY_LABEL, type Feature } from '../../data/product';
import type { Practice } from '../../practice/PracticeContext';

const PRACTICE_BADGE: Record<'PI' | 'WC', string> = {
  PI: 'Personal injury',
  WC: 'Workers’ comp',
};

/**
 * One feature, collapsed to a name and a line until someone asks for more.
 *
 * The availability label is rendered from data, never typed into JSX. A feature that is
 * not `live` carries its label here and nowhere else, which is what the claim guard
 * checks — so promoting a roadmap feature to a live claim takes a deliberate data edit.
 */
export function FeatureCard({ feature, practice, visual }: {
  feature: Feature;
  practice: Practice;
  visual?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const label = feature.availability === 'live' ? null : AVAILABILITY_LABEL[feature.availability];
  const line = practice === 'WC' && feature.wcLine ? feature.wcLine : feature.line;

  return (
    <div className="al-feat" data-testid="feature-card" data-availability={feature.availability}>
      <button
        type="button"
        className="al-feat__toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
      >
        <span className="al-feat__name">{feature.name}</span>
        {label && <span className="al-feat__tag">{label}</span>}
        <i className="al-feat__chev" aria-hidden="true" />
      </button>

      <p className="al-feat__line">{line}</p>

      {open && (
        <div id={panelId} className="al-feat__panel">
          <ul className="al-feat__detail">
            {feature.detail.map((d) => <li key={d}>{d}</li>)}
          </ul>
          {visual && <div className="al-feat__visual">{visual}</div>}
          <p className="al-feat__foot">
            <span className="al-feat__output">{feature.output}</span>
            {feature.practice !== 'both' && (
              <span className="al-feat__badge">{PRACTICE_BADGE[feature.practice]}</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `npx vitest run src/sections/product/__tests__/FeatureCard.test.tsx`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add src/sections/product/FeatureCard.tsx src/sections/product/__tests__/FeatureCard.test.tsx
git commit -m "Add the feature card: a name, a line, and the detail on request"
```

---

### Task 3: The Product section

**Files:**
- Create: `src/sections/product/Product.tsx`, `src/sections/product/Product.css`
- Test: `src/sections/product/__tests__/Product.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Product } from '../Product';
import { PracticeProvider } from '../../../practice/PracticeContext';
import { FEATURES } from '../../../data/product';

const renderProduct = () => render(<PracticeProvider><Product /></PracticeProvider>);

describe('Product', () => {
  it('heads both phases with their selling line', () => {
    renderProduct();
    expect(screen.getByRole('heading', { name: 'Pre-Litigation' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Litigation' })).toBeInTheDocument();
    expect(screen.getByText('Build the file. Prove the damages. Send the demand.')).toBeInTheDocument();
  });

  it('puts each feature in every phase column it belongs to', () => {
    renderProduct();
    const pre = screen.getByTestId('column-pre-lit');
    const lit = screen.getByTestId('column-litigation');
    expect(within(pre).getByText('Demand Packages')).toBeInTheDocument();
    expect(within(lit).getByText('Case Management Summary')).toBeInTheDocument();
    expect(within(pre).getByText('Ask AL')).toBeInTheDocument();
    expect(within(lit).getByText('Ask AL')).toBeInTheDocument();
  });

  it('keeps the unbuilt features out of the phase columns', () => {
    renderProduct();
    const lit = screen.getByTestId('column-litigation');
    expect(within(lit).queryByText('Discovery Responses')).not.toBeInTheDocument();
    const next = screen.getByTestId('coming-next');
    expect(within(next).getByText('Discovery Responses')).toBeInTheDocument();
    expect(within(next).getByText('Deposition Review')).toBeInTheDocument();
  });

  it('keeps early access in the column it serves, labelled', () => {
    renderProduct();
    const lit = screen.getByTestId('column-litigation');
    expect(within(lit).getByText('Accident & Injury Illustrations')).toBeInTheDocument();
    expect(within(lit).getByText('Early access')).toBeInTheDocument();
  });

  it('renders the cross-phase strip', () => {
    renderProduct();
    const strip = screen.getByTestId('platform-strip');
    expect(within(strip).getByText('Case Files')).toBeInTheDocument();
    expect(within(strip).getByText('Attorney Review Queue')).toBeInTheDocument();
  });

  it('labels every feature that is not live, wherever it renders', () => {
    renderProduct();
    FEATURES.filter((f) => f.availability !== 'live').forEach((f) => {
      screen.getAllByText(f.name).forEach((el) => {
        const card = el.closest('[data-testid="feature-card"]');
        expect(card?.getAttribute('data-availability')).not.toBe('live');
      });
    });
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/sections/product/__tests__/Product.test.tsx`
Expected: FAIL — cannot find module `../Product`.

- [ ] **Step 3: Write the section**

Create `src/sections/product/Product.tsx`:

```tsx
import { Section } from '../../components/primitives/Section';
import { FeatureCard } from './FeatureCard';
import { FEATURES, PHASES, PLATFORM, type Phase } from '../../data/product';
import { usePractice } from '../../practice/PracticeContext';
import { ASK_AL_ENABLED } from '../../config';
import './Product.css';

const PHASE_ORDER: ReadonlyArray<Phase> = ['pre-lit', 'litigation'];

/**
 * What the firm gets, by the phase of the case it belongs to.
 *
 * A feature appears in every phase column its `phases` list names — Ask AL and the
 * chronologies genuinely serve both, and splitting them would describe a product nobody
 * ships. Unbuilt features never enter a column: they sit in the "Coming next" row, which
 * is what keeps the columns readable as a list of things you can use on Monday.
 */
export function Product() {
  const { practice } = usePractice();
  const shown = FEATURES.filter((f) => ASK_AL_ENABLED || f.id !== 'ask-al');
  const columnFeatures = (phase: Phase) =>
    shown.filter((f) => f.phases.includes(phase) && f.availability !== 'coming-next');
  const comingNext = shown.filter((f) => f.availability === 'coming-next');

  return (
    <Section
      id="product"
      eyebrow="Product"
      heading="What Autolaw does for your firm"
      intro="Two phases of the case, and the work Autolaw does in each. Open any one to see what it produces."
    >
      <div className="al-prod__columns">
        {PHASE_ORDER.map((phase) => (
          <div key={phase} className="al-prod__col" data-testid={`column-${phase}`}>
            <h3 className="al-prod__phase">{PHASES[phase].heading}</h3>
            <p className="al-prod__phase-line">{PHASES[phase].line}</p>
            <div className="al-prod__cards">
              {columnFeatures(phase).map((f) => (
                <FeatureCard key={f.id} feature={f} practice={practice} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="al-prod__strip" data-testid="platform-strip">
        <h3 className="al-prod__strip-head">Across every phase</h3>
        <ul>
          {PLATFORM.map((p) => (
            <li key={p.id}><b>{p.name}</b><span>{p.line}</span></li>
          ))}
        </ul>
      </div>

      {comingNext.length > 0 && (
        <div className="al-prod__next" data-testid="coming-next">
          <h3 className="al-prod__next-head">Coming next</h3>
          <div className="al-prod__cards al-prod__cards--next">
            {comingNext.map((f) => (
              <FeatureCard key={f.id} feature={f} practice={practice} />
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}
```

Create `src/sections/product/Product.css`:

```css
.al-prod__columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--al-space-7);
}

.al-prod__phase {
  font-size: 1.25rem;
  line-height: var(--al-leading-tight);
  margin: 0;
}

.al-prod__phase-line {
  color: var(--al-ink-muted);
  margin: var(--al-space-1) 0 var(--al-space-4);
}

.al-prod__cards {
  display: flex;
  flex-direction: column;
  gap: var(--al-space-2);
}

.al-feat {
  border: 1px solid var(--al-hairline);
  border-radius: var(--al-radius-card);
  background: var(--al-surface);
  padding: var(--al-space-3) var(--al-space-4);
}

.al-feat__toggle {
  display: flex;
  align-items: center;
  gap: var(--al-space-2);
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: inherit;
}

.al-feat__toggle:focus-visible { outline: var(--al-focus-ring); }

.al-feat__name { font-weight: 600; }

.al-feat__tag {
  border: 1px solid var(--al-hairline-strong);
  border-radius: var(--al-radius-pill);
  color: var(--al-ink-muted);
  font-size: 0.75rem;
  padding: 0 var(--al-space-2);
  white-space: nowrap;
}

.al-feat__chev {
  margin-left: auto;
  width: 0.5rem;
  height: 0.5rem;
  border-right: 1.5px solid var(--al-ink-muted);
  border-bottom: 1.5px solid var(--al-ink-muted);
  transform: rotate(45deg);
  transition: transform var(--al-duration-fast) var(--al-ease);
}

.al-feat__toggle[aria-expanded='true'] .al-feat__chev { transform: rotate(225deg); }

.al-feat__line {
  color: var(--al-ink-muted);
  margin: var(--al-space-1) 0 0;
}

.al-feat__panel { margin-top: var(--al-space-3); }

.al-feat__detail {
  margin: 0;
  padding-left: var(--al-space-4);
  display: flex;
  flex-direction: column;
  gap: var(--al-space-1);
}

.al-feat__visual { margin-top: var(--al-space-3); }

.al-feat__foot {
  display: flex;
  flex-wrap: wrap;
  gap: var(--al-space-2);
  margin: var(--al-space-3) 0 0;
  font-size: 0.875rem;
}

.al-feat__output { color: var(--al-ink-muted); }

.al-feat__badge {
  border-radius: var(--al-radius-pill);
  background: var(--al-state-neutral);
  padding: 0 var(--al-space-2);
}

.al-prod__strip,
.al-prod__next { margin-top: var(--al-space-7); }

.al-prod__strip-head,
.al-prod__next-head {
  font-size: 1rem;
  margin: 0 0 var(--al-space-3);
}

.al-prod__strip ul {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--al-space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.al-prod__strip li { display: flex; flex-direction: column; gap: var(--al-space-1); }
.al-prod__strip span { color: var(--al-ink-muted); }

.al-prod__cards--next {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--al-space-3);
}

/* One column below the point where two stop fitting. Cards stay collapsed at every
   width, so the section's height never depends on the viewport. */
@media (max-width: 900px) {
  .al-prod__columns,
  .al-prod__strip ul,
  .al-prod__cards--next { grid-template-columns: 1fr; }
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `npx vitest run src/sections/product/__tests__/Product.test.tsx`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add src/sections/product/ && git commit -m "Build the Product section: two phases, one grid, one roadmap row"
```

---

### Task 4: Mount Product, re-parent the Hero, delete the story engine

**Files:**
- Modify: `src/App.tsx`, `src/sections/Hero.tsx`, `src/config.ts:~55` (`HOW_IT_WORKS_URL`), `src/navigation.ts:9`
- Create: `src/sections/HeroSection.tsx`
- Delete: `src/story/Story.tsx`, `src/story/Story.css`, `src/story/chapters.ts`, `src/story/ChapterList.tsx`, `src/story/Stage.tsx`, `src/story/Stage.css`, `src/story/useStoryMode.ts`, `src/story/useActiveChapter.ts`, and `src/story/__tests__/Story.test.tsx`, `Stage.test.tsx`, `chapters.test.ts`, `useActiveChapter.test.tsx`, `useStoryMode.test.tsx`
- Test: `src/sections/__tests__/HeroSection.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroSection } from '../HeroSection';

describe('HeroSection', () => {
  it('carries the headline as the page’s h1', () => {
    render(<HeroSection />);
    expect(screen.getByRole('heading', { level: 1, name: /know where every fact came from/i })).toBeInTheDocument();
  });

  it('sends "See how it works" to the product section', () => {
    render(<HeroSection />);
    expect(screen.getByRole('link', { name: /see how it works/i })).toHaveAttribute('href', '/#product');
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/sections/__tests__/HeroSection.test.tsx`
Expected: FAIL — cannot find module `../HeroSection`.

- [ ] **Step 3: Create the wrapper, repoint the anchor, delete the story**

Create `src/sections/HeroSection.tsx`:

```tsx
import { Hero } from './Hero';
import { Signals } from './visuals/Signals';
import './HeroSection.css';

/**
 * The hero used to live inside Story's grid so one stage could pin beside seven chapters.
 * With the chapters gone it owns its own landmark, and keeps the Signals panel beside it
 * so the composition above the fold does not change.
 */
export function HeroSection() {
  return (
    <section className="al-section al-herosec" aria-label="Autolaw">
      <div className="al-container al-herosec__grid">
        <Hero />
        <div className="al-herosec__stage"><Signals /></div>
      </div>
    </section>
  );
}
```

Create `src/sections/HeroSection.css`:

```css
.al-herosec__grid {
  display: grid;
  grid-template-columns: minmax(0, 55%) minmax(0, 1fr);
  gap: var(--al-space-7);
  align-items: center;
}

@media (max-width: 900px) {
  .al-herosec__grid { grid-template-columns: 1fr; }
  .al-herosec__stage { order: 2; }
}
```

In `src/config.ts`, change the `HOW_IT_WORKS_URL` export and its comment to:

```ts
/** The hero's secondary control. Points at the Product section, which is what a visitor
 *  who clicks "See how it works" is actually asking to see. */
export const HOW_IT_WORKS_URL = '/#product';
```

In `src/navigation.ts`, change the first entry to:

```ts
  { href: '/#product', label: 'Product' },
```

In `src/App.tsx`, replace the `Story` import and usage:

```tsx
import { PageShell } from './pages/PageShell';
import { PracticeProvider } from './practice/PracticeContext';
import { HeroSection } from './sections/HeroSection';
import { Product } from './sections/product/Product';
import { AskAl } from './sections/AskAl';
import { Solutions } from './sections/Solutions';
import { Trust } from './sections/Trust';
import { Conversion } from './sections/Conversion';
import { ASK_AL_ENABLED } from './config';

export default function App() {
  return (
    <PageShell>
      <PracticeProvider>
        <HeroSection />
        <Product />
        {ASK_AL_ENABLED && <AskAl />}
        <Solutions />
        <Trust />
        <Conversion />
      </PracticeProvider>
    </PageShell>
  );
}
```

Then delete the story engine (Task 5 moves the visuals first if you prefer; either order works because the visuals have no imports from the deleted files):

```bash
git rm src/story/Story.tsx src/story/Story.css src/story/chapters.ts \
  src/story/ChapterList.tsx src/story/Stage.tsx src/story/Stage.css \
  src/story/useStoryMode.ts src/story/useActiveChapter.ts \
  src/story/__tests__/Story.test.tsx src/story/__tests__/Stage.test.tsx \
  src/story/__tests__/chapters.test.ts src/story/__tests__/useActiveChapter.test.tsx \
  src/story/__tests__/useStoryMode.test.tsx
```

- [ ] **Step 4: Run the suite**

Run: `npx vitest run`
Expected: the HeroSection test passes. Failures are expected in `src/__tests__/a11y.test.tsx` and any test asserting `#story-arrives`; fix each by pointing it at `#product` and removing story-mode assertions. Re-run until green.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "Replace the story with the Product grid, and give the hero its own landmark"
```

---

### Task 5: Move the stage visuals and mount them in the cards

**Files:**
- Move: `src/story/states/*.tsx` and `states.css` → `src/sections/visuals/`
- Modify: `src/sections/product/Product.tsx`, `src/sections/product/FeatureCard.tsx` (already accepts `visual`)
- Move tests: `src/story/__tests__/{Arrival,AskPreview,ChronologyState,ReviewOutput}.test.tsx` → `src/sections/visuals/__tests__/`

- [ ] **Step 1: Move the files and fix imports**

```bash
mkdir -p src/sections/visuals/__tests__
git mv src/story/states/Arrival.tsx src/story/states/AskPreview.tsx \
  src/story/states/ChronologyState.tsx src/story/states/Output.tsx \
  src/story/states/Review.tsx src/story/states/Signals.tsx \
  src/story/states/states.css src/sections/visuals/
git mv src/story/__tests__/Arrival.test.tsx src/story/__tests__/AskPreview.test.tsx \
  src/story/__tests__/ChronologyState.test.tsx src/story/__tests__/ReviewOutput.test.tsx \
  src/sections/visuals/__tests__/
```

Each moved component imports `./states.css` (unchanged) and `../data/demoCase`, which becomes `../../data/demoCase`. Each moved test imports `../<Name>` — unchanged — and any `../../data/demoCase` becomes `../../../data/demoCase`.

- [ ] **Step 2: Run the moved tests**

Run: `npx vitest run src/sections/visuals`
Expected: PASS. Fix import paths until it does.

- [ ] **Step 3: Write the failing test for mounting**

Add to `src/sections/product/__tests__/Product.test.tsx`:

```tsx
  it('shows the chronology visual inside the chronologies card, and only when open', async () => {
    const user = userEvent.setup();
    renderProduct();
    const pre = screen.getByTestId('column-pre-lit');
    expect(within(pre).queryByTestId('chronology')).not.toBeInTheDocument();
    await user.click(within(pre).getByRole('button', { name: /medical chronologies/i }));
    expect(within(pre).getByTestId('chronology')).toBeInTheDocument();
  });
```

Add `import userEvent from '@testing-library/user-event';` to that file's imports. If `ChronologyState` has no `data-testid="chronology"` on its root, add one.

- [ ] **Step 4: Run it and watch it fail**

Run: `npx vitest run src/sections/product/__tests__/Product.test.tsx -t 'chronology visual'`
Expected: FAIL — no element with that test id after opening.

- [ ] **Step 5: Mount the visuals**

In `src/sections/product/Product.tsx`, add above the component:

```tsx
import type { ReactNode } from 'react';
import { ChronologyState } from '../visuals/ChronologyState';
import { AskPreview } from '../visuals/AskPreview';
import { Output } from '../visuals/Output';

/** One visual per feature, at most. A visual that appeared under two cards would read as
 *  two different screens showing the same thing. */
const VISUALS: Record<string, ReactNode> = {
  'medical-chronologies': <ChronologyState />,
  'ask-al': <AskPreview />,
  'case-management-summary': <Output />,
};
```

and pass it in both `FeatureCard` call sites:

```tsx
<FeatureCard key={f.id} feature={f} practice={practice} visual={VISUALS[f.id]} />
```

`Arrival` and `Review` belong to the cross-phase strip rather than to a card, per the visual mapping in the spec's §5. Add them to the strip markup:

```tsx
        <ul>
          {PLATFORM.map((p) => (
            <li key={p.id}>
              <b>{p.name}</b>
              <span>{p.line}</span>
              {p.id === 'case-files' && <Arrival />}
              {p.id === 'review-queue' && <Review />}
            </li>
          ))}
        </ul>
```

with `import { Arrival } from '../visuals/Arrival';` and `import { Review } from '../visuals/Review';`.

- [ ] **Step 6: Run the tests and watch them pass**

Run: `npx vitest run src/sections`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "Keep the stage visuals, and put each one under the feature it shows"
```

---

### Task 6: Extend the claim guard

**Files:**
- Modify: `src/__tests__/claims.test.tsx:25-54` (the `RETIRED` list), and add a new describe block

- [ ] **Step 1: Write the failing test**

Append to `src/__tests__/claims.test.tsx`:

```tsx
import { FEATURES, AVAILABILITY_LABEL } from '../data/product';

describe('availability guard', () => {
  /*
   * A feature that is not live must carry its label wherever it renders. Without this,
   * moving a roadmap feature into a phase column — or dropping the tag while restyling —
   * silently turns a plan into a claim, which is the failure the correction release
   * existed to fix.
   */
  const home = pageText(App);

  for (const f of FEATURES.filter((x) => x.availability !== 'live')) {
    it(`${f.name} renders with its ${f.availability} label`, () => {
      expect(home).toContain(f.name);
      expect(home).toContain(AVAILABILITY_LABEL[f.availability as 'early-access' | 'coming-next']);
    });
  }

  it('states no delivery date for anything unbuilt', () => {
    expect(home).not.toMatch(/coming (in )?(q[1-4]|january|february|march|april|may|june|july|august|september|october|november|december|20\d\d)/i);
  });
});
```

And add these entries to the `RETIRED` array:

```ts
  {
    pattern: /\billustrations?\b[^.]*\b\d+\s*%|\b\d+\s*%[^.]*\billustrations?\b/i,
    reason: 'media-engine accuracy has never been measured against human-verified labels; its own corpus test is named test_gate_condition_is_not_yet_met',
  },
  {
    pattern: /medically\s+validated|expert[-\s]reviewed|court[-\s]admissible|clinician[-\s]approved/i,
    reason: 'no such review exists for generated illustrations',
  },
  {
    pattern: /\b3D\b|surgical\s+(procedure|animation)/i,
    reason: 'media-engine renders flat scenes; no 3D and no surgical procedures',
  },
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/__tests__/claims.test.tsx`
Expected: FAIL — `pageText` is defined below the new block, or the new imports are unused until the block is placed after the existing helpers. Move the new `describe` to the end of the file, after `pageText` is defined.

- [ ] **Step 3: Fix placement so the guard runs**

Ensure the new `describe` sits at the end of the file and `pageText(App)` is called inside the block body, not at module scope:

```tsx
describe('availability guard', () => {
  const home = pageText(App);
  // …tests as above
});
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `npx vitest run src/__tests__/claims.test.tsx`
Expected: PASS. Every non-live feature is found with its label; no retired phrase appears.

- [ ] **Step 5: Commit**

```bash
git add src/__tests__/claims.test.tsx
git commit -m "Guard the availability labels, and retire the claims media-engine cannot support"
```

---

### Task 7: Give Security its mark in nav and footer

**Files:**
- Modify: `src/navigation.ts`, `src/components/SiteNav.tsx:20-24,46-52`, `src/components/SiteFooter.tsx`
- Test: `src/components/__tests__/SiteNav.test.tsx` (add cases; create if absent)

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SiteNav } from '../SiteNav';

describe('SiteNav', () => {
  it('keeps the four destinations in order', () => {
    render(<SiteNav />);
    const links = screen.getAllByRole('link').map((a) => a.textContent?.trim());
    expect(links).toEqual(expect.arrayContaining(['Autolaw', 'Product', 'Solutions', 'Security', 'About']));
  });

  it('marks Security without turning it into a badge', () => {
    render(<SiteNav />);
    const security = screen.getAllByRole('link', { name: 'Security' })[0];
    expect(security.querySelector('svg')).toBeTruthy();
    expect(security.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/components/__tests__/SiteNav.test.tsx`
Expected: FAIL — no `svg` inside the Security link.

- [ ] **Step 3: Add the mark**

In `src/navigation.ts`, add a flag to the Security entry:

```ts
export const SITE_LINKS: ReadonlyArray<{ href: string; label: string; mark?: boolean }> = [
  { href: '/#product', label: 'Product' },
  { href: '/#solutions', label: 'Solutions' },
  { href: SECURITY_URL, label: 'Security', mark: true },
  { href: ABOUT_URL, label: 'About' },
];
```

In `src/components/SiteNav.tsx`, add the shield above the component:

```tsx
/** A signal, not a badge: it says "this question is answered here", and claims nothing. */
function Shield() {
  return (
    <svg className="al-nav__mark" viewBox="0 0 12 14" width="12" height="14" aria-hidden="true">
      <path d="M6 1l4.5 2v4.2c0 2.6-1.8 4.6-4.5 5.8-2.7-1.2-4.5-3.2-4.5-5.8V3L6 1z"
        fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}
```

and render it in both link lists:

```tsx
              <li key={l.href}><a href={l.href}>{l.mark && <Shield />}{l.label}</a></li>
```

```tsx
                <li key={l.href}>
                  <a href={l.href} onClick={() => setOpen(false)}>{l.mark && <Shield />}{l.label}</a>
                </li>
```

Apply the same `{l.mark && <Shield />}` treatment in `src/components/SiteFooter.tsx` where it maps `SITE_LINKS`, exporting `Shield` from `SiteNav.tsx` and importing it there. Add to `src/components/SiteNav.css`:

```css
.al-nav__mark { margin-right: 0.35em; vertical-align: -0.15em; }
```

- [ ] **Step 4: Run the tests and watch them pass**

Run: `npx vitest run src/components`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "Mark Security in the nav, where the first objection gets answered"
```

---

### Task 8: Security page — reorder, ethics, and the illustration controls

**Files:**
- Modify: `src/pages/security/SecurityPage.tsx`, `src/pages/security/__tests__/` (vocabulary guard)

- [ ] **Step 1: Write the failing test**

Add to the security page's test file:

```tsx
  it('answers the three questions a firm asks, in that order', () => {
    render(<SecurityPage />);
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent ?? '');
    const dataIdx = headings.findIndex((h) => /case data/i.test(h));
    const ethicsIdx = headings.findIndex((h) => /ethic|your client/i.test(h));
    expect(dataIdx).toBeGreaterThanOrEqual(0);
    expect(ethicsIdx).toBeGreaterThan(dataIdx);
  });

  it('describes what is checked before an illustration can be used', () => {
    render(<SecurityPage />);
    expect(screen.getByRole('heading', { name: /illustration/i })).toBeInTheDocument();
    expect(screen.getByText(/not stated/i)).toBeInTheDocument();
    expect(screen.getByText(/approves/i)).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/pages/security`
Expected: FAIL — no ethics heading, no illustration heading.

- [ ] **Step 3: Add the two sections**

In `src/pages/security/SecurityPage.tsx`, add the data above the component:

```tsx
const ETHICS = [
  {
    title: 'Privilege',
    body: 'Case content stays inside your firm’s boundary, is never used to train a model, and is not shared with another customer. What your reviewer needs beyond this page is in the SOC 2 Type II report.',
  },
  {
    title: 'Telling your client',
    body: 'Firms differ on what their engagement letter says about software that processes client records. We will answer questions from your ethics counsel directly, and we sign a BAA before any protected health information reaches the system.',
  },
  {
    title: 'Billing the cost back',
    body: 'Whether a technology cost may be billed to a client, or charged against a recovery, is governed by your fee agreement and your state’s rules. We do not advise on it, and we will give you whatever invoice detail your accounting needs.',
  },
];

const ILLUSTRATION_CONTROLS = [
  {
    title: 'Nothing is drawn that the record does not state',
    body: 'Every scene is bound to the evidence behind it. Where the record is silent, the illustration stays silent: an unstated detail is not a detail to be guessed.',
  },
  {
    title: 'It refuses a file too thin to illustrate',
    body: 'If the record cannot support a scene, the work stops before it starts and you get a list of what is missing rather than a picture that fills the gap.',
  },
  {
    title: 'A second model inspects the finished image',
    body: 'Each render is re-examined for a reversed collision direction, an over-claimed spinal level, or the wrong side of the body. What fails is redrawn or held for review.',
  },
  {
    title: 'An attorney approves before anything locks',
    body: 'A scene cannot be locked for litigation until a person approves it, and a locked exhibit can be re-verified afterwards to show it has not changed.',
  },
];
```

Add the ethics section immediately after the existing `data` section and before `access`:

```tsx
      <Section
        id="ethics"
        eyebrow="Your client"
        heading="Privilege, disclosure, and cost"
        intro="Three questions firms ask before the first matter goes in. None of this is legal advice — your ethics counsel decides, and we will answer their questions directly."
      >
        <div className="al-secp__grid al-secp__grid--three">
          {ETHICS.map((c) => (
            <div key={c.title} className="al-secp__card">
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </div>
          ))}
        </div>
      </Section>
```

Add the illustration section immediately after `model-limits`:

```tsx
      <Section
        id="illustrations"
        eyebrow="Illustrations"
        heading="What is checked before an illustration is used"
        intro="Accident and injury illustrations are in early access. These are the checks that stand between the record and a finished image."
      >
        <div className="al-secp__grid">
          {ILLUSTRATION_CONTROLS.map((c) => (
            <div key={c.title} className="al-secp__card">
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </div>
          ))}
        </div>
```

and close that section with:

```tsx
        <p className="al-secp__why">
          Accuracy here is a set of checks, not a score. We publish what is checked and what
          is not, and we do not publish an accuracy percentage, because none has been
          measured against human-verified cases.
        </p>
      </Section>
```

- [ ] **Step 4: Run the tests and watch them pass**

Run: `npx vitest run src/pages/security`
Expected: PASS. If the vocabulary guard rejects a new word, add it to the guard's allowed set only after confirming the control exists in media-engine.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "Answer the firm’s three questions on Security, and say what an illustration is checked for"
```

---

### Task 9: About — fill the owner slots

**Files:**
- Modify: `src/pages/about/AboutPage.tsx:27,33,39` (`STORY`, `TEAM`, `OPEN_ROLES`)

**Input required:** the owner's answers to these six questions. Ask them, verbatim, before starting this task, and write only what the answers support:

1. What did you see — in a case, at a firm — that made this worth building?
2. Who did you build it with, and what did each of you do before this?
3. What did the first firm to use it actually use it for, and what changed for them?
4. What do you refuse to do that a competitor would happily do?
5. Who is on the team today, and what does each person do?
6. Are you hiring, and if so, where do applications go?

- [ ] **Step 1: Write the failing test**

Add to `src/pages/about/__tests__/AboutPage.test.tsx`:

```tsx
  it('tells the company’s story once the owner has supplied it', () => {
    render(<AboutPage />);
    expect(screen.getByRole('heading', { name: /why we built this/i })).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/pages/about`
Expected: FAIL — the section does not render while `STORY` is empty.

- [ ] **Step 3: Fill the slots from the answers**

Replace the empty arrays with the owner's words, lightly edited. Paragraphs go in `STORY`, one string each. `TEAM` takes `{ name, role }`. Leave `OPEN_ROLES` empty unless question 6 produced a real application URL — a role with nowhere to apply is worse than no listing.

- [ ] **Step 4: Run the tests and watch them pass**

Run: `npx vitest run src/pages/about && npx vitest run src/__tests__/claims.test.tsx`
Expected: PASS. The claim guard runs against About too, so an enthusiastic sentence in the story can fail it.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "Tell the story of why Autolaw exists, in the owner’s words"
```

---

### Task 10: Verify the whole thing

**Files:** none — verification only.

- [ ] **Step 1: Full suite and lint**

Run: `npm test`
Expected: PASS, lint clean, no story-mode tests remaining.

- [ ] **Step 2: Types and build**

Run: `npx tsc --noEmit && npm run build && npm run ds`
Expected: all three succeed.

- [ ] **Step 3: Look at it**

Start the dev server and open the Product section. Confirm: two columns at desktop width; one column below 900px; every card collapsed on load; opening one reveals detail, output, and the visual where there is one; "Early access" appears on illustrations and "Coming next" on the roadmap row; the nav's Security link carries the shield; "See how it works" scrolls to Product.

- [ ] **Step 4: Check the claim guard did its job**

Run: `npx vitest run src/__tests__/claims.test.tsx --reporter=verbose`
Expected: the availability guard names each non-live feature in its output.

- [ ] **Step 5: Commit any fixes**

```bash
git add -A && git commit -m "Fix what the full-suite pass turned up"
```
