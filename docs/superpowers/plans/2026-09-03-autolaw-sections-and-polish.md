# Autolaw Sections and Polish Implementation Plan (refresh, plan 2 of 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the home page below the story — an Ask AL section limited to shipped behaviour, a Solutions section showing the real PI and WC screen structure with the silhouette figure, a practice-specific closing section — and land the site-wide polish: legal-page slots, security additions, self-hosted fonts, a share card, and lint.

**Architecture:** Practice selection becomes shared state in a small React context persisted to `sessionStorage`, read by Solutions and Conversion and carried to the call page as a query parameter. Each new section is a component with its own stylesheet reading `src/data/demoCase.ts`. The silhouette is one SVG path with eight region hit-targets and leader labels. Fonts move under `public/fonts/` with `@font-face` in a dedicated stylesheet, which lets the CSP drop every third-party origin.

**Tech Stack:** React 18, Vite 6, TypeScript, Vitest + Testing Library, plain CSS on design tokens, ESLint flat config with `react-hooks` and `jsx-a11y`. Spec: `docs/superpowers/specs/2026-09-02-autolaw-site-refresh-design.md`. Baseline: `site-redesign` at `85bf1dc` (plan 1 complete).

## Global Constraints

- Every visible claim traces to `case-app` behaviour in the spec's "Product truth" table. Ask AL shows only: grounded answers, the seven citation kinds (Timeline event, Document excerpt, Workers’ Comp fact, Wage record, Computed figure, Medical encounter, Clinical recommendation), chips that open a card with document, page, and excerpt, and a refusal for a figure not in context. Nothing about streaming, suggested prompts, actions, or generated documents — the claim guard fails on those phrases.
- The demo matter is the one in `src/data/demoCase.ts`; every demo panel shows `SAMPLE_MARK` ("Sample data").
- "Schedule a call" is the only primary CTA; `TRIAL_ENABLED` stays false; `LOGIN_URL` stays null.
- Motion only via `--al-duration-*` tokens and `--al-ease`; every `@keyframes` has a reduced-motion escape (the shipped-CSS suite enforces both).
- No text below 12px inside any demo panel. The story floor guard's prefix list grows with the new panels' prefixes (`.al-askal`, `.al-sol`, `.al-sil`, `.al-conv`).
- Curly apostrophes (`’`) in copy; `&rsquo;` in JSX text where the file's convention already does that.
- Every commit leaves `npm test`, `npx tsc --noEmit -p tsconfig.json`, and `npm run build` green. From Task 11 on, `npm run lint` too.
- Nothing links to a third-party origin from any HTML entry after Task 9.
- Owner slots (`PRIVACY_TEXT`, `TERMS_TEXT`) render no invented content. The legal pages exist as routes and state, truthfully, that the document is not yet published here.

**Spec deviations, decided here:**
1. `ASK_AL_ENABLED` hides the Ask AL section only. Story chapter 5 stays regardless: it demonstrates grounded answering, which ships, and renumbering chapters around a switch that is unlikely to flip is complexity nobody asked for. Recorded in the spec in Task 12.
2. The security page's Retention card requires deleting two lines from that page's unverified-vocabulary guard ("retention or deletion windows", "a time-bound promise"). The guard's own rule is that the deletion is the record that someone checked; the source is the in-app privacy policy §6.

---

## File Structure

**Created**

| Path | Responsibility |
|---|---|
| `src/practice/PracticeContext.tsx` | `PracticeProvider`, `usePractice()`; persists the choice to `sessionStorage`. |
| `src/sections/AskAl.tsx` + `.css` | The Ask AL section: three preset questions, answers, chips, citation card, refusal. |
| `src/sections/Silhouette.tsx` + `.css` | The figure: one SVG outline, eight regions, leader labels, detail card. Replaces `BodyExplorer`. |
| `src/sections/Solutions.tsx` + `.css` | Practice segmented control, PI panel with its three tabs, WC panel with its four tabs. Replaces `PracticeSolutions` and `ProductExperience`. |
| `src/pages/LegalPage.tsx` + `.css` | Shared renderer for `/privacy/` and `/terms/` from an owner slot. |
| `src/pages/privacy/{PrivacyPage.tsx,main.tsx}`, `privacy/index.html` | The privacy route. |
| `src/pages/terms/{TermsPage.tsx,main.tsx}`, `terms/index.html` | The terms route. |
| `src/styles/fonts.css`, `public/fonts/*.woff2`, `scripts/fetch-fonts.mjs` | Self-hosted Manrope and Source Serif 4. |
| `public/og-card.png`, `design-system/og-card.html` | The 1200×630 share card and the template it was rendered from. |
| `eslint.config.js` | Flat config: TypeScript, `react-hooks`, `jsx-a11y`. |
| tests beside each unit under `__tests__/` | |

**Modified:** `src/data/demoCase.ts`, `src/config.ts`, `src/App.tsx`, `src/sections/Conversion.tsx` + `.css`, `src/sections/Trust.tsx`, `src/pages/security/SecurityPage.tsx` + test, `src/pages/schedule-call/ScheduleCallPage.tsx` + test, `src/components/SiteFooter.tsx` + test, `src/pages/__tests__/pages.test.tsx`, `src/__tests__/{a11y,claims,credibility}.test.tsx`, `vite.config.ts`, all six HTML entries, `nginx.conf`, `src/styles/base.css`, `package.json`.

**Deleted:** `src/sections/BodyExplorer.tsx` + `.css` + test, `src/sections/PracticeSolutions.tsx` + `.css` + test, `src/sections/ProductExperience.tsx` + `.css`.

---

### Task 1: Demo data for the sections

**Files:**
- Modify: `src/data/demoCase.ts`
- Test: `src/data/__tests__/demoCase.test.ts` (extend)

**Interfaces:**
- Produces: `ASK_AL_QA: ReadonlyArray<AskAlQuestion>` where `AskAlQuestion = { id: string; question: string; answer: ReadonlyArray<AnswerSentence>; citations: ReadonlyArray<Citation>; refusal: boolean }` and `Citation = CitationChip & { excerpt: string; reviewStatus: 'Needs review' | 'Approved' }`; `PI_PANEL`, `WC_PANEL` (shapes below); `BODY_REGIONS` grows to eight regions with `side?: 'left' | 'right'`; `PRACTICE_CLOSING`.

- [ ] **Step 1: Write the failing tests** — append to `src/data/__tests__/demoCase.test.ts`:

```ts
import { ASK_AL_QA, PI_PANEL, WC_PANEL, BODY_REGIONS, PRACTICE_CLOSING, CITATION_KINDS } from '../demoCase';

describe('sections data', () => {
  it('asks three questions: two grounded, one refused', () => {
    expect(ASK_AL_QA).toHaveLength(3);
    expect(ASK_AL_QA.filter((q) => q.refusal)).toHaveLength(1);
    for (const q of ASK_AL_QA) {
      if (q.refusal) {
        expect(q.citations).toHaveLength(0);
        expect(q.answer.every((s) => s.cite === null)).toBe(true);
        expect(q.answer.map((s) => s.text).join(' ')).toMatch(/not in my context/i);
      } else {
        const cited = q.answer.filter((s) => s.cite !== null).map((s) => s.cite);
        expect(cited).toEqual(q.citations.map((c) => c.n));
        q.citations.forEach((c) => {
          expect(CITATION_KINDS).toContain(c.kind);
          expect(c.excerpt.length).toBeGreaterThan(20);
        });
      }
    }
  });

  it('names the PI and WC tabs the application uses', () => {
    expect(PI_PANEL.tabs.map((t) => t.label)).toEqual(['Medical', 'Liability & Incident', 'Damages & Demand']);
    expect(WC_PANEL.tabs.map((t) => t.label)).toEqual(['Summary', 'Injury & Work Status', 'Benefits & Wages', 'Medical-Legal & Disputes']);
  });

  it('has eight body regions with unique keys, four accepted-or-disputed and four with no records', () => {
    expect(BODY_REGIONS).toHaveLength(8);
    expect(new Set(BODY_REGIONS.map((r) => r.key)).size).toBe(8);
    expect(BODY_REGIONS.filter((r) => r.rows.some((row) => /no documents reference/i.test(row.value)))).toHaveLength(4);
  });

  it('closes differently for each practice', () => {
    expect(PRACTICE_CLOSING.PI.heading).not.toBe(PRACTICE_CLOSING.WC.heading);
    expect(PRACTICE_CLOSING.PI.href).toBe('/schedule-call/?practice=pi');
    expect(PRACTICE_CLOSING.WC.href).toBe('/schedule-call/?practice=wc');
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npm test -- demoCase` → FAIL: exports missing.

- [ ] **Step 3: Extend `src/data/demoCase.ts`**

In `BODY_REGIONS`, add `side` to the interface (`side?: 'left' | 'right'`), set `side: 'left'` on `shoulder` and `side: 'right'` on `knee`, and append four regions:

```ts
  {
    key: 'shoulder-right', label: 'Right shoulder', side: 'right', claimed: false,
    plain: 'Not part of the claim, and no document in the file mentions it.',
    rows: [
      { label: 'Claim status', value: 'Not an accepted body part', cite: 'Claims administrator notice p.2', warn: true },
      { label: 'Records', value: 'No documents reference this region', cite: 'no source', warn: true },
    ],
  },
  {
    key: 'hand-left', label: 'Left hand', side: 'left', claimed: false,
    plain: 'Not part of the claim, and no document in the file mentions it.',
    rows: [
      { label: 'Claim status', value: 'Not an accepted body part', cite: 'Claims administrator notice p.2', warn: true },
      { label: 'Records', value: 'No documents reference this region', cite: 'no source', warn: true },
    ],
  },
  {
    key: 'hand-right', label: 'Right hand', side: 'right', claimed: false,
    plain: 'Not part of the claim, and no document in the file mentions it.',
    rows: [
      { label: 'Claim status', value: 'Not an accepted body part', cite: 'Claims administrator notice p.2', warn: true },
      { label: 'Records', value: 'No documents reference this region', cite: 'no source', warn: true },
    ],
  },
  {
    key: 'knee-left', label: 'Left knee', side: 'left', claimed: false,
    plain: 'Not part of the claim, and no document in the file mentions it.',
    rows: [
      { label: 'Claim status', value: 'Not an accepted body part', cite: 'Claims administrator notice p.2', warn: true },
      { label: 'Records', value: 'No documents reference this region', cite: 'no source', warn: true },
    ],
  },
```

(The existing `knee` region's rows already say "No documents reference this region"; that makes four such regions with the three new "no records" ones. Keep the existing `cervical` as the disputed region.)

Append at the end of the file:

```ts
/* ---- Ask AL section ---- */

export interface Citation extends CitationChip {
  excerpt: string;
  reviewStatus: 'Needs review' | 'Approved';
}

export interface AskAlQuestion {
  id: string;
  question: string;
  answer: ReadonlyArray<AnswerSentence>;
  citations: ReadonlyArray<Citation>;
  /** True when the answer is the product's refusal: the figure is not in its context. */
  refusal: boolean;
}

/**
 * Three questions. The first two are grounded; the third is the refusal the product gives
 * for a settlement or demand value — its money-lane rule never states a figure that is
 * not in its context and points to the Damages screen.
 */
export const ASK_AL_QA: ReadonlyArray<AskAlQuestion> = [
  {
    id: 'restrictions',
    question: 'What are the current work restrictions?',
    answer: [
      { text: 'No lifting over 15 lb per the PTP on 04/02/2025', cite: 1 },
      { text: 'The QME on 04/18/2025 finds the claimant temporarily totally disabled', cite: 2 },
      { text: 'The two opinions conflict and are flagged for review.', cite: null },
    ],
    citations: [
      { n: 1, kind: 'Workers’ Comp fact', document: 'PTP report', page: 3, excerpt: 'Patient may return to modified duty with no lifting over 15 pounds effective 04/02.', reviewStatus: 'Needs review' },
      { n: 2, kind: 'Document excerpt', document: 'QME report', page: 22, excerpt: 'On examination the claimant remains temporarily totally disabled pending orthopedic consultation.', reviewStatus: 'Approved' },
    ],
    refusal: false,
  },
  {
    id: 'missing',
    question: 'What is missing from the file?',
    answer: [
      { text: 'An MRI of the lumbar spine dated 03/14/2025 is cited by the QME', cite: 1 },
      { text: 'and by the PTP', cite: 2 },
      { text: 'but no imaging report is in the file. It is listed as needed.', cite: null },
    ],
    citations: [
      { n: 1, kind: 'Document excerpt', document: 'QME report', page: 14, excerpt: 'MRI dated 03/14 demonstrates a 4mm disc protrusion at L4–L5 with mild foraminal narrowing.', reviewStatus: 'Approved' },
      { n: 2, kind: 'Document excerpt', document: 'PTP report', page: 5, excerpt: 'MRI lumbar spine ordered; results reviewed 03/14, see imaging.', reviewStatus: 'Needs review' },
    ],
    refusal: false,
  },
  {
    id: 'settlement',
    question: 'What is the settlement value?',
    answer: [
      { text: 'A settlement or demand value is not in my context. Open the Damages screen for that figure.', cite: null },
    ],
    citations: [],
    refusal: true,
  },
];

/* ---- Solutions section ---- */

export interface PanelTab { id: string; label: string }

/** The PI Overview's tabs and what each shows, in the application's own words. */
export const PI_PANEL = {
  tabs: [
    { id: 'medical', label: 'Medical' },
    { id: 'liability', label: 'Liability & Incident' },
    { id: 'damages', label: 'Damages & Demand' },
  ] as ReadonlyArray<PanelTab>,
  evidenceTiers: ['Imaging-backed', 'Diagnosis only — no objective finding', 'Symptom-reported only'] as const,
  medical: [
    { label: 'Injuries claimed', value: 'Lumbar spine; left shoulder', tier: 'Imaging-backed' },
    { label: 'Objective findings', value: 'Paraspinal tenderness, reduced lumbar flexion', tier: 'Diagnosis only — no objective finding' },
    { label: 'Treatment progression', value: 'Conservative care, 12 PT visits, epidural injection 05/06/2025', tier: 'Imaging-backed' },
  ],
  liability: [
    { component: 'Liability Evidence', state: 'Complete' },
    { component: 'Medical Chronology Completeness', state: '1 open' },
    { component: 'Medical Bills Completeness', state: 'Complete' },
  ],
  wage: [
    { label: 'Pre-injury baseline', value: '10/2024 to 01/2025 (13 weeks before the date of loss)' },
    { label: 'Combined average weekly wage', value: '$1,140/week' },
    { label: 'Claimed past wage loss', value: '$1,140/week × 11 weeks' },
  ],
  outputs: ['Source-linked chronology', 'Causation and treatment-gap findings', 'Specials and liens', 'Demand package'],
} as const;

/** The WC Intelligence tabs and the readiness cards, in the application's own words. */
export const WC_PANEL = {
  tabs: [
    { id: 'summary', label: 'Summary' },
    { id: 'injury', label: 'Injury & Work Status' },
    { id: 'benefits', label: 'Benefits & Wages' },
    { id: 'disputes', label: 'Medical-Legal & Disputes' },
  ] as ReadonlyArray<PanelTab>,
  readiness: [
    { label: 'Wage basis', value: '$1,140/wk', detail: 'From 12 wage records' },
    { label: 'Medical-legal report', value: '1', detail: 'QME report on file' },
    { label: 'PTP vs QME/AME conflicts', value: '1 open', detail: 'Work status' },
    { label: 'Missing records', value: '1 gap', detail: 'Needed: imaging report' },
  ],
  benefits: [
    { label: 'AWW', value: '$1,140' },
    { label: 'TTD weekly rate', value: '$760' },
    { label: 'Weeks off (concluded)', value: '11' },
  ],
  conflict: {
    severity: 'high',
    category: 'work restrictions',
    title: 'Work status: modified duty vs temporarily totally disabled',
    explanation: 'The PTP released the claimant to modified duty on 04/02/2025; the QME on 04/18/2025 finds temporary total disability. Both remain on file with their dates.',
    status: 'Needs review',
  },
  missing: {
    type: 'Missing diagnostic report',
    title: 'MRI lumbar spine, 03/14/2025',
    summary: 'Referenced by the QME (p.14) and the PTP (p.5); no imaging report in the file.',
    needed: 'Needed: imaging report',
    status: 'Needs review',
  },
  outputs: ['Claim timeline', 'Injury and work status', 'PTP vs QME/AME differences', 'Claim readiness export'],
} as const;

/* ---- Closing section ---- */

export const PRACTICE_CLOSING = {
  PI: {
    heading: 'Prove it on one of your matters.',
    body: 'Bring a personal injury matter you already know. We walk through it in the PI workflow — Medical, Liability & Incident, Damages & Demand — and you judge the chronology, the causation findings, and the specials against what you know is in the file.',
    href: '/schedule-call/?practice=pi',
  },
  WC: {
    heading: 'Prove it on one of your claims.',
    body: 'Bring a workers’ compensation claim you already know. We walk through it in the WC workflow — work status, PTP versus QME/AME, benefits, missing records — and you judge the findings against what you know is in the file.',
    href: '/schedule-call/?practice=wc',
  },
} as const;
```

- [ ] **Step 4: Run to verify pass** — `npm test -- demoCase` → PASS. Then `npm test` (the existing BodyExplorer tests still pass: the four new regions are not in `ORDER`/`HITS` yet, so the old component ignores them — but the a11y suite counts `BODY_REGIONS.length` regions. Update that assertion **now** to count only regions the old component draws: replace `expect(regions.length).toBe(BODY_REGIONS.length)` with `expect(regions.length).toBe(4)` and a comment "the old body explorer draws four; Task 4 replaces it". Task 5 rewrites this block.)

- [ ] **Step 5: Commit**

```bash
git add src/data/demoCase.ts src/data/__tests__/demoCase.test.ts src/__tests__/a11y.test.tsx
git commit -m "Add the Ask AL, Solutions, silhouette, and closing demo data"
```

---

### Task 2: Practice context

**Files:**
- Create: `src/practice/PracticeContext.tsx`, `src/practice/__tests__/PracticeContext.test.tsx`

**Interfaces:**
- Produces: `type Practice = 'PI' | 'WC'`; `PracticeProvider({ children, initial? })`; `usePractice(): { practice: Practice; setPractice: (p: Practice) => void }`; `PRACTICE_STORAGE_KEY = 'al-practice'`.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PracticeProvider, usePractice, PRACTICE_STORAGE_KEY } from '../PracticeContext';

function Probe() {
  const { practice, setPractice } = usePractice();
  return (
    <div>
      <output data-testid="practice">{practice}</output>
      <button type="button" onClick={() => setPractice('WC')}>wc</button>
    </div>
  );
}

beforeEach(() => window.sessionStorage.clear());

describe('PracticeContext', () => {
  it('defaults to PI', () => {
    render(<PracticeProvider><Probe /></PracticeProvider>);
    expect(screen.getByTestId('practice')).toHaveTextContent('PI');
  });

  it('shares a change with every consumer and persists it', async () => {
    const user = userEvent.setup();
    render(<PracticeProvider><Probe /><Probe /></PracticeProvider>);
    await user.click(screen.getAllByRole('button')[0]);
    expect(screen.getAllByTestId('practice').map((o) => o.textContent)).toEqual(['WC', 'WC']);
    expect(window.sessionStorage.getItem(PRACTICE_STORAGE_KEY)).toBe('WC');
  });

  it('restores a persisted choice', () => {
    window.sessionStorage.setItem(PRACTICE_STORAGE_KEY, 'WC');
    render(<PracticeProvider><Probe /></PracticeProvider>);
    expect(screen.getByTestId('practice')).toHaveTextContent('WC');
  });

  it('ignores junk in storage and survives storage that throws', () => {
    window.sessionStorage.setItem(PRACTICE_STORAGE_KEY, 'nope');
    render(<PracticeProvider><Probe /></PracticeProvider>);
    expect(screen.getByTestId('practice')).toHaveTextContent('PI');

    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    const { unmount } = render(<PracticeProvider><Probe /></PracticeProvider>);
    expect(screen.getAllByTestId('practice').at(-1)).toHaveTextContent('PI');
    act(() => { screen.getAllByRole('button').at(-1)!.click(); });
    expect(screen.getAllByTestId('practice').at(-1)).toHaveTextContent('WC');
    unmount(); get.mockRestore(); set.mockRestore();
  });

  it('falls back to PI outside a provider rather than crashing', () => {
    render(<Probe />);
    expect(screen.getByTestId('practice')).toHaveTextContent('PI');
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npm test -- PracticeContext` → FAIL.

- [ ] **Step 3: Create `src/practice/PracticeContext.tsx`**

```tsx
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type Practice = 'PI' | 'WC';
export const PRACTICE_STORAGE_KEY = 'al-practice';

interface Value { practice: Practice; setPractice: (p: Practice) => void }

/*
 * Outside a provider, consumers get PI and a no-op setter. That keeps a section
 * renderable on its own in a test or a preview without crashing the page.
 */
const Ctx = createContext<Value>({ practice: 'PI', setPractice: () => {} });

const isPractice = (v: unknown): v is Practice => v === 'PI' || v === 'WC';

/* Storage may be absent or throw in private modes; a missing preference is not an error. */
function readStored(): Practice | null {
  try {
    const v = window.sessionStorage.getItem(PRACTICE_STORAGE_KEY);
    return isPractice(v) ? v : null;
  } catch {
    return null;
  }
}

function writeStored(p: Practice) {
  try {
    window.sessionStorage.setItem(PRACTICE_STORAGE_KEY, p);
  } catch {
    /* The choice still lives in React state for this page view. */
  }
}

/**
 * The visitor's practice, chosen once in Solutions and read by the closing section.
 * Session storage, not local: a choice should not outlive the visit.
 */
export function PracticeProvider({ children, initial = 'PI' }: { children: ReactNode; initial?: Practice }) {
  const [practice, set] = useState<Practice>(() => readStored() ?? initial);
  const setPractice = useCallback((p: Practice) => {
    set(p);
    writeStored(p);
  }, []);
  const value = useMemo(() => ({ practice, setPractice }), [practice, setPractice]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePractice(): Value {
  return useContext(Ctx);
}
```

- [ ] **Step 4: Run to verify pass** — `npm test -- PracticeContext` → PASS, 5 tests.

- [ ] **Step 5: Commit** — `git add src/practice && git commit -m "Add the shared practice context with session persistence"`

---

### Task 3: Ask AL section

**Files:**
- Create: `src/sections/AskAl.tsx`, `src/sections/AskAl.css`, `src/sections/__tests__/AskAl.test.tsx`
- Modify: `src/config.ts` (add `ASK_AL_ENABLED`), `src/App.tsx` (render after `Story`), `src/__tests__/a11y.test.tsx` (`SECTIONS` gains `'ask-al'` after `'story'`)

**Interfaces:**
- Produces: `AskAl()` — `<Section id="ask-al">`; question buttons `role="tab"` in a `tablist` named "Questions"; answer panel `data-testid="askal-answer"`; chips `data-testid="askal-chip"` as buttons with `aria-expanded`; citation card `data-testid="askal-card"`.
- Consumes: `ASK_AL_QA`, `SAMPLE_MARK`, `ASK_AL_ENABLED`.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AskAl } from '../AskAl';
import { ASK_AL_QA, CITATION_KINDS } from '../../data/demoCase';

describe('AskAl', () => {
  it('opens on the first question with its cited answer', () => {
    render(<AskAl />);
    expect(screen.getByRole('heading', { level: 2, name: /ask the file, not the model/i })).toBeInTheDocument();
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((t) => t.textContent)).toEqual(ASK_AL_QA.map((q) => q.question));
    const answer = screen.getByTestId('askal-answer');
    ASK_AL_QA[0].answer.forEach((s) => expect(answer).toHaveTextContent(s.text));
    expect(screen.getAllByTestId('askal-chip')).toHaveLength(ASK_AL_QA[0].citations.length);
  });

  it('names a real citation kind, document, and page on every chip', () => {
    render(<AskAl />);
    screen.getAllByTestId('askal-chip').forEach((chip, i) => {
      const c = ASK_AL_QA[0].citations[i];
      expect(CITATION_KINDS).toContain(c.kind);
      expect(chip).toHaveTextContent(c.kind);
      expect(chip).toHaveTextContent(c.document);
      expect(chip).toHaveTextContent(`pg. ${c.page}`);
    });
  });

  it('opens a citation card with document, page, excerpt, and review status', async () => {
    const user = userEvent.setup();
    render(<AskAl />);
    await user.click(screen.getAllByTestId('askal-chip')[1]);
    const card = screen.getByTestId('askal-card');
    const c = ASK_AL_QA[0].citations[1];
    expect(within(card).getByText(c.document)).toBeInTheDocument();
    expect(within(card).getByText(`page ${c.page}`)).toBeInTheDocument();
    expect(within(card).getByText(c.excerpt)).toBeInTheDocument();
    expect(within(card).getByText(c.reviewStatus)).toBeInTheDocument();
    expect(screen.getAllByTestId('askal-chip')[1]).toHaveAttribute('aria-expanded', 'true');
  });

  it('refuses the settlement question with no chips', async () => {
    const user = userEvent.setup();
    render(<AskAl />);
    await user.click(screen.getByRole('tab', { name: /settlement value/i }));
    expect(screen.getByTestId('askal-answer')).toHaveTextContent(/not in my context/i);
    expect(screen.queryAllByTestId('askal-chip')).toEqual([]);
    expect(screen.queryByTestId('askal-card')).not.toBeInTheDocument();
  });

  it('moves between questions with the arrow keys and keeps one tab stop', async () => {
    const user = userEvent.setup();
    render(<AskAl />);
    screen.getAllByRole('tab')[0].focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getAllByRole('tab')[1]).toHaveFocus();
    expect(screen.getAllByRole('tab').filter((t) => t.tabIndex === 0)).toHaveLength(1);
  });

  it('promises nothing from the roadmap', () => {
    const { container } = render(<AskAl />);
    expect(container.textContent).not.toMatch(/suggested questions|streaming|generate documents|compute action/i);
    expect(container.textContent).toMatch(/sample data/i);
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npm test -- AskAl` → FAIL.

- [ ] **Step 3: Add the switch to `src/config.ts`** (after `WALKTHROUGH_URL`):

```ts
/**
 * A kill switch, not a launch gate. Ask AL ships in every case today. If it is ever pulled
 * from the product, this hides the section; the story's chapter 5 stays, because grounded
 * answering is what it demonstrates and that behaviour is not what would be pulled.
 */
export const ASK_AL_ENABLED = true;
```

- [ ] **Step 4: Create `src/sections/AskAl.tsx`**

```tsx
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
```

- [ ] **Step 5: Create `src/sections/AskAl.css`**

```css
.al-askal { background: var(--al-navy); border-radius: var(--al-radius-panel); padding: var(--al-space-5); color: var(--al-ink-inverse); }
.al-askal__top {
  display: flex; align-items: center; justify-content: space-between; gap: var(--al-space-3);
  padding-bottom: var(--al-space-3); border-bottom: 1px solid var(--al-hairline-inverse); margin-bottom: var(--al-space-4);
}
.al-askal__case { color: #fff; font-size: var(--al-text-sm); font-weight: var(--al-weight-semibold); }
.al-askal__meta { color: var(--al-ink-inverse-muted); font-size: var(--al-text-xs); margin-top: 2px; }
.al-askal__mark {
  font-size: var(--al-text-xs); text-transform: uppercase; letter-spacing: var(--al-tracking-eyebrow);
  color: var(--al-ink-inverse-muted); font-weight: var(--al-weight-bold); white-space: nowrap;
}

.al-askal__questions { display: flex; flex-wrap: wrap; gap: var(--al-space-2); margin-bottom: var(--al-space-4); }
.al-askal__questions button {
  font-family: var(--al-font-ui); font-size: var(--al-text-sm); font-weight: var(--al-weight-medium);
  color: #fff; background: var(--al-navy-raised); border: 1px solid var(--al-hairline-inverse);
  border-radius: var(--al-radius-pill); padding: 9px 16px; cursor: pointer; text-align: left;
  transition: background-color var(--al-duration-fast) var(--al-ease), border-color var(--al-duration-fast) var(--al-ease), color var(--al-duration-fast) var(--al-ease);
}
.al-askal__questions button:hover { border-color: var(--al-teal); }
.al-askal__questions button[aria-selected="true"] { background: var(--al-teal); color: var(--al-navy); border-color: transparent; font-weight: var(--al-weight-semibold); }

.al-askal__panel { display: grid; gap: var(--al-space-3); }
.al-askal__answer {
  margin: 0; background: var(--al-navy-raised); border-radius: var(--al-radius-card);
  padding: var(--al-space-4); font-size: var(--al-text-body); line-height: var(--al-leading-normal); color: #fff;
  animation: al-askal-in var(--al-duration-base) var(--al-ease);
}
.al-askal__answer--refusal { border-left: 3px solid var(--al-amber); }
.al-askal__answer sup { color: var(--al-teal); font-weight: var(--al-weight-bold); font-size: var(--al-text-xs); line-height: 1; margin-left: 2px; }
@keyframes al-askal-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .al-askal__answer { animation: none; } }

.al-askal__chips { display: flex; flex-wrap: wrap; gap: var(--al-space-2); list-style: none; margin: 0; padding: 0; }
.al-askal__chips button {
  display: inline-flex; align-items: center; gap: var(--al-space-2);
  font-family: var(--al-font-ui); font-size: var(--al-text-xs); color: var(--al-ink-inverse);
  background: transparent; border: 1px solid var(--al-hairline-inverse); border-radius: var(--al-radius-pill);
  padding: 5px 12px 5px 6px; cursor: pointer;
  transition: border-color var(--al-duration-fast) var(--al-ease), background-color var(--al-duration-fast) var(--al-ease);
}
.al-askal__chips button:hover { border-color: var(--al-teal); }
.al-askal__chips button[aria-expanded="true"] { border-color: var(--al-teal); background: color-mix(in srgb, var(--al-teal) 12%, transparent); }
.al-askal__chips b { display: inline-grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; background: var(--al-teal); color: var(--al-navy); font-size: var(--al-text-xs); }
.al-askal__chips span + span::before { content: "·"; margin-right: var(--al-space-2); color: var(--al-ink-inverse-muted); }

.al-askal__card { background: var(--al-surface); color: var(--al-ink); border-radius: var(--al-radius-card); padding: var(--al-space-4); max-width: 62ch; }
.al-askal__card-head { display: flex; justify-content: space-between; gap: var(--al-space-3); font-size: var(--al-text-xs); margin-bottom: var(--al-space-2); }
.al-askal__kind { color: var(--al-teal-text); font-weight: var(--al-weight-bold); text-transform: uppercase; letter-spacing: var(--al-tracking-eyebrow); }
.al-askal__status { color: var(--al-amber-text); font-weight: var(--al-weight-semibold); }
.al-askal__card-src { display: flex; justify-content: space-between; gap: var(--al-space-3); border-bottom: 1px solid var(--al-hairline); padding-bottom: var(--al-space-2); margin-bottom: var(--al-space-3); font-size: var(--al-text-sm); }
.al-askal__card-src span { color: var(--al-ink-muted); font-size: var(--al-text-xs); }
.al-askal__excerpt { margin: 0; font-family: var(--al-font-record); font-size: var(--al-text-body); line-height: var(--al-leading-record); border-left: 3px solid var(--al-teal-text); padding-left: var(--al-space-3); }

.al-askal__foot { margin: var(--al-space-4) 0 0; font-size: var(--al-text-xs); color: var(--al-ink-inverse-muted); max-width: 62ch; }
```

- [ ] **Step 6: Wire it** — in `src/App.tsx` import `AskAl` and `ASK_AL_ENABLED`; render `{ASK_AL_ENABLED && <AskAl />}` directly after `<Story />`. In `src/__tests__/a11y.test.tsx`, `SECTIONS` becomes `['story', 'ask-al', 'products', 'solutions', 'trust', 'contact']`. The floor guard's `storyPrefixes` gains `'.al-askal'`.

- [ ] **Step 7: Run** — `npm test -- AskAl a11y claims` then `npm test` → PASS. The a11y "keeps exactly one practice tab" test filters `getAllByRole('tab')` — with a second tablist it now sees more tabs. Scope it: `const inSequence = () => within(screen.getByRole('tablist', { name: /practice area/i })).getAllByRole('tab').filter((t) => t.tabIndex === 0);`.

- [ ] **Step 8: Commit** — `git add -A src && git commit -m "Add the Ask AL section: three questions, cited answers, one refusal"`

---

### Task 4: Silhouette figure

**Files:**
- Create: `src/sections/Silhouette.tsx`, `src/sections/Silhouette.css`, `src/sections/__tests__/Silhouette.test.tsx`
- Delete: `src/sections/BodyExplorer.tsx`, `BodyExplorer.css`, `src/sections/__tests__/BodyExplorer.test.tsx`
- Modify: `src/sections/ProductExperience.tsx` (interim: render `Silhouette` instead of `BodyExplorer`), `src/__tests__/a11y.test.tsx` (regions count → 8; floor prefixes gain `'.al-sil'`; breakpoint assertion `at(780, '.al-bx__body')` → `at(780, '.al-sil__body')`)

**Interfaces:**
- Produces: `Silhouette()`; regions are `<rect role="button" aria-pressed aria-label="{label}, {status}">` in `SIL_ORDER` (cervical, shoulder, shoulder-right, hand-left, hand-right, lumbar, knee-left, knee); detail card `data-testid="sil-detail"`; each row's cite `data-testid="cite"`.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Silhouette, SIL_ORDER, HITS } from '../Silhouette';
import { BODY_REGIONS } from '../../data/demoCase';

describe('Silhouette', () => {
  it('draws every region as a named button carrying its status in words', () => {
    render(<Silhouette />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(BODY_REGIONS.length);
    buttons.forEach((b) => expect(b).toHaveAccessibleName(/accepted body part|not an accepted body part|disputed/i));
  });

  it('opens on the lumbar spine and swaps on selection', async () => {
    const user = userEvent.setup();
    render(<Silhouette />);
    const detail = screen.getByTestId('sil-detail');
    expect(within(detail).getByRole('heading', { name: /lumbar spine/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /left shoulder/i }));
    expect(within(detail).getByText(/rotator cuff is partially torn/i)).toBeInTheDocument();
  });

  it('keeps a region with no records visible and says so', async () => {
    const user = userEvent.setup();
    render(<Silhouette />);
    await user.click(screen.getByRole('button', { name: /right hand/i }));
    expect(within(screen.getByTestId('sil-detail')).getByText(/no documents reference this region/i)).toBeInTheDocument();
  });

  it('moves top to bottom with the arrow keys in the declared order', async () => {
    const user = userEvent.setup();
    render(<Silhouette />);
    screen.getByRole('button', { name: /cervical/i }).focus();
    for (let i = 1; i < SIL_ORDER.length; i++) {
      await user.keyboard('{ArrowDown}');
      const label = BODY_REGIONS.find((r) => r.key === SIL_ORDER[i])!.label;
      expect(screen.getByRole('button', { name: new RegExp(label, 'i') })).toHaveFocus();
    }
  });

  it('labels every region beside the figure, not only by colour', () => {
    render(<Silhouette />);
    BODY_REGIONS.forEach((r) => expect(screen.getAllByText(r.label).length).toBeGreaterThan(0));
  });

  it('gives every hit target at least 24px at the smallest rendered size', () => {
    // The figure is 220 units wide and renders no narrower than 200px, so one unit is
    // at least 0.909px: a target needs 27 units to clear 24px.
    Object.values(HITS).forEach((h) => {
      expect(Math.min(h.w, h.h)).toBeGreaterThanOrEqual(27);
    });
  });

  it('cites a source on every row', () => {
    render(<Silhouette />);
    within(screen.getByTestId('sil-detail')).getAllByTestId('cite').forEach((c) => expect(c.textContent?.trim()).not.toBe(''));
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npm test -- Silhouette` → FAIL.

- [ ] **Step 3: Create `src/sections/Silhouette.tsx`**

```tsx
import { useRef, useState, type KeyboardEvent } from 'react';
import { BODY_REGIONS, SAMPLE_MARK } from '../data/demoCase';
import './Silhouette.css';

/** Visual top-to-bottom order, left before right, so the arrow keys feel physical. */
export const SIL_ORDER = ['cervical', 'shoulder', 'shoulder-right', 'hand-left', 'hand-right', 'lumbar', 'knee-left', 'knee'] as const;

/** Hit targets in figure units (viewBox 220×440). Each side is ≥ 27 units: see the test. */
export const HITS: Record<(typeof SIL_ORDER)[number], { x: number; y: number; w: number; h: number; r: number; label: [number, number]; anchor: 'start' | 'end' }> = {
  cervical:         { x: 96,  y: 60,  w: 28, h: 27, r: 8,  label: [176, 66],  anchor: 'start' },
  shoulder:         { x: 56,  y: 90,  w: 30, h: 28, r: 10, label: [4, 90],    anchor: 'start' },
  'shoulder-right': { x: 134, y: 90,  w: 30, h: 28, r: 10, label: [176, 100], anchor: 'start' },
  'hand-left':      { x: 30,  y: 232, w: 28, h: 30, r: 9,  label: [4, 228],   anchor: 'start' },
  'hand-right':     { x: 162, y: 232, w: 28, h: 30, r: 9,  label: [176, 262], anchor: 'start' },
  lumbar:           { x: 86,  y: 194, w: 48, h: 32, r: 10, label: [176, 196], anchor: 'start' },
  'knee-left':      { x: 78,  y: 306, w: 28, h: 28, r: 9,  label: [4, 340],   anchor: 'start' },
  knee:             { x: 114, y: 306, w: 28, h: 28, r: 9,  label: [176, 330], anchor: 'start' },
};

/* One outline. Front view, no face, no musculature: medical illustration in restraint. */
const OUTLINE = 'M110 12c-15 0-26 12-26 27 0 12 6 22 15 26v12c-22 3-40 11-50 26-8 12-11 30-13 50l-7 66c-1 8 3 13 9 13s10-4 11-10l9-58 4-22v44c-3 30-4 62-2 92l7 110c1 10 6 15 13 15s11-5 11-14l4-108 8-56 8 56 4 108c0 9 4 14 11 14s12-5 13-15l7-110c2-30 1-62-2-92v-44l4 22 9 58c1 6 5 10 11 10s10-5 9-13l-7-66c-2-20-5-38-13-50-10-15-28-23-50-26v-12c9-4 15-14 15-26 0-15-11-27-26-27z';

type Key = (typeof SIL_ORDER)[number];

function statusOf(key: Key): string {
  const r = BODY_REGIONS.find((x) => x.key === key)!;
  if (r.claimed) return 'accepted body part';
  return r.rows.some((row) => /no documents reference/i.test(row.value)) ? 'not an accepted body part, no records' : 'not an accepted body part, disputed';
}

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
              const tone = meta.claimed ? 'on' : statusOf(key).includes('disputed') ? 'disputed' : 'none';
              const cx = h.x + h.w / 2, cy = h.y + h.h / 2;
              return (
                <g key={key}>
                  <line className="al-sil__lead" x1={h.anchor === 'start' && h.label[0] > cx ? h.x + h.w : h.x} y1={cy} x2={h.label[0] > cx ? h.label[0] - 4 : h.label[0] + 60} y2={h.label[1] - 4} aria-hidden="true" />
                  <text className={`al-sil__label al-sil__label--${tone}`} x={h.label[0]} y={h.label[1]} aria-hidden="true">{meta.label}</text>
                  <rect
                    ref={(el) => { refs.current[key] = el; }}
                    className={`al-sil__region al-sil__region--${tone}${on ? ' is-on' : ''}`}
                    x={h.x} y={h.y} width={h.w} height={h.h} rx={h.r}
                    tabIndex={0}
                    role="button"
                    aria-pressed={on}
                    aria-label={`${meta.label}, ${statusOf(key)}`}
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
```

- [ ] **Step 4: Create `src/sections/Silhouette.css`**

```css
.al-sil { background: var(--al-navy); border-radius: var(--al-radius-panel); padding: var(--al-space-5); color: var(--al-ink-inverse); }
.al-sil__head { display: flex; justify-content: space-between; align-items: center; gap: var(--al-space-3); padding-bottom: var(--al-space-3); border-bottom: 1px solid var(--al-hairline-inverse); margin-bottom: var(--al-space-4); }
.al-sil__title { color: #fff; font-size: var(--al-text-sm); font-weight: var(--al-weight-semibold); }
.al-sil__note { color: var(--al-ink-inverse-muted); font-size: var(--al-text-xs); margin-top: 2px; }
.al-sil__mark { font-size: var(--al-text-xs); text-transform: uppercase; letter-spacing: var(--al-tracking-eyebrow); color: var(--al-ink-inverse-muted); font-weight: var(--al-weight-bold); white-space: nowrap; }

.al-sil__body { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: var(--al-space-5); align-items: start; }
@media (max-width: 780px) {
  .al-sil__body { grid-template-columns: minmax(0, 1fr); }
  .al-sil__fig { max-width: 300px; margin-inline: auto; }
}

/* Sunken well, raised figure: both from the palette, roughly two perceptual steps apart. */
.al-sil__fig { background: var(--al-navy-sunken); border-radius: var(--al-radius-card); padding: var(--al-space-3); min-width: 200px; }
.al-sil__fig svg { width: 100%; height: auto; display: block; }
.al-sil__outline { fill: var(--al-navy-raised); stroke: rgba(255, 255, 255, 0.28); stroke-width: 1.2; }

.al-sil__region { cursor: pointer; stroke-width: 1.2; transition: opacity var(--al-duration-fast) var(--al-ease); }
.al-sil__region--on { fill: color-mix(in srgb, var(--al-teal) 55%, transparent); stroke: var(--al-teal); }
.al-sil__region--disputed { fill: color-mix(in srgb, var(--al-amber) 45%, transparent); stroke: var(--al-amber); stroke-dasharray: 3 2; }
.al-sil__region--none { fill: color-mix(in srgb, var(--al-state-neutral) 55%, transparent); stroke: rgba(255, 255, 255, 0.25); }
.al-sil__region:hover { opacity: 0.8; }
.al-sil__region.is-on { stroke-width: 2.5; opacity: 1; }
.al-sil__region:focus-visible { outline: 2px solid var(--al-teal); outline-offset: 2px; }

.al-sil__lead { stroke: rgba(255, 255, 255, 0.35); stroke-width: 1; }
/* 12 SVG units at the 200px minimum is 10.9px, so the labels are set larger: 13 units
   renders at 11.8px there and 15px on desktop. The floor guard reads CSS px, and SVG
   text units are not px; the accessible name carries the same words regardless. */
.al-sil__label { font-family: var(--al-font-ui); font-size: 13px; fill: #DDE5EA; }
.al-sil__label--on { fill: var(--al-teal); font-weight: var(--al-weight-bold); }
.al-sil__label--disputed { fill: #F0B48F; font-weight: var(--al-weight-bold); }

.al-sil__legend { display: flex; gap: var(--al-space-3); flex-wrap: wrap; font-size: var(--al-text-xs); color: var(--al-ink-inverse-muted); margin-top: var(--al-space-2); }
.al-sil__sw { width: 8px; height: 8px; border-radius: 2px; display: inline-block; margin-right: 4px; }
.al-sil__sw--on { background: var(--al-teal); } .al-sil__sw--disputed { background: var(--al-amber); } .al-sil__sw--none { background: var(--al-state-neutral); }

.al-sil__detail { background: var(--al-surface); color: var(--al-ink); border-radius: var(--al-radius-card); padding: var(--al-space-4); }
.al-sil__detail h4 { margin: 0 0 var(--al-space-1); font-size: var(--al-text-h3); }
.al-sil__plain { margin: 0 0 var(--al-space-4); font-size: var(--al-text-sm); color: var(--al-ink-muted); line-height: var(--al-leading-normal); max-width: 62ch; }
.al-sil__rows { display: grid; gap: var(--al-space-2); }
.al-sil__row { border-left: 3px solid var(--al-teal-text); background: var(--al-canvas); border-radius: var(--al-radius-sm); padding: var(--al-space-3); }
.al-sil__row.is-warn { border-left-color: var(--al-amber); }
.al-sil__row b { display: block; font-size: var(--al-text-xs); text-transform: uppercase; letter-spacing: var(--al-tracking-eyebrow); color: var(--al-ink-muted); margin-bottom: 3px; }
.al-sil__row span { font-size: var(--al-text-sm); }
.al-sil__row cite { display: block; font-style: normal; font-size: var(--al-text-xs); color: var(--al-teal-text); margin-top: 4px; font-weight: var(--al-weight-semibold); }
.al-sil__row.is-warn cite { color: var(--al-amber-text); }
```

The SVG `font-size: 13px` on `.al-sil__label` is text inside a panel; the floor guard scans `px` literals under the `.al-sil` prefix and would flag 13px? No — 13 ≥ 12. It passes. Do not lower it.

- [ ] **Step 5: Swap it in** — `ProductExperience.tsx` imports `Silhouette` instead of `BodyExplorer` (heading unchanged for now). Delete `BodyExplorer.tsx`, `BodyExplorer.css`, and its test. In the a11y suite: regions count → `expect(regions.length).toBe(BODY_REGIONS.length)` again (8); `at(780, '.al-bx__body')` → `at(780, '.al-sil__body')`; floor prefixes gain `'.al-sil'`. `grep -rn "BodyExplorer\|al-bx" src` returns nothing.

- [ ] **Step 6: Run** — `npm test` → PASS; `npm run build` clean.

- [ ] **Step 7: Commit** — `git add -A src && git commit -m "Replace the block mannequin with the silhouette figure: eight regions, leader labels"`

---

### Task 5: Solutions section with PI and WC panels

**Files:**
- Create: `src/sections/Solutions.tsx`, `src/sections/Solutions.css`, `src/sections/__tests__/Solutions.test.tsx`
- Delete: `src/sections/PracticeSolutions.tsx` + `.css` + test, `src/sections/ProductExperience.tsx` + `.css`
- Modify: `src/App.tsx` (wrap in `PracticeProvider`; render `Solutions` in place of `ProductExperience` + `PracticeSolutions`), `src/__tests__/a11y.test.tsx`, `src/navigation.ts` (no change: Solutions keeps `id="solutions"`)

**Interfaces:**
- Produces: `Solutions()` — `<Section id="solutions">`; practice `tablist` named "Practice area" (unchanged from today); inside the active panel a second `tablist` named "{PI|WC} screens"; `data-testid="sol-panel"`.
- Consumes: `usePractice`, `PI_PANEL`, `WC_PANEL`, `Silhouette`, `SAMPLE_MARK`.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Solutions } from '../Solutions';
import { PracticeProvider } from '../../practice/PracticeContext';
import { PI_PANEL, WC_PANEL } from '../../data/demoCase';

const renderIt = () => render(<PracticeProvider><Solutions /></PracticeProvider>);
const practiceTabs = () => within(screen.getByRole('tablist', { name: /practice area/i }));

describe('Solutions', () => {
  it('defaults to personal injury and shows the PI Overview tabs', () => {
    renderIt();
    expect(practiceTabs().getByRole('tab', { name: /personal injury/i })).toHaveAttribute('aria-selected', 'true');
    const screens = within(screen.getByRole('tablist', { name: /PI screens/i }));
    expect(screens.getAllByRole('tab').map((t) => t.textContent)).toEqual(PI_PANEL.tabs.map((t) => t.label));
    PI_PANEL.evidenceTiers.forEach((tier) => expect(screen.getByText(tier)).toBeInTheDocument());
  });

  it('shows the wage-loss derivation on the Damages tab', async () => {
    const user = userEvent.setup();
    renderIt();
    await user.click(screen.getByRole('tab', { name: /damages & demand/i }));
    expect(screen.getByText(PI_PANEL.wage[2].value)).toBeInTheDocument();
    expect(screen.getByText(/combined average weekly wage/i)).toBeInTheDocument();
  });

  it('swaps to the WC Intelligence tabs and the figure', async () => {
    const user = userEvent.setup();
    renderIt();
    await user.click(practiceTabs().getByRole('tab', { name: /workers/i }));
    const screens = within(screen.getByRole('tablist', { name: /WC screens/i }));
    expect(screens.getAllByRole('tab').map((t) => t.textContent)).toEqual(WC_PANEL.tabs.map((t) => t.label));
    WC_PANEL.readiness.forEach((c) => expect(screen.getByText(c.label)).toBeInTheDocument());
    await user.click(screen.getByRole('tab', { name: /injury & work status/i }));
    expect(screen.getByRole('group', { name: /body region selector/i })).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: /medical-legal & disputes/i }));
    expect(screen.getByText(WC_PANEL.conflict.title)).toBeInTheDocument();
    expect(screen.getByText(WC_PANEL.missing.needed)).toBeInTheDocument();
  });

  it('says workflows, never products', () => {
    const { container } = renderIt();
    expect(container.textContent).toMatch(/two workflows/i);
    expect(container.textContent).not.toMatch(/separate products|two products/i);
  });

  it('keeps one tab stop per tablist and moves with the arrow keys', async () => {
    const user = userEvent.setup();
    renderIt();
    practiceTabs().getByRole('tab', { name: /personal injury/i }).focus();
    await user.keyboard('{ArrowRight}');
    expect(practiceTabs().getByRole('tab', { name: /workers/i })).toHaveFocus();
    expect(practiceTabs().getAllByRole('tab').filter((t) => t.tabIndex === 0)).toHaveLength(1);
    const screens = within(screen.getByRole('tablist', { name: /WC screens/i }));
    expect(screens.getAllByRole('tab').filter((t) => t.tabIndex === 0)).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npm test -- Solutions` → FAIL.

- [ ] **Step 3: Create `src/sections/Solutions.tsx`**

```tsx
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
```

- [ ] **Step 4: Create `src/sections/Solutions.css`** — move the `.al-seg` rules verbatim from `PracticeSolutions.css`, then:

```css
.al-sol__panel { background: var(--al-navy); border-radius: var(--al-radius-panel); padding: var(--al-space-5); color: var(--al-ink-inverse); animation: al-fade var(--al-duration-base) var(--al-ease); }
@keyframes al-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .al-sol__panel { animation: none; } }

.al-sol__head { display: flex; justify-content: space-between; align-items: center; gap: var(--al-space-3); padding-bottom: var(--al-space-3); border-bottom: 1px solid var(--al-hairline-inverse); margin-bottom: var(--al-space-3); }
.al-sol__title { color: #fff; font-size: var(--al-text-sm); font-weight: var(--al-weight-semibold); }
.al-sol__note { color: var(--al-ink-inverse-muted); font-size: var(--al-text-xs); margin-top: 2px; }
.al-sol__mark { font-size: var(--al-text-xs); text-transform: uppercase; letter-spacing: var(--al-tracking-eyebrow); color: var(--al-ink-inverse-muted); font-weight: var(--al-weight-bold); white-space: nowrap; }

.al-sol__tabs { display: flex; gap: var(--al-space-1); flex-wrap: wrap; border-bottom: 1px solid var(--al-hairline-inverse); margin-bottom: var(--al-space-4); }
.al-sol__tabs button {
  font-family: var(--al-font-ui); font-size: var(--al-text-sm); font-weight: var(--al-weight-medium); color: var(--al-ink-inverse-muted);
  background: transparent; border: 0; border-bottom: 2px solid transparent; padding: 10px 12px; margin-bottom: -1px; cursor: pointer;
  transition: color var(--al-duration-fast) var(--al-ease), border-color var(--al-duration-fast) var(--al-ease);
}
.al-sol__tabs button:hover { color: #fff; }
.al-sol__tabs button[aria-selected="true"] { color: var(--al-teal); border-bottom-color: var(--al-teal); font-weight: var(--al-weight-semibold); }

.al-sol__screen { min-height: 200px; }
.al-sol__tiers { display: flex; flex-wrap: wrap; gap: var(--al-space-2); list-style: none; margin: 0 0 var(--al-space-3); padding: 0; }
.al-sol__tiers li { font-size: var(--al-text-xs); border: 1px solid var(--al-hairline-inverse); border-radius: var(--al-radius-pill); padding: 4px 10px; color: var(--al-ink-inverse); }
.al-sol__rows { display: grid; gap: var(--al-space-2); margin: 0; }
.al-sol__rows > div { display: grid; grid-template-columns: 200px minmax(0, 1fr); gap: var(--al-space-3); background: var(--al-navy-raised); border-radius: var(--al-radius-sm); padding: 10px 12px; font-size: var(--al-text-sm); }
@media (max-width: 520px) { .al-sol__rows > div { grid-template-columns: minmax(0, 1fr); } }
.al-sol__rows dt { color: var(--al-ink-inverse-muted); } .al-sol__rows dd { margin: 0; color: #fff; }
.al-sol__tier { display: block; font-size: var(--al-text-xs); color: var(--al-teal); margin-top: 2px; }

.al-sol__readiness { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--al-space-2); }
.al-sol__readiness li { display: flex; justify-content: space-between; gap: var(--al-space-3); background: var(--al-navy-raised); border-radius: var(--al-radius-sm); padding: 10px 12px; font-size: var(--al-text-sm); }
.al-sol__readiness b.is-complete { color: var(--al-teal); } .al-sol__readiness b.is-open { color: #F0B48F; }

.al-sol__cards { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--al-space-2); }
@media (max-width: 860px) { .al-sol__cards { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.al-sol__cards li { background: var(--al-navy-raised); border-radius: var(--al-radius-card); padding: var(--al-space-3); border-left: 3px solid var(--al-teal); display: grid; gap: 2px; }
.al-sol__cards span { font-size: var(--al-text-xs); color: var(--al-ink-inverse-muted); }
.al-sol__cards b { font-size: 1.4rem; color: #fff; line-height: 1.1; }
.al-sol__cards small { font-size: var(--al-text-xs); color: var(--al-ink-inverse-muted); }

.al-sol__dispute { background: var(--al-navy-raised); border-radius: var(--al-radius-card); padding: var(--al-space-3); border-left: 3px solid var(--al-amber); margin-bottom: var(--al-space-2); }
.al-sol__dispute b { display: block; color: #fff; font-size: var(--al-text-sm); margin: var(--al-space-1) 0; }
.al-sol__dispute p { margin: 0; font-size: var(--al-text-xs); color: var(--al-ink-inverse-muted); line-height: var(--al-leading-normal); }
.al-sol__badges { display: flex; gap: var(--al-space-1); flex-wrap: wrap; }
.al-sol__badges span { font-size: var(--al-text-xs); border: 1px solid var(--al-hairline-inverse); border-radius: var(--al-radius-pill); padding: 2px 8px; color: var(--al-ink-inverse); text-transform: capitalize; }
.al-sol__badges .is-status { color: var(--al-amber-wash); background: color-mix(in srgb, var(--al-amber) 30%, transparent); border-color: transparent; }
.al-sol__needed { color: var(--al-amber-wash) !important; font-weight: var(--al-weight-semibold); margin-top: var(--al-space-1) !important; }

.al-sol__outputs { margin: var(--al-space-4) 0 0; font-size: var(--al-text-xs); color: var(--al-ink-inverse-muted); }
.al-sol__outputs b { color: #fff; }
```

(Drop the two `!important`s if a more specific selector `.al-sol__dispute .al-sol__needed` is used instead — prefer that.)

- [ ] **Step 5: Assemble** — `src/App.tsx`:

```tsx
import { PageShell } from './pages/PageShell';
import { PracticeProvider } from './practice/PracticeContext';
import { Story } from './story/Story';
import { AskAl } from './sections/AskAl';
import { Solutions } from './sections/Solutions';
import { Trust } from './sections/Trust';
import { Conversion } from './sections/Conversion';
import { ASK_AL_ENABLED } from './config';

export default function App() {
  return (
    <PageShell>
      <PracticeProvider>
        <Story />
        {ASK_AL_ENABLED && <AskAl />}
        <Solutions />
        <Trust />
        <Conversion />
      </PracticeProvider>
    </PageShell>
  );
}
```

Delete `PracticeSolutions.*`, its test, `ProductExperience.*`. a11y: `SECTIONS` → `['story', 'ask-al', 'solutions', 'trust', 'contact']`; the "body explorer regions" block in the manual-pass test: the figure is only rendered on the WC → Injury tab, so replace the block with a comment "the silhouette's regions are covered by Silhouette.test.tsx; it renders only under the WC Injury tab" and delete the assertion; the practice-tab test already scopes to the practice tablist (Task 3). Floor prefixes gain `'.al-sol'`, `'.al-seg'`.

- [ ] **Step 6: Run** — `npm test`, `npx tsc --noEmit -p tsconfig.json`, `npm run build` → green.

- [ ] **Step 7: Commit** — `git add -A src && git commit -m "Rebuild Solutions: the real PI and WC screens, with the silhouette under Injury & Work Status"`

---

### Task 6: Practice-specific conversion and the call-page parameter

**Files:**
- Modify: `src/sections/Conversion.tsx`, `src/sections/Conversion.css`, `src/pages/schedule-call/ScheduleCallPage.tsx`
- Test: `src/sections/__tests__/Conversion.test.tsx` (create), `src/pages/schedule-call/__tests__/ScheduleCallPage.test.tsx` (extend)

**Interfaces:**
- Produces: `practiceFromSearch(search: string): number | null` exported from `ScheduleCallPage.tsx` — index into `PRACTICES` (`pi` → 0, `wc` → 1, `both` → 2, else null).

- [ ] **Step 1: Write the failing tests**

`src/sections/__tests__/Conversion.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Conversion } from '../Conversion';
import { PracticeProvider } from '../../practice/PracticeContext';
import { PRACTICE_CLOSING } from '../../data/demoCase';

describe('Conversion', () => {
  it('closes for PI by default, pointing the call at the PI practice', () => {
    render(<PracticeProvider><Conversion /></PracticeProvider>);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(PRACTICE_CLOSING.PI.heading);
    expect(screen.getByRole('link', { name: /schedule a call/i })).toHaveAttribute('href', PRACTICE_CLOSING.PI.href);
    expect(screen.queryByRole('link', { name: /analyze one/i })).not.toBeInTheDocument();
  });

  it('follows the shared practice choice', () => {
    render(<PracticeProvider initial="WC"><Conversion /></PracticeProvider>);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(PRACTICE_CLOSING.WC.heading);
    expect(screen.getByRole('link', { name: /schedule a call/i })).toHaveAttribute('href', PRACTICE_CLOSING.WC.href);
  });

  it('lets the visitor switch practice here without scrolling back up', async () => {
    const user = userEvent.setup();
    render(<PracticeProvider><Conversion /></PracticeProvider>);
    await user.click(screen.getByRole('button', { name: /workers/i }));
    expect(screen.getByRole('button', { name: /workers/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(PRACTICE_CLOSING.WC.heading);
  });
});
```

Append to `ScheduleCallPage.test.tsx`:

```tsx
describe('ScheduleCallPage — the practice parameter', () => {
  it('maps pi, wc, both, and junk', () => {
    expect(practiceFromSearch('?practice=pi')).toBe(0);
    expect(practiceFromSearch('?practice=wc')).toBe(1);
    expect(practiceFromSearch('?practice=both')).toBe(2);
    expect(practiceFromSearch('?practice=other')).toBeNull();
    expect(practiceFromSearch('')).toBeNull();
  });

  it('preselects the practice the closing section chose', () => {
    window.history.replaceState({}, '', '/schedule-call/?practice=wc');
    render(<ScheduleCallPage />);
    expect(screen.getByRole('radio', { name: /workers/i })).toBeChecked();
    window.history.replaceState({}, '', '/');
  });
});
```

(Import `practiceFromSearch` alongside the existing imports at the top of that file.)

- [ ] **Step 2: Run to verify failure** — `npm test -- Conversion ScheduleCallPage` → FAIL.

- [ ] **Step 3: Rewrite `src/sections/Conversion.tsx`**

```tsx
import { Button } from '../components/primitives/Button';
import { usePractice, type Practice } from '../practice/PracticeContext';
import { PRACTICE_CLOSING } from '../data/demoCase';
import { TRIAL_ENABLED, TRIAL_URL } from '../config';
import './Conversion.css';

const AREAS: Array<{ key: Practice; label: string }> = [
  { key: 'PI', label: 'Personal injury' },
  { key: 'WC', label: 'Workers’ compensation' },
];

/**
 * Practice-specific, from the choice made in Solutions. The button carries the practice
 * to the call page so its first question is already answered.
 */
export function Conversion() {
  const { practice, setPractice } = usePractice();
  const closing = PRACTICE_CLOSING[practice];
  return (
    <section id="contact" className="al-section al-conv al-on-navy" aria-labelledby="conv-heading">
      <div className="al-container al-conv__inner">
        <h2 id="conv-heading" className="al-conv__title">{closing.heading}</h2>
        <div className="al-conv__switch" role="group" aria-label="Practice">
          {AREAS.map((a) => (
            <button key={a.key} type="button" aria-pressed={practice === a.key} onClick={() => setPractice(a.key)}>{a.label}</button>
          ))}
        </div>
        <p className="al-conv__sub">{closing.body}</p>
        <div className="al-conv__ctas">
          <Button href={closing.href} variant="inverse" size="lg" withCaret>Schedule a call</Button>
          {TRIAL_ENABLED && (
            <Button href={TRIAL_URL} variant="inverse-secondary" size="lg">Analyze one report</Button>
          )}
        </div>
        {TRIAL_ENABLED && (
          <p className="al-conv__fine">Or upload one QME, AME, or IME report and see it chronologized, with every fact cited to its page.</p>
        )}
      </div>
    </section>
  );
}
```

Append to `Conversion.css`:

```css
.al-conv__switch { display: inline-flex; gap: 2px; background: var(--al-navy-raised); border: 1px solid var(--al-hairline-inverse); border-radius: var(--al-radius-pill); padding: 4px; margin-bottom: var(--al-space-4); }
.al-conv__switch button {
  font-family: var(--al-font-ui); font-size: var(--al-text-sm); font-weight: var(--al-weight-semibold); color: var(--al-ink-inverse-muted);
  background: transparent; border: 0; padding: 8px 16px; border-radius: var(--al-radius-pill); cursor: pointer;
  transition: background-color var(--al-duration-fast) var(--al-ease), color var(--al-duration-fast) var(--al-ease);
}
.al-conv__switch button[aria-pressed="true"] { background: var(--al-teal); color: var(--al-navy); }
```

- [ ] **Step 4: The call page** — in `ScheduleCallPage.tsx` add, after `PRACTICES`:

```ts
/** `?practice=pi|wc|both` → index into PRACTICES; anything else preselects nothing. */
export function practiceFromSearch(search: string): number | null {
  const v = new URLSearchParams(search).get('practice');
  return v === 'pi' ? 0 : v === 'wc' ? 1 : v === 'both' ? 2 : null;
}
```

In `QualifyingForm`, compute `const preset = typeof window === 'undefined' ? null : practiceFromSearch(window.location.search);` and add `defaultChecked={preset === i}` to each practice radio. (In booking mode nothing changes: Google's form asks the question itself.)

- [ ] **Step 5: Run** — `npm test` → PASS (the existing claims guard and a11y counts: the conversion now has two extra buttons; the manual-pass test does not count buttons globally, only chronology `aria-expanded` ones inside `main` outside the banner — the switch buttons carry `aria-pressed`, not `aria-expanded`, so nothing changes; but the "body explorer regions" block was removed in Task 5, and `getAllByRole('button', { pressed: false })` is no longer asserted there).

- [ ] **Step 6: Commit** — `git add -A src && git commit -m "Close for the practice the visitor chose, and carry it to the call page"`

---

### Task 7: Privacy and terms slots

**Files:**
- Create: `src/pages/LegalPage.tsx`, `src/pages/LegalPage.css`, `src/pages/privacy/PrivacyPage.tsx`, `src/pages/privacy/main.tsx`, `privacy/index.html`, `src/pages/terms/TermsPage.tsx`, `src/pages/terms/main.tsx`, `terms/index.html`, `src/pages/__tests__/LegalPage.test.tsx`
- Modify: `src/config.ts`, `vite.config.ts`, `src/components/SiteFooter.tsx` + test, `src/sections/Trust.tsx`, `public/sitemap.xml`, `src/__tests__/credibility.test.tsx` (entries list), `src/__tests__/claims.test.tsx` (PAGES), `src/pages/__tests__/pages.test.tsx` (PAGES)

**Interfaces:**
- Produces: `LegalSection = { heading: string; paragraphs: ReadonlyArray<string> }`; `PRIVACY_TEXT`, `TERMS_TEXT: ReadonlyArray<LegalSection>` (empty); `PRIVACY_URL = '/privacy/'`, `TERMS_URL = '/terms/'`; `LegalPage({ title, eyebrow, sections, unpublished })`; `LEGAL_LINKS` computed in `SiteFooter` (only pages with text).

- [ ] **Step 1: Write the failing test** — `src/pages/__tests__/LegalPage.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LegalPage } from '../LegalPage';
import { PrivacyPage } from '../privacy/PrivacyPage';
import { PRIVACY_TEXT, TERMS_TEXT, CONTACT_EMAIL } from '../../config';

describe('LegalPage', () => {
  it('renders an owner-supplied document as sections', () => {
    render(<LegalPage title="Privacy policy" eyebrow="Legal" sections={[{ heading: 'Scope', paragraphs: ['One.', 'Two.'] }]} />);
    expect(screen.getByRole('heading', { level: 1, name: /privacy policy/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Scope' })).toBeInTheDocument();
    expect(screen.getByText('Two.')).toBeInTheDocument();
    expect(screen.queryByText(/not yet published/i)).not.toBeInTheDocument();
  });

  it('says truthfully that an empty slot is not yet published, and where to ask', () => {
    render(<LegalPage title="Terms" eyebrow="Legal" sections={[]} />);
    expect(screen.getByText(/not yet published here/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: CONTACT_EMAIL })).toHaveAttribute('href', `mailto:${CONTACT_EMAIL}`);
  });

  it('ships both slots empty', () => {
    expect(PRIVACY_TEXT).toHaveLength(0);
    expect(TERMS_TEXT).toHaveLength(0);
    render(<PrivacyPage />);
    expect(screen.getByText(/not yet published here/i)).toBeInTheDocument();
  });
});
```

In `SiteFooter.test.tsx` add: `it('links no legal page while its slot is empty', () => { render(<SiteFooter />); expect(screen.queryByRole('link', { name: /privacy/i })).not.toBeInTheDocument(); expect(screen.queryByRole('link', { name: /terms/i })).not.toBeInTheDocument(); });`

- [ ] **Step 2: Run to verify failure** — `npm test -- LegalPage SiteFooter` → FAIL.

- [ ] **Step 3: Config** — append to `src/config.ts`:

```ts
/**
 * Legal pages. Owner slots, following the CUSTOMER_LOGOS pattern: each page exists as a
 * route, but its document renders only when the text is supplied here, and the footer
 * links it only then. Never paste a template; the in-app policy (case-app, dated
 * 2026-05-12) should be revised to cover model training, subprocessors, and the BAA
 * before it is published here, so that the site's no-training claim links to a document
 * that says it.
 */
export interface LegalSection { heading: string; paragraphs: ReadonlyArray<string> }
export const PRIVACY_TEXT: ReadonlyArray<LegalSection> = [];
export const TERMS_TEXT: ReadonlyArray<LegalSection> = [];
export const PRIVACY_URL = '/privacy/';
export const TERMS_URL = '/terms/';
```

- [ ] **Step 4: `src/pages/LegalPage.tsx`**

```tsx
import { PageShell } from './PageShell';
import { PageHero } from './PageHero';
import { CONTACT_EMAIL, type LegalSection } from '../config';
import './LegalPage.css';

interface Props { title: string; eyebrow: string; sections: ReadonlyArray<LegalSection> }

/**
 * A legal document from an owner slot. An empty slot is stated as what it is — not
 * published here yet — with the address that answers in the meantime. No template text.
 */
export function LegalPage({ title, eyebrow, sections }: Props) {
  return (
    <PageShell>
      <PageHero eyebrow={eyebrow} title={title} />
      <div className="al-container al-legal">
        {sections.length === 0 ? (
          <p className="al-legal__unpublished">
            This document is not yet published here. Ask for the current version at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we will send it.
          </p>
        ) : (
          sections.map((s) => (
            <section key={s.heading} className="al-legal__section" aria-labelledby={`legal-${s.heading.replace(/\W+/g, '-').toLowerCase()}`}>
              <h2 id={`legal-${s.heading.replace(/\W+/g, '-').toLowerCase()}`}>{s.heading}</h2>
              {s.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            </section>
          ))
        )}
      </div>
    </PageShell>
  );
}
```

`LegalPage.css`:

```css
.al-legal { padding-bottom: var(--al-space-8); max-width: none; }
.al-legal__unpublished { font-size: var(--al-text-body-lg); color: var(--al-ink-muted); max-width: 62ch; margin: 0; }
.al-legal__section { max-width: 72ch; margin-bottom: var(--al-space-6); }
.al-legal__section h2 { font-size: var(--al-text-h3); margin: 0 0 var(--al-space-2); }
.al-legal__section p { margin: 0 0 var(--al-space-3); line-height: var(--al-leading-normal); color: var(--al-ink); }
```

`src/pages/privacy/PrivacyPage.tsx`: `export function PrivacyPage() { return <LegalPage title="Privacy policy" eyebrow="Legal" sections={PRIVACY_TEXT} />; }`; `terms/TermsPage.tsx` likewise with `TERMS_TEXT` and title "Terms of service". Each `main.tsx` mirrors `src/pages/about/main.tsx`. Each `index.html` mirrors `about/index.html` with title "Privacy policy — Autolaw" / "Terms of service — Autolaw", description "Autolaw’s privacy policy." / "Autolaw’s terms of service.", canonical and og:url for `/privacy/` and `/terms/`, and `<meta name="robots" content="noindex" />` **while the slot is empty** — leave a comment to remove it when the text lands. Add both to `vite.config.ts` `input` (`privacy: path.resolve(__dirname, 'privacy/index.html')`, `terms: …`), to `public/sitemap.xml` (no — leave the sitemap at four pages until the documents are published; add a comment in the sitemap? XML comments are fine: `<!-- /privacy/ and /terms/ are added when their documents are published -->`).

- [ ] **Step 5: Footer and Trust** — `SiteFooter.tsx`: `const LEGAL = [PRIVACY_TEXT.length ? { href: PRIVACY_URL, label: 'Privacy' } : null, TERMS_TEXT.length ? { href: TERMS_URL, label: 'Terms' } : null].filter(Boolean)`; render after Contact. `Trust.tsx`: the "Your data does not train models" card's body gains, only when `PRIVACY_TEXT.length > 0`, a trailing `<a href={PRIVACY_URL}>Privacy policy</a>` — render the card `body` then the link conditionally (change `CONTROLS[0]` rendering so `p` can carry the link; keep the other cards as they are).

- [ ] **Step 6: Tests that enumerate pages** — `credibility.test.tsx` entries list gains `'privacy/index.html'`, `'terms/index.html'`; `claims.test.tsx` PAGES gains `['privacy', PrivacyPage]`, `['terms', TermsPage]`; `pages.test.tsx` PAGES gains both. The credibility "favicon on every page" test covers them automatically. Run `npm test` → green; `npm run build` shows six HTML entries.

- [ ] **Step 7: Commit** — `git add -A && git commit -m "Add the privacy and terms routes as owner slots that say when they are unpublished"`

---

### Task 8: Security page additions

**Files:**
- Modify: `src/pages/security/SecurityPage.tsx`, `src/pages/security/__tests__/SecurityPage.test.tsx`

- [ ] **Step 1: Write the failing tests** — add to the security test file:

```tsx
  it('states retention as the in-app policy states it, and nothing more specific', () => {
    render(<SecurityPage />);
    const data = within(screen.getByRole('region', { name: /what we do with your case data/i }));
    expect(data.getByRole('heading', { name: /retention/i })).toBeInTheDocument();
    expect(data.getByText(/deleted within 90 days of an account ending/i)).toBeInTheDocument();
  });

  it('lists the seven citation kinds as the form grounding takes', () => {
    render(<SecurityPage />);
    const limits = within(screen.getByRole('region', { name: /what the model is not allowed to do/i }));
    CITATION_KINDS.forEach((k) => expect(limits.getByText(k)).toBeInTheDocument());
  });
```

(import `CITATION_KINDS` from `../../../data/demoCase`.) Then, in `UNVERIFIED`, **delete** the two lines `['retention or deletion windows', …]` and `['a time-bound promise', …]`, with a comment above the array: "retention and the 90-day window were removed on 2026-09-03: the in-app privacy policy §6 states them, so they are now on the verified list."

- [ ] **Step 2: Run to verify failure** — `npm test -- SecurityPage` → FAIL.

- [ ] **Step 3: Edit `SecurityPage.tsx`** — `DATA` gains a third card:

```ts
  {
    title: 'Retention',
    body: 'Case data is kept while the account is active and deleted within 90 days of an account ending, or earlier on request. That is what the privacy policy states, and it is all it states.',
  },
```

(`.al-secp__grid` is two columns; three cards give 2+1. Add the `al-secp__grid--three` class to that grid.) In the "Model limits" section, after `LIMITS`, add:

```tsx
        <div className="al-secp__kinds">
          <p>Grounding takes one of seven concrete forms. Every citation the assistant gives is one of these, and each opens the source:</p>
          <ul>
            {CITATION_KINDS.map((k) => <li key={k}>{k}</li>)}
          </ul>
        </div>
```

with CSS in `SecurityPage.css`: `.al-secp__kinds { margin-top: var(--al-space-4); color: var(--al-ink-inverse-muted); font-size: var(--al-text-sm); } .al-secp__kinds ul { display: flex; flex-wrap: wrap; gap: var(--al-space-2); list-style: none; margin: var(--al-space-2) 0 0; padding: 0; } .al-secp__kinds li { border: 1px solid var(--al-hairline-inverse); border-radius: var(--al-radius-pill); padding: 4px 10px; color: var(--al-ink-inverse); font-size: var(--al-text-xs); }`. Update `security/index.html`'s description to mention retention in one clause.

- [ ] **Step 4: Run** — `npm test` → green (the claims guard: "90 days" is not a retired phrase; the security vocabulary guard passes now that its two lines are gone).

- [ ] **Step 5: Commit** — `git add -A && git commit -m "Security: state retention as the policy states it, and name the seven citation kinds"`

---

### Task 9: Self-hosted fonts and a single-origin CSP

**Files:**
- Create: `scripts/fetch-fonts.mjs`, `public/fonts/*.woff2` (fetched), `src/styles/fonts.css`
- Modify: `src/styles/base.css` (import), all six HTML entries (remove the three Google `<link>`s), `nginx.conf` (CSP), `src/__tests__/credibility.test.tsx` (third-party guard)

- [ ] **Step 1: Write the failing test** — in `credibility.test.tsx`:

```ts
  it('loads no stylesheet, font, or script from a third-party origin', () => {
    const offenders = htmlEntries().filter((f) => /https?:\/\/(fonts\.googleapis|fonts\.gstatic|cdn\.|unpkg|jsdelivr)/i.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
    for (const face of ['manrope-400', 'manrope-500', 'manrope-600', 'manrope-700', 'source-serif-4-400', 'source-serif-4-600', 'source-serif-4-400-italic']) {
      expect(existsSync(join(ROOT, 'public/fonts', `${face}.woff2`)), `${face}.woff2 missing`).toBe(true);
    }
  });
```

- [ ] **Step 2: Run to verify failure** — `npm test -- credibility` → FAIL.

- [ ] **Step 3: `scripts/fetch-fonts.mjs`** — fetches Google's CSS with a modern UA (so it returns `woff2`), keeps the `latin` `unicode-range` block per face, downloads each file under the names above, and prints the `@font-face` blocks to paste. Run it once; commit the resulting `.woff2` files (they are OFL-licensed; add `public/fonts/LICENSE.txt` with the OFL notice and the two family names).

```js
// scripts/fetch-fonts.mjs — run once: node scripts/fetch-fonts.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const FACES = [
  { name: 'manrope-400', family: 'Manrope', css: 'family=Manrope:wght@400', weight: 400, style: 'normal' },
  { name: 'manrope-500', family: 'Manrope', css: 'family=Manrope:wght@500', weight: 500, style: 'normal' },
  { name: 'manrope-600', family: 'Manrope', css: 'family=Manrope:wght@600', weight: 600, style: 'normal' },
  { name: 'manrope-700', family: 'Manrope', css: 'family=Manrope:wght@700', weight: 700, style: 'normal' },
  { name: 'source-serif-4-400', family: 'Source Serif 4', css: 'family=Source+Serif+4:opsz,wght@8..60,400', weight: 400, style: 'normal' },
  { name: 'source-serif-4-600', family: 'Source Serif 4', css: 'family=Source+Serif+4:opsz,wght@8..60,600', weight: 600, style: 'normal' },
  { name: 'source-serif-4-400-italic', family: 'Source Serif 4', css: 'family=Source+Serif+4:ital,opsz,wght@1,8..60,400', weight: 400, style: 'italic' },
];
mkdirSync('public/fonts', { recursive: true });
for (const f of FACES) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?${f.css}&display=swap`, { headers: { 'User-Agent': UA } })).text();
  // The latin block is the one whose comment reads "/* latin */"; take its url().
  const block = css.split('/* latin */').pop();
  const url = block?.match(/url\((https:[^)]+\.woff2)\)/)?.[1];
  if (!url) throw new Error(`no latin woff2 for ${f.name}`);
  const bytes = Buffer.from(await (await fetch(url)).arrayBuffer());
  writeFileSync(`public/fonts/${f.name}.woff2`, bytes);
  console.log(`${f.name}.woff2 ${bytes.length} bytes`);
}
```

- [ ] **Step 4: `src/styles/fonts.css`**

```css
/* Self-hosted so no page loads anything from a third-party origin. Latin subset only. */
@font-face { font-family: "Manrope"; font-style: normal; font-weight: 400; font-display: swap; src: url("/fonts/manrope-400.woff2") format("woff2"); }
@font-face { font-family: "Manrope"; font-style: normal; font-weight: 500; font-display: swap; src: url("/fonts/manrope-500.woff2") format("woff2"); }
@font-face { font-family: "Manrope"; font-style: normal; font-weight: 600; font-display: swap; src: url("/fonts/manrope-600.woff2") format("woff2"); }
@font-face { font-family: "Manrope"; font-style: normal; font-weight: 700; font-display: swap; src: url("/fonts/manrope-700.woff2") format("woff2"); }
@font-face { font-family: "Source Serif 4"; font-style: normal; font-weight: 400; font-display: swap; src: url("/fonts/source-serif-4-400.woff2") format("woff2"); }
@font-face { font-family: "Source Serif 4"; font-style: normal; font-weight: 600; font-display: swap; src: url("/fonts/source-serif-4-600.woff2") format("woff2"); }
@font-face { font-family: "Source Serif 4"; font-style: italic; font-weight: 400; font-display: swap; src: url("/fonts/source-serif-4-400-italic.woff2") format("woff2"); }
```

`base.css`: add `@import './fonts.css';` after the tokens import. Remove the two `preconnect` links and the Google stylesheet `<link>` from all six HTML entries; add `<link rel="preload" href="/fonts/manrope-400.woff2" as="font" type="font/woff2" crossorigin />` and the same for `manrope-700` to each. `nginx.conf` CSP: `style-src 'self' 'unsafe-inline'; font-src 'self';` (drop both Google hosts), and add `location /fonts/ { expires 1y; try_files $uri =404; }`.

- [ ] **Step 5: Run** — `npm test`, `npm run build`. Then the Docker check from the correction release: build the image, curl `/fonts/manrope-400.woff2` → 200 `font/woff2`, and load the home page in the Browser pane with the container's CSP: no console errors, `document.fonts.check('600 16px Manrope')` is true.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "Self-host Manrope and Source Serif 4; the CSP now admits only this origin"`

---

### Task 10: Share card

**Files:**
- Create: `design-system/og-card.html` (template), `public/og-card.png` (rendered by the controller in the Browser pane at exactly 1200×630)
- Modify: all six HTML entries (`og:image`, `og:image:alt`, `twitter:card` → `summary_large_image`), `src/__tests__/credibility.test.tsx`

- [ ] **Step 1: Write the failing test** — in `credibility.test.tsx`:

```ts
  it('claims a large share image only when the file exists', () => {
    const png = existsSync(join(ROOT, 'public/og-card.png'));
    for (const f of htmlEntries()) {
      const html = readFileSync(f, 'utf8');
      const large = /twitter:card"\s+content="summary_large_image"/.test(html);
      const image = /property="og:image"\s+content="https:\/\/www\.autolaw\.ai\/og-card\.png"/.test(html);
      const alt = /property="og:image:alt"/.test(html);
      expect(large && image && alt, `${f} share tags`).toBe(png);
    }
    expect(png).toBe(true);
  });
```

- [ ] **Step 2: Template** — `design-system/og-card.html`: a 1200×630 navy card, off-white wordmark "Autolaw" top-left, headline "Know where every fact came from." in Manrope 700 at 72px, one line beneath in Manrope 500 at 30px muted: "Source-linked case intelligence for personal injury and workers’ compensation firms", and a simplified three-tile signal strip bottom-right (3 · Missing records, 2 · Conflicting facts, 41 · Confirmed facts) using the token colours; fonts via the self-hosted `@font-face` with relative paths `../public/fonts/…`. The controller opens it in the Browser pane at 1200×630, screenshots at scale 1, and writes `public/og-card.png`; the implementer writes the template and the meta tags, then stops and reports `NEEDS_CONTEXT: og-card.png` so the controller renders the file before the test can pass.

- [ ] **Step 3: Meta** — each entry: `<meta property="og:image" content="https://www.autolaw.ai/og-card.png" />`, `<meta property="og:image:alt" content="Autolaw — Know where every fact came from. Source-linked case intelligence for personal injury and workers’ compensation firms." />`, `<meta name="twitter:card" content="summary_large_image" />`, and delete the long comment in `index.html` that explained why it was `summary` (replace with one line: "og-card.png exists; see the credibility guard").

- [ ] **Step 4: Run** — once the PNG exists, `npm test` → green.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "Add the share card and switch every page to a large share image"`

---

### Task 11: ESLint

**Files:**
- Create: `eslint.config.js`
- Modify: `package.json` (devDependencies, `lint` script, `test` → `npm run lint && vitest run`), any source the linter flags

- [ ] **Step 1: Install** — `npm install --save-dev eslint@^9 @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-jsx-a11y globals`

- [ ] **Step 2: `eslint.config.js`**

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['build/**', 'node_modules/**', 'design-system/dist/**', 'server/**', 'shared/**', '.superpowers/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    languageOptions: { globals: { ...globals.browser } },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  { files: ['**/*.test.{ts,tsx}', 'src/test-utils/**'], languageOptions: { globals: { ...globals.node } } },
  { files: ['scripts/**', 'design-system/build.mjs', 'vite.config.ts', 'vitest.config.ts'], languageOptions: { globals: { ...globals.node } } },
);
```

- [ ] **Step 3: Scripts** — `"lint": "eslint ."`, `"test": "npm run lint && vitest run"`. Run `npm run lint`; fix every finding in source (expected: a few `jsx-a11y` notes on the SVG `rect` buttons — add `aria-label` is present; `no-static-element-interactions` on the tablist `div`s with `onKeyDown` — those carry `role="tablist"`, which the rule accepts; anything else, fix or, if the rule is wrong for the case, disable it on that line with a one-line reason).

- [ ] **Step 4: Run** — `npm test` (now lint + vitest) → green. `npx tsc --noEmit -p tsconfig.json` → clean.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "Add ESLint with react-hooks and jsx-a11y; lint runs with the tests"`

---

### Task 12: Verification, spec reconciliation, and the whole-branch review

- [ ] **Step 1: Full verification** — `npm test && npx tsc --noEmit -p tsconfig.json && npm run build && npm run ds`. Docker: build, run, curl `/`, `/privacy/`, `/fonts/manrope-400.woff2`, `/og-card.png` → 200s; CSP header has no Google hosts.

- [ ] **Step 2: Browser pass** — 1280×900: story → Ask AL (click each question, open a chip) → Solutions (both practices, every tab, the figure's regions by mouse and arrow keys) → Trust → closing (switch practice, follow the button to the call page and see the radio preselected). 375×812: everything stacks, no horizontal overflow. Console clean. `document.fonts.check` true for both families.

- [ ] **Step 3: Spec** — in `2026-09-02-autolaw-site-refresh-design.md`: mark "Plan shape" item 2 implemented in this plan; note deviation 1 (`ASK_AL_ENABLED` hides the section only); note that the sitemap gains the legal pages only when their documents are published.

- [ ] **Step 4: Whole-branch review** — `superpowers:requesting-code-review` on `85bf1dc..HEAD`, most capable model; one fix wave; one scoped re-review.

- [ ] **Step 5: Finish** — `superpowers:finishing-a-development-branch`.

---

## Self-review against the spec

| Spec item | Task |
|---|---|
| Ask AL section: three questions, answers, chips with the seven kinds, citation card, refusal, closing line | 1, 3 |
| `ASK_AL_ENABLED` | 3 (deviation 1 recorded) |
| Solutions: segmented control, PI tabs with evidence tiers and wage lines, WC tabs with figure and readiness/missing cards, "workflows" wording | 1, 5 |
| Silhouette: one outline, eight regions, leader labels, status in accessible name, arrow keys, 24px targets | 1, 4 |
| Lifted practice state, `sessionStorage`, closing section per practice, toggle, `?practice=` | 2, 6 |
| `/privacy/`, `/terms/` slots; footer and Trust links only when filled | 7 |
| Security: Retention card, citation kinds | 8 (deviation 2 recorded) |
| Self-hosted fonts, CSP single-origin, third-party guard | 9 |
| Share card, `summary_large_image` in order | 10 |
| ESLint react-hooks + jsx-a11y in `npm test` | 11 |
| 12px floor for new panels | 3, 4, 5 (prefix list) |
| Tests listed in the spec under Ask AL, Solutions/conversion, Silhouette, Schedule a call, Guards | 3, 5, 6, 4, 7/9/10 |

Not in this plan, per the spec: real screenshots, video, logos, blog, pricing, deleting `server/`, the Ask AL roadmap, refreshing the design-system previews (recommended by the plan-1 review; a follow-up).

**Type consistency:** `Practice` (Task 2) used by Tasks 5, 6; `PanelTab`, `PI_PANEL`, `WC_PANEL`, `ASK_AL_QA`, `Citation`, `PRACTICE_CLOSING` (Task 1) used by Tasks 3, 5, 6; `SIL_ORDER`/`HITS` exported for the Task 4 test; `LegalSection`, `PRIVACY_TEXT`, `TERMS_TEXT`, `PRIVACY_URL`, `TERMS_URL` (Task 7) used by footer, Trust, pages; `practiceFromSearch` (Task 6) used by its test.
