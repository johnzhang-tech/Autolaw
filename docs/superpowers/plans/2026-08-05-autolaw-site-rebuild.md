# Autolaw.ai Site Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-file `src/App.tsx` marketing page with a six-section site built against the Autolaw design system, so the product's real differentiators — source-linked citations, surfaced conflicts, human confirmation, and PI/WC isolation — are demonstrated rather than asserted.

**Architecture:** Plain CSS driven by design tokens, one stylesheet co-located per section component. No CSS framework. Demo case data is centralized in one obviously-fictional module. Four interactive visualizations are React components with full keyboard support and reduced-motion parity.

**Tech Stack:** React 18, Vite 6, TypeScript, Vitest + @testing-library/react, plain CSS with custom properties. Deployed as a static Nginx image on Cloud Run (unchanged).

---

## READ THIS BEFORE TASK 1 — two traps

**1. Tailwind is not installed.** `src/index.css` is 29,674 bytes of *pre-compiled* Tailwind v4 output shipped by the Figma Make export. `package.json` contains `tailwind-merge`, not `tailwindcss`. There is no Tailwind build step.

> **Consequence:** a utility class you write in JSX will silently do nothing unless that exact class already appears in the compiled file. Do not write Tailwind classes in new components. This plan uses plain CSS with the design tokens, which also matches the published design system previews exactly and lets us delete the 29KB file.

**2. Do not invent trust assets.** The logo wall, SOC 2 badge, and HIPAA badge render **nothing** until real files exist at the paths in Task 12. No placeholder logo, no sample firm name, no stock image. Task 3 adds a test that fails the build if a placeholder ever reappears.

**Design system reference:** `design-system/previews/*.html` are the authoritative visual source. Their CSS lifts directly into the component stylesheets. Run `node design-system/build.mjs` to view them built.

---

## File Structure

**Created:**

| Path | Responsibility |
|---|---|
| `src/styles/tokens.css` | Design tokens, copied from `design-system/tokens.css` |
| `src/styles/base.css` | Reset, page defaults, focus ring, `.container`, `.section` |
| `src/data/demoCase.ts` | All fictional demo case data, single source |
| `src/components/primitives/Button.tsx` + `.css` | Button and link-button variants |
| `src/components/primitives/Chip.tsx` + `.css` | Signal state chips |
| `src/components/primitives/Section.tsx` + `.css` | Section wrapper, eyebrow, heading |
| `src/components/SiteNav.tsx` + `.css` | Header nav |
| `src/components/SiteFooter.tsx` + `.css` | Footer |
| `src/sections/Hero.tsx` + `.css` | Section 1 |
| `src/sections/SignalCockpit.tsx` + `.css` | Visualization 1, used by Hero |
| `src/sections/Transformation.tsx` + `.css` | Section 2 |
| `src/sections/ProductExperience.tsx` + `.css` | Section 3 wrapper |
| `src/sections/Chronology.tsx` + `.css` | Visualization 2 |
| `src/sections/BodyExplorer.tsx` + `.css` | Visualization 3 |
| `src/sections/PracticeSolutions.tsx` + `.css` | Section 4, Visualization 4 |
| `src/sections/Trust.tsx` + `.css` | Section 5 |
| `src/sections/Conversion.tsx` + `.css` | Section 6 |
| `src/config.ts` | URLs and feature flags in one place |
| `src/__tests__/credibility.test.tsx` | Guard tests against placeholder regressions |
| `vitest.config.ts` | Test config |

**Modified:** `src/App.tsx` (rewritten as assembly only), `src/main.tsx`, `index.html`, `package.json`.

**Deleted:** `src/index.css`, `src/imports/`, `src/assets/*.png` (Figma logo and agent art), `src/components/figma/`, `src/components/ui/` (48 shadcn files), `components.json`, `src/styles/globals.css`, `src/codelayer/`, `src/codelayer-2/`.

> `src/components/ui/` is deleted deliberately. Those 48 shadcn components are styled entirely with Tailwind utility classes and cannot render correctly without a Tailwind build — see the trap above. Leaving them in place would invite a future engineer to import one and spend an afternoon on why it renders unstyled. If shadcn is wanted later, install Tailwind properly and re-add them then.

---

## Task 1: Test infrastructure

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`, `src/test-setup.ts`

- [ ] **Step 1: Install test dependencies**

```bash
npm install --save-dev vitest@^3 @testing-library/react@^16 @testing-library/user-event@^14 @testing-library/jest-dom@^6 jsdom@^25
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    css: true,
  },
});
```

- [ ] **Step 3: Create `src/test-setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Add scripts to `package.json`**

Add to the `scripts` object:

```json
"test": "vitest run",
"test:watch": "vitest",
"ds": "node design-system/build.mjs"
```

- [ ] **Step 5: Verify the runner starts**

Run: `npm test`
Expected: exits 0 with "No test files found" — the runner works, nothing to run yet.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/test-setup.ts
git commit -m "test: add vitest and testing-library"
```

---

## Task 2: Design tokens and base styles in the app

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/base.css`
- Modify: `src/main.tsx`

- [ ] **Step 1: Copy tokens into the app**

```bash
cp design-system/tokens.css src/styles/tokens.css
```

The design system remains the source of truth. When `design-system/tokens.css` changes, re-run this copy. Task 3 adds a test that fails if the two files drift.

- [ ] **Step 2: Create `src/styles/base.css`**

```css
@import './tokens.css';

*, *::before, *::after { box-sizing: border-box; }

html { -webkit-text-size-adjust: 100%; }

body {
  margin: 0;
  background: var(--al-canvas);
  color: var(--al-ink);
  font-family: var(--al-font-ui);
  font-size: var(--al-text-body);
  line-height: var(--al-leading-normal);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

img, svg { max-width: 100%; display: block; }
button { font: inherit; color: inherit; }

:focus-visible {
  outline: none;
  box-shadow: var(--al-focus-ring);
  border-radius: var(--al-radius-sm);
}

.al-on-navy :focus-visible { box-shadow: var(--al-focus-ring-inverse); }

.al-container {
  width: 100%;
  max-width: var(--al-max-width);
  margin: 0 auto;
  padding-inline: var(--al-gutter);
}

.al-section { padding-block: var(--al-space-8); }
@media (max-width: 768px) { .al-section { padding-block: var(--al-space-6); } }

.al-skip {
  position: absolute;
  left: -9999px;
  top: var(--al-space-2);
  background: var(--al-navy);
  color: #fff;
  padding: var(--al-space-2) var(--al-space-3);
  border-radius: var(--al-radius-sm);
  z-index: 100;
}
.al-skip:focus { left: var(--al-space-3); }

.al-visually-hidden {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
```

- [ ] **Step 3: Point `src/main.tsx` at the new stylesheet**

```tsx
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/base.css";

createRoot(document.getElementById("root")!).render(<App />);
```

- [ ] **Step 4: Verify the app still builds**

Run: `npm run build`
Expected: build succeeds. The page will look unstyled — `App.tsx` still uses Tailwind classes that no longer have a stylesheet. That is expected and is fixed by Task 13.

- [ ] **Step 5: Commit**

```bash
git add src/styles/tokens.css src/styles/base.css src/main.tsx
git commit -m "feat: adopt design tokens and base styles"
```

---

## Task 3: Credibility guard tests

These encode *why* the redesign happened, so a future edit cannot quietly undo it.

**Files:**
- Create: `src/__tests__/credibility.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git' || entry === 'dist' || entry === 'build') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const SRC = join(process.cwd(), 'src');
const sourceFiles = () =>
  walk(SRC).filter((f) => /\.(tsx?|css|html)$/.test(f));

describe('credibility guards', () => {
  it('ships no placeholder customer logos', () => {
    const offenders = sourceFiles().filter((f) =>
      /logoipsum/i.test(readFileSync(f, 'utf8'))
    );
    expect(offenders).toEqual([]);
  });

  it('ships no test or example contact address', () => {
    const offenders = sourceFiles().filter((f) =>
      /(test|example|placeholder)@autolaw\.ai/i.test(readFileSync(f, 'utf8'))
    );
    expect(offenders).toEqual([]);
  });

  it('ships no stock photography or external image hosts', () => {
    const offenders = sourceFiles().filter((f) =>
      /(unsplash\.com|pexels\.com|shutterstock)/i.test(readFileSync(f, 'utf8'))
    );
    expect(offenders).toEqual([]);
  });

  it('exposes no raw Cloud Run hostname to visitors', () => {
    const offenders = sourceFiles().filter((f) =>
      /[a-z-]+-\d{10,}\.[a-z0-9-]+\.run\.app/i.test(readFileSync(f, 'utf8'))
    );
    expect(offenders).toEqual([]);
  });

  it('keeps app tokens identical to the design system source', () => {
    const ds = readFileSync(join(process.cwd(), 'design-system/tokens.css'), 'utf8');
    const app = readFileSync(join(SRC, 'styles/tokens.css'), 'utf8');
    expect(app).toBe(ds);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL. Four of the five report offenders — `src/App.tsx` still contains `Logoipsum` alt text, `test@autolaw.ai`, an `unsplash.com` URL, and the `case-app-1055716306475.us-central1.run.app` login host. The tokens test should already pass.

- [ ] **Step 3: Do not fix them yet**

These stay red until Task 13 deletes the old page. That is intentional — they are the definition of done for this rebuild. Note the failure count so you can confirm it reaches zero.

- [ ] **Step 4: Commit**

```bash
git add src/__tests__/credibility.test.tsx
git commit -m "test: add credibility guards (currently failing by design)"
```

---

## Task 4: Config and demo case data

**Files:**
- Create: `src/config.ts`, `src/data/demoCase.ts`

- [ ] **Step 1: Create `src/config.ts`**

```ts
/**
 * Every outbound URL and gated asset in one place.
 *
 * APP_ORIGIN must be the canonical app host. It is deliberately NOT a raw Cloud Run
 * URL — src/__tests__/credibility.test.tsx fails the build if one appears in src/.
 * See docs/superpowers/specs/2026-08-05-autolaw-site-redesign-design.md, "Launch
 * dependencies": app.autolaw.ai needs a DNS record and Cloud Run domain mapping, and
 * NEXT_PUBLIC_APP_URL / CASE_APP_BASE_URL in case-app must name the same host.
 */
export const APP_ORIGIN = 'https://app.autolaw.ai';

export const LOGIN_URL = `${APP_ORIGIN}/login`;

/** Requires TRIAL_SIGNUP_ENABLED=true on the case-app service, or this 404s. */
export const TRIAL_URL = `${APP_ORIGIN}/trial`;

export const CONTACT_EMAIL = 'hello@autolaw.ai';

/**
 * Assets that must not be faked. Each renders nothing until a real file exists.
 * Populate only with permissioned artwork.
 */
export const CUSTOMER_LOGOS: ReadonlyArray<{ name: string; src: string }> = [];

/** `mark` is the short text inside the badge disc — never derive it by splitting `label`. */
export const CERTIFICATIONS: ReadonlyArray<{ mark: string; label: string; detail: string }> = [
  { mark: 'SOC 2', label: 'SOC 2 Type II', detail: 'Report available under NDA' },
  { mark: 'HIPAA', label: 'HIPAA attested', detail: 'BAA available' },
];

/** Set to a real URL to reveal the secondary hero CTA. */
export const WALKTHROUGH_URL: string | null = null;
```

- [ ] **Step 2: Create `src/data/demoCase.ts`**

```ts
/**
 * Fictional demonstration data. Contains no real client information.
 * Never replace with content derived from an actual matter.
 */

export type SignalTone = 'verified' | 'conflict' | 'neutral';

export interface Signal {
  count: number;
  label: string;
  tone: SignalTone;
}

export const CASE_SUMMARY = {
  title: 'Demo case — lumbar & left shoulder',
  meta: "Workers' compensation · 214 documents · 1,880 pages",
};

export const SIGNALS: Signal[] = [
  { count: 3, label: 'Missing records', tone: 'conflict' },
  { count: 2, label: 'Conflicting facts', tone: 'conflict' },
  { count: 1, label: 'Treatment gap', tone: 'conflict' },
  { count: 41, label: 'Verified facts', tone: 'verified' },
  { count: 6, label: 'Work restrictions', tone: 'verified' },
  { count: 4, label: 'Next actions', tone: 'neutral' },
];

export interface ChronologyEvent {
  date: string;
  title: string;
  provider: string;
  tone: SignalTone;
  flag?: string;
  source: string;
  page: string;
  /** [before, highlighted, after] — the highlighted span is the cited sentence. */
  quote?: [string, string, string];
  meta: Array<[string, string]>;
  /** null when the fact is unresolved or the document is absent. */
  confidence: number | null;
  warning?: { title: string; body: string };
  action: string;
}

export const CHRONOLOGY: ChronologyEvent[] = [
  {
    date: '2025-01-18',
    title: 'Date of injury — lifting incident',
    provider: 'Employer incident report',
    tone: 'verified',
    source: 'Employer incident report',
    page: 'page 1',
    quote: [
      'Employee states he felt a sharp pull in the low back while ',
      'lifting a container estimated at 60 pounds from floor level',
      '.',
    ],
    meta: [['Reported', '2025-01-18'], ['Body part', 'Lumbar spine'], ['Witness', 'Named on p.2']],
    confidence: 97,
    action: 'Open page 1',
  },
  {
    date: '2025-01-22',
    title: 'Initial evaluation — PTP',
    provider: 'Dr. L. Okafor · occupational medicine',
    tone: 'verified',
    source: 'PTP report — Dr. L. Okafor',
    page: 'page 2',
    quote: [
      'Examination reveals paraspinal tenderness and reduced lumbar flexion. ',
      'Assessment: lumbar strain with radicular symptoms into the left lower extremity',
      '.',
    ],
    meta: [['Provider', 'L. Okafor, DO'], ['Diagnosis', 'Lumbar strain, radiculopathy'], ['Date of service', '2025-01-22']],
    confidence: 92,
    action: 'Open page 2',
  },
  {
    date: '2025-03-14',
    title: 'MRI lumbar spine',
    provider: 'Valley Imaging',
    tone: 'conflict',
    flag: 'Referenced but not produced',
    source: 'Not in the record',
    page: '—',
    meta: [['Referenced by', 'QME p.14, PTP p.5'], ['Facility', 'Valley Imaging'], ['Status', 'Not produced']],
    confidence: null,
    warning: {
      title: 'Referenced but never produced.',
      body: 'Two documents cite an MRI dated 03/14. No imaging report exists in the file. Autolaw flags the gap and drafts the records request rather than inferring the findings.',
    },
    action: 'Draft records request',
  },
  {
    date: '2025-04-02',
    title: 'Released to modified duty',
    provider: 'PTP report',
    tone: 'neutral',
    flag: 'Conflicts with QME',
    source: 'PTP report — Dr. L. Okafor',
    page: 'page 3',
    quote: ['Patient ', 'may return to modified duty with no lifting over 15 pounds', ' effective 04/02.'],
    meta: [['Work status', 'Modified duty'], ['Restriction', 'No lifting > 15 lb'], ['Date of service', '2025-04-02']],
    confidence: null,
    warning: {
      title: 'Unresolved conflict.',
      body: 'The QME dated 04/18 states the claimant remains temporarily totally disabled. Both sources stay visible with their dates. Autolaw does not pick a winner — an attorney resolves it.',
    },
    action: 'Compare sources',
  },
  {
    date: '2025-04-18',
    title: 'QME evaluation',
    provider: 'Dr. A. Reyes · orthopedic surgery',
    tone: 'verified',
    source: 'QME report — Dr. A. Reyes',
    page: 'page 14',
    quote: [
      'Claimant reports persistent low back pain radiating into the left lower extremity. ',
      'MRI dated 03/14 demonstrates a 4mm disc protrusion at L4–L5 with mild foraminal narrowing',
      '.',
    ],
    meta: [['Provider', 'A. Reyes, MD'], ['Finding', 'Disc protrusion, L4–L5'], ['Date of service', '2025-04-18']],
    confidence: 94,
    action: 'Open page 14',
  },
];

export interface BodyRegion {
  key: string;
  label: string;
  claimed: boolean;
  plain: string;
  rows: Array<{ label: string; value: string; cite: string; warn: boolean }>;
}

export const BODY_REGIONS: BodyRegion[] = [
  {
    key: 'lumbar',
    label: 'Lumbar spine',
    claimed: true,
    plain: 'A disc in the low back is pressing on a nerve, which is why pain travels down the left leg.',
    rows: [
      { label: 'Symptoms', value: 'Low back pain radiating into the left lower extremity', cite: 'PTP report p.2', warn: false },
      { label: 'Imaging', value: '4mm disc protrusion at L4–L5, mild foraminal narrowing', cite: 'QME report p.14', warn: false },
      { label: 'Treatment', value: 'Conservative care, 12 physical therapy visits, epidural injection 05/2025', cite: 'Billing summary p.7', warn: false },
      { label: 'Restrictions', value: 'No lifting over 15 lb — disputed by QME', cite: 'PTP p.3 / QME p.22', warn: true },
      { label: 'Missing', value: 'MRI report referenced by two documents, never produced', cite: 'Records request drafted', warn: true },
    ],
  },
  {
    key: 'shoulder',
    label: 'Left shoulder',
    claimed: true,
    plain: 'The rotator cuff is partially torn. Surgery has been recommended but not yet authorized.',
    rows: [
      { label: 'Symptoms', value: 'Pain with overhead reach, night pain, weakness', cite: 'PTP report p.4', warn: false },
      { label: 'Imaging', value: 'Partial-thickness supraspinatus tear', cite: 'MRI report p.1', warn: false },
      { label: 'Treatment', value: 'Injection 06/2025; arthroscopic repair recommended', cite: 'QME report p.18', warn: false },
      { label: 'Authorization', value: 'Utilization review denial 07/2025, IMR appeal pending', cite: 'UR letter p.1', warn: true },
    ],
  },
  {
    key: 'cervical',
    label: 'Cervical spine',
    claimed: false,
    plain: 'Not part of the claim. Autolaw found records referencing it, so the region stays visible rather than hidden.',
    rows: [
      { label: 'Claim status', value: 'Not an accepted body part', cite: 'Claims administrator notice p.2', warn: true },
      { label: 'Prior history', value: 'Treatment in 2019, predates the injury', cite: 'Prior claim records p.11', warn: true },
    ],
  },
  {
    key: 'knee',
    label: 'Right knee',
    claimed: false,
    plain: 'Not part of the claim and no records mention it.',
    rows: [
      { label: 'Claim status', value: 'Not an accepted body part', cite: 'Claims administrator notice p.2', warn: true },
      { label: 'Records', value: 'No documents reference this region', cite: '—', warn: true },
    ],
  },
];

export const PRACTICE_OUTPUTS = {
  PI: {
    heading: 'Built for the demand',
    intro: 'Liability, causation, and damages assembled from the record — every figure traceable to a bill or a report.',
    items: [
      { title: 'Causation chain', detail: 'Mechanism to diagnosis, gaps flagged' },
      { title: 'Treatment gaps', detail: 'Breaks in care, with dates' },
      { title: 'Medical specials', detail: 'Billed vs. paid, reconciled' },
      { title: 'Demand narrative', detail: 'Source-linked, firm-formatted' },
    ],
  },
  WC: {
    heading: 'Built for the claim',
    intro: 'A separate product surface, not PI copy with the words swapped — PI and WC are isolated at the route, navigation, and data layer.',
    items: [
      { title: 'QME/AME vs PTP', detail: 'Where the opinions diverge' },
      { title: 'Work status & restrictions', detail: 'Current and historical' },
      { title: 'MMI / P&S', detail: 'Date and supporting opinion' },
      { title: 'Apportionment', detail: 'Per body part, per source' },
      { title: 'UR / IMR history', detail: 'Denials and appeals' },
      { title: 'Unresolved conflicts', detail: 'Surfaced, never auto-resolved' },
    ],
  },
} as const;

export type PracticeArea = keyof typeof PRACTICE_OUTPUTS;
```

- [ ] **Step 3: Verify it type-checks**

Run: `npx tsc --noEmit --jsx react-jsx --module esnext --moduleResolution bundler --target esnext src/data/demoCase.ts src/config.ts`
Expected: no output (success).

- [ ] **Step 4: Commit**

```bash
git add src/config.ts src/data/demoCase.ts
git commit -m "feat: add site config and fictional demo case data"
```

---

## Task 5: Button and Chip primitives

**Files:**
- Create: `src/components/primitives/Button.tsx`, `Button.css`, `Chip.tsx`, `Chip.css`
- Test: `src/components/primitives/__tests__/primitives.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';
import { Chip } from '../Chip';

describe('Button', () => {
  it('renders an anchor when given href', () => {
    render(<Button href="https://example.com">Analyze one case</Button>);
    const el = screen.getByRole('link', { name: /analyze one case/i });
    expect(el).toHaveAttribute('href', 'https://example.com');
  });

  it('renders a button element when given onClick', () => {
    render(<Button onClick={() => {}}>Go</Button>);
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
  });

  it('applies the variant class', () => {
    render(<Button href="#" variant="inverse">X</Button>);
    expect(screen.getByRole('link')).toHaveClass('al-btn--inverse');
  });
});

describe('Chip', () => {
  it('renders its label and tone', () => {
    render(<Chip tone="conflict">2 sources conflict</Chip>);
    const el = screen.getByText('2 sources conflict');
    expect(el).toHaveClass('al-chip--conflict');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- primitives`
Expected: FAIL — cannot resolve `../Button`.

- [ ] **Step 3: Create `src/components/primitives/Button.tsx`**

```tsx
import type { ReactNode } from 'react';
import './Button.css';

type Variant = 'primary' | 'secondary' | 'ghost' | 'inverse' | 'inverse-secondary';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  size?: Size;
  withCaret?: boolean;
  className?: string;
}

export function Button({
  children, href, onClick, variant = 'primary', size = 'md', withCaret = false, className = '',
}: Props) {
  const cls = `al-btn al-btn--${variant} al-btn--${size} ${className}`.trim();
  const inner = (
    <>
      {children}
      {withCaret && <i className="al-btn__caret" aria-hidden="true" />}
    </>
  );

  if (href) {
    return <a className={cls} href={href}>{inner}</a>;
  }
  return <button type="button" className={cls} onClick={onClick}>{inner}</button>;
}
```

- [ ] **Step 4: Create `src/components/primitives/Button.css`**

Lifted from `design-system/previews/10-buttons.html`.

```css
.al-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--al-space-2);
  font-family: var(--al-font-ui);
  font-weight: var(--al-weight-semibold);
  border-radius: var(--al-radius-pill);
  border: 1px solid transparent;
  cursor: pointer;
  text-decoration: none;
  transition:
    background-color var(--al-duration-fast) var(--al-ease),
    border-color var(--al-duration-fast) var(--al-ease),
    color var(--al-duration-fast) var(--al-ease),
    transform var(--al-duration-fast) var(--al-ease);
}
.al-btn:active { transform: translateY(1px); }

.al-btn--lg { font-size: var(--al-text-body); padding: 14px 26px; }
.al-btn--md { font-size: var(--al-text-sm); padding: 11px 20px; }
.al-btn--sm { font-size: var(--al-text-xs); padding: 8px 14px; }

.al-btn--primary { background: var(--al-navy); color: var(--al-ink-inverse); }
.al-btn--primary:hover { background: #16344f; }

.al-btn--secondary { background: transparent; color: var(--al-ink); border-color: var(--al-hairline-strong); }
.al-btn--secondary:hover { border-color: var(--al-ink); background: rgba(19, 34, 46, 0.03); }

.al-btn--ghost { background: transparent; color: var(--al-teal-text); padding-inline: 8px; }
.al-btn--ghost:hover { background: var(--al-teal-wash); }

.al-btn--inverse { background: var(--al-teal); color: var(--al-navy); }
.al-btn--inverse:hover { background: #1ec0ae; }

.al-btn--inverse-secondary { background: transparent; color: var(--al-ink-inverse); border-color: var(--al-hairline-inverse); }
.al-btn--inverse-secondary:hover { border-color: var(--al-teal); color: var(--al-teal); }

.al-btn__caret {
  width: 6px; height: 6px;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: rotate(-45deg);
  flex: none;
}
```

- [ ] **Step 5: Create `src/components/primitives/Chip.tsx`**

```tsx
import type { ReactNode } from 'react';
import './Chip.css';

type Tone = 'verified' | 'conflict' | 'blocker' | 'unreviewed' | 'uncited';

export function Chip({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`al-chip al-chip--${tone}`}>
      {tone !== 'blocker' && tone !== 'uncited' && <i className="al-chip__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
```

- [ ] **Step 6: Create `src/components/primitives/Chip.css`**

```css
.al-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--al-text-xs);
  font-weight: var(--al-weight-semibold);
  padding: 5px 11px;
  border-radius: var(--al-radius-pill);
  border: 1px solid transparent;
}
.al-chip__dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex: none; }

.al-chip--verified { background: var(--al-teal-wash); color: var(--al-teal-text); border-color: rgba(14, 124, 112, 0.18); }
.al-chip--conflict { background: var(--al-amber-wash); color: var(--al-amber-text); border-color: rgba(154, 78, 39, 0.2); }
.al-chip--blocker { background: var(--al-amber-text); color: #fff; }
.al-chip--unreviewed { background: transparent; color: var(--al-ink-muted); border-color: var(--al-hairline-strong); }
.al-chip--uncited { background: transparent; color: var(--al-amber-text); border-color: var(--al-amber); border-style: dashed; }
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npm test -- primitives`
Expected: PASS, 4 tests.

- [ ] **Step 8: Commit**

```bash
git add src/components/primitives
git commit -m "feat: add Button and Chip primitives"
```

---

## Task 6: Section primitive

**Files:**
- Create: `src/components/primitives/Section.tsx`, `Section.css`

- [ ] **Step 1: Create `src/components/primitives/Section.tsx`**

```tsx
import type { ReactNode } from 'react';
import './Section.css';

interface Props {
  id?: string;
  eyebrow?: string;
  heading?: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
  tone?: 'canvas' | 'navy';
}

export function Section({ id, eyebrow, heading, intro, children, tone = 'canvas' }: Props) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`al-section al-sec al-sec--${tone}${tone === 'navy' ? ' al-on-navy' : ''}`}
    >
      <div className="al-container">
        {eyebrow && <p className="al-sec__eyebrow">{eyebrow}</p>}
        {heading && <h2 id={headingId} className="al-sec__heading">{heading}</h2>}
        {intro && <p className="al-sec__intro">{intro}</p>}
        {children}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `src/components/primitives/Section.css`**

```css
.al-sec--navy { background: var(--al-navy); color: var(--al-ink-inverse); }

.al-sec__eyebrow {
  font-size: var(--al-text-xs);
  font-weight: var(--al-weight-bold);
  letter-spacing: var(--al-tracking-eyebrow);
  text-transform: uppercase;
  color: var(--al-teal-text);
  margin: 0 0 var(--al-space-3);
}
.al-sec--navy .al-sec__eyebrow { color: var(--al-teal); }

.al-sec__heading {
  font-size: var(--al-text-h2);
  font-weight: var(--al-weight-bold);
  line-height: var(--al-leading-snug);
  letter-spacing: var(--al-tracking-display);
  margin: 0 0 var(--al-space-3);
  max-width: 20ch;
  text-wrap: balance;
}

.al-sec__intro {
  font-size: var(--al-text-body-lg);
  line-height: var(--al-leading-normal);
  color: var(--al-ink-muted);
  margin: 0 0 var(--al-space-6);
  max-width: 62ch;
}
.al-sec--navy .al-sec__intro { color: var(--al-ink-inverse-muted); }
```

- [ ] **Step 3: Verify it compiles**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/primitives/Section.tsx src/components/primitives/Section.css
git commit -m "feat: add Section primitive"
```

---

## Task 7: Signal cockpit and hero

**Files:**
- Create: `src/sections/SignalCockpit.tsx`, `SignalCockpit.css`, `src/sections/Hero.tsx`, `Hero.css`
- Test: `src/sections/__tests__/Hero.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from '../Hero';
import { TRIAL_URL } from '../../config';

describe('Hero', () => {
  it('leads with the buyer outcome, not the category', () => {
    render(<Hero />);
    expect(
      screen.getByRole('heading', { level: 1, name: /turn case complexity into legal advantage/i })
    ).toBeInTheDocument();
  });

  it('points the primary CTA at the trial flow', () => {
    render(<Hero />);
    expect(screen.getByRole('link', { name: /analyze one case/i })).toHaveAttribute('href', TRIAL_URL);
  });

  it('gives the cockpit a single descriptive label rather than bare numbers', () => {
    render(<Hero />);
    const fig = screen.getByRole('img', { name: /missing records/i });
    expect(fig).toBeInTheDocument();
  });

  it('omits the walkthrough CTA until a real recording exists', () => {
    render(<Hero />);
    expect(screen.queryByRole('link', { name: /walkthrough/i })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- Hero`
Expected: FAIL — cannot resolve `../Hero`.

- [ ] **Step 3: Create `src/sections/SignalCockpit.tsx`**

```tsx
import { CASE_SUMMARY, SIGNALS } from '../data/demoCase';
import './SignalCockpit.css';

export function SignalCockpit() {
  const label =
    `Case signal cockpit for a demonstration case: ` +
    SIGNALS.map((s) => `${s.count} ${s.label.toLowerCase()}`).join(', ') + '.';

  return (
    <div className="al-cockpit al-on-navy" role="img" aria-label={label}>
      <div className="al-cockpit__top">
        <div>
          <div className="al-cockpit__case">{CASE_SUMMARY.title}</div>
          <div className="al-cockpit__meta">{CASE_SUMMARY.meta}</div>
        </div>
        <span className="al-cockpit__live">
          <i className="al-cockpit__pulse" aria-hidden="true" />
          Live
        </span>
      </div>
      <div className="al-cockpit__tiles">
        {SIGNALS.map((s) => (
          <div key={s.label} className={`al-tile al-tile--${s.tone}`}>
            <div className="al-tile__n">{s.count}</div>
            <div className="al-tile__l">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/sections/SignalCockpit.css`**

```css
.al-cockpit {
  background: var(--al-navy);
  border-radius: var(--al-radius-panel);
  padding: var(--al-space-4);
  box-shadow: var(--al-shadow-card);
}
.al-cockpit__top {
  display: flex; align-items: center; justify-content: space-between;
  gap: var(--al-space-3);
  padding-bottom: var(--al-space-3);
  border-bottom: 1px solid var(--al-hairline-inverse);
  margin-bottom: var(--al-space-3);
}
.al-cockpit__case { color: #fff; font-size: var(--al-text-sm); font-weight: var(--al-weight-semibold); }
.al-cockpit__meta { color: var(--al-ink-inverse-muted); font-size: var(--al-text-xs); margin-top: 2px; }
.al-cockpit__live {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--al-teal); font-weight: var(--al-weight-bold); white-space: nowrap;
}
.al-cockpit__pulse {
  width: 6px; height: 6px; border-radius: 50%; background: var(--al-teal);
  animation: al-pulse 2.4s var(--al-ease) infinite;
}
@keyframes al-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
@media (prefers-reduced-motion: reduce) { .al-cockpit__pulse { animation: none; } }

.al-cockpit__tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--al-space-2); }
@media (max-width: 520px) { .al-cockpit__tiles { grid-template-columns: repeat(2, 1fr); } }

.al-tile {
  background: var(--al-navy-raised);
  border-radius: var(--al-radius-card);
  padding: var(--al-space-3);
  border-left: 3px solid var(--al-state-neutral);
}
.al-tile--verified { border-left-color: var(--al-teal); }
.al-tile--conflict { border-left-color: var(--al-amber); }
.al-tile__n {
  font-size: 1.6rem; font-weight: var(--al-weight-bold); line-height: 1;
  color: #fff; font-variant-numeric: tabular-nums;
}
.al-tile--verified .al-tile__n { color: var(--al-teal); }
.al-tile--conflict .al-tile__n { color: var(--al-amber); }
.al-tile__l { font-size: 11px; color: var(--al-ink-inverse-muted); margin-top: 6px; line-height: 1.35; }
```

- [ ] **Step 5: Create `src/sections/Hero.tsx`**

```tsx
import { Button } from '../components/primitives/Button';
import { SignalCockpit } from './SignalCockpit';
import { TRIAL_URL, WALKTHROUGH_URL } from '../config';
import './Hero.css';

const TRUST = [
  'Source-linked evidence',
  'Human review controls',
  'Auditable access',
  'SOC 2 Type II & HIPAA',
];

function Tick() {
  return (
    <svg className="al-hero__tick" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2 6.5l2.5 2.5L10 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Hero() {
  return (
    <header className="al-section al-hero">
      <div className="al-container al-hero__grid">
        <div>
          <p className="al-hero__eyebrow">
            AI-native case intelligence for personal injury &amp; workers&rsquo; compensation firms
          </p>
          <h1 className="al-hero__title">Turn case complexity into legal advantage.</h1>
          <p className="al-hero__sub">
            Autolaw transforms intake calls, medical records, expert reports, and case files
            into a living, source-linked Case Brain &mdash; helping your team understand the
            case, uncover missing evidence, and prepare stronger work product faster.
          </p>
          <div className="al-hero__ctas">
            <Button href={TRIAL_URL} variant="primary" size="lg" withCaret>
              Analyze one case
            </Button>
            {WALKTHROUGH_URL && (
              <Button href={WALKTHROUGH_URL} variant="secondary" size="lg">
                Watch a 3-minute case walkthrough
              </Button>
            )}
          </div>
          <ul className="al-hero__strip">
            {TRUST.map((t) => (
              <li key={t}><Tick />{t}</li>
            ))}
          </ul>
        </div>
        <SignalCockpit />
      </div>
    </header>
  );
}
```

- [ ] **Step 6: Create `src/sections/Hero.css`**

```css
.al-hero__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
  gap: var(--al-space-7);
  align-items: center;
}
@media (max-width: 900px) {
  .al-hero__grid { grid-template-columns: 1fr; gap: var(--al-space-5); }
}

.al-hero__eyebrow {
  font-size: var(--al-text-xs);
  font-weight: var(--al-weight-bold);
  letter-spacing: var(--al-tracking-eyebrow);
  text-transform: uppercase;
  color: var(--al-teal-text);
  margin: 0 0 var(--al-space-3);
}

.al-hero__title {
  font-size: var(--al-text-display);
  font-weight: var(--al-weight-bold);
  line-height: var(--al-leading-tight);
  letter-spacing: var(--al-tracking-display);
  margin: 0 0 var(--al-space-4);
  text-wrap: balance;
}

.al-hero__sub {
  font-size: var(--al-text-body-lg);
  line-height: var(--al-leading-normal);
  color: var(--al-ink-muted);
  margin: 0 0 var(--al-space-5);
  max-width: 54ch;
}

.al-hero__ctas { display: flex; gap: var(--al-space-3); flex-wrap: wrap; margin-bottom: var(--al-space-5); }

.al-hero__strip {
  display: flex; flex-wrap: wrap; gap: 6px var(--al-space-4);
  font-size: var(--al-text-xs); color: var(--al-ink-muted);
  list-style: none; margin: 0; padding: 0;
}
.al-hero__strip li { display: inline-flex; align-items: center; gap: 5px; }
.al-hero__tick { width: 11px; height: 11px; color: var(--al-teal-text); flex: none; }
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npm test -- Hero`
Expected: PASS, 4 tests.

- [ ] **Step 8: Commit**

```bash
git add src/sections/Hero.tsx src/sections/Hero.css src/sections/SignalCockpit.tsx src/sections/SignalCockpit.css src/sections/__tests__/Hero.test.tsx
git commit -m "feat: add hero with case signal cockpit"
```

---

## Task 8: Transformation flow

**Files:**
- Create: `src/sections/Transformation.tsx`, `Transformation.css`

- [ ] **Step 1: Create `src/sections/Transformation.tsx`**

```tsx
import { Section } from '../components/primitives/Section';
import './Transformation.css';

const INPUTS = [
  'Intake calls', 'QME / AME reports', 'PTP reports', 'Imaging', 'Billing',
  'Wage records', 'Subpoenaed records', 'Prior claims', 'Correspondence',
];

const BRAIN = [
  { text: 'Every fact cited to document, page, sentence', tone: 'verified' },
  { text: 'Normalized across providers and dates', tone: 'verified' },
  { text: 'Conflicts surfaced, never auto-resolved', tone: 'conflict' },
  { text: 'Gaps identified — what is missing', tone: 'conflict' },
  { text: 'Attorney confirms before it becomes truth', tone: 'verified' },
] as const;

const OUTPUTS = [
  'Source-linked chronology', 'Missing-evidence checklist', 'Issue map & conflicts',
  'QME/AME analysis', 'Demand-ready narrative',
];

function Arrow() {
  return (
    <div className="al-tf__arrow" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d="M4 12h15m0 0l-5-5m5 5l-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function Transformation() {
  return (
    <Section
      id="transformation"
      eyebrow="How it works"
      heading="From scattered evidence to case intelligence"
      intro="Records arrive continuously and never in order. The middle stage is the product."
    >
      <div className="al-tf">
        <div className="al-tf__stage">
          <p className="al-tf__n">Step 1</p>
          <h3 className="al-tf__t">What arrives</h3>
          <ul className="al-tf__docs">
            {INPUTS.map((d) => <li key={d}>{d}</li>)}
          </ul>
        </div>

        <Arrow />

        <div className="al-tf__stage al-tf__stage--brain al-on-navy">
          <p className="al-tf__n">Step 2</p>
          <h3 className="al-tf__t">Case Brain</h3>
          <ul className="al-tf__rows">
            {BRAIN.map((r) => (
              <li key={r.text} className={`al-tf__row al-tf__row--${r.tone}`}>
                <i aria-hidden="true" />{r.text}
              </li>
            ))}
          </ul>
        </div>

        <Arrow />

        <div className="al-tf__stage">
          <p className="al-tf__n">Step 3</p>
          <h3 className="al-tf__t">What you get</h3>
          <ul className="al-tf__outs">
            {OUTPUTS.map((o) => <li key={o}>{o}</li>)}
          </ul>
        </div>
      </div>
    </Section>
  );
}
```

- [ ] **Step 2: Create `src/sections/Transformation.css`**

```css
.al-tf {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  gap: var(--al-space-4);
  align-items: stretch;
}
@media (max-width: 900px) {
  .al-tf { grid-template-columns: 1fr; }
  .al-tf__arrow { transform: rotate(90deg); justify-self: center; }
}

.al-tf__stage {
  background: var(--al-surface);
  border: 1px solid var(--al-hairline);
  border-radius: var(--al-radius-card);
  padding: var(--al-space-4);
}
.al-tf__stage--brain { background: var(--al-navy); border-color: transparent; color: var(--al-ink-inverse); }

.al-tf__n {
  font-size: 11px; font-weight: var(--al-weight-bold);
  letter-spacing: var(--al-tracking-eyebrow); text-transform: uppercase;
  color: var(--al-ink-muted); margin: 0 0 var(--al-space-2);
}
.al-tf__stage--brain .al-tf__n { color: var(--al-teal); }

.al-tf__t { font-size: var(--al-text-h3); font-weight: var(--al-weight-semibold); margin: 0 0 var(--al-space-3); }

.al-tf__docs { display: flex; flex-wrap: wrap; gap: 6px; list-style: none; margin: 0; padding: 0; }
.al-tf__docs li {
  font-size: 11px; padding: 4px 9px; border-radius: var(--al-radius-pill);
  background: var(--al-canvas); border: 1px solid var(--al-hairline); color: var(--al-ink-muted);
}

.al-tf__rows { display: grid; gap: 6px; list-style: none; margin: 0; padding: 0; }
.al-tf__row {
  display: flex; align-items: center; gap: var(--al-space-2);
  background: var(--al-navy-raised); border-radius: var(--al-radius-sm);
  padding: 8px 10px; font-size: 11px; color: var(--al-ink-inverse-muted);
}
.al-tf__row i { width: 5px; height: 5px; border-radius: 50%; background: var(--al-teal); flex: none; }
.al-tf__row--conflict i { background: var(--al-amber); }

.al-tf__outs { display: grid; gap: 6px; list-style: none; margin: 0; padding: 0; }
.al-tf__outs li {
  border-left: 3px solid var(--al-teal-text);
  background: var(--al-canvas);
  border-radius: var(--al-radius-sm);
  padding: 9px 11px;
  font-size: var(--al-text-sm);
}

.al-tf__arrow { display: grid; place-items: center; color: var(--al-hairline-strong); }
.al-tf__arrow svg { width: 22px; height: 22px; }
```

- [ ] **Step 3: Verify it compiles**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/sections/Transformation.tsx src/sections/Transformation.css
git commit -m "feat: add transformation flow section"
```

---

## Task 9: Interactive chronology

The most load-bearing component. It must prove the citation claim, not assert it.

**Files:**
- Create: `src/sections/Chronology.tsx`, `Chronology.css`
- Test: `src/sections/__tests__/Chronology.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Chronology } from '../Chronology';

describe('Chronology', () => {
  it('shows the first event detail on mount', () => {
    render(<Chronology />);
    expect(screen.getByText(/employer incident report/i)).toBeInTheDocument();
  });

  it('reveals document, page and the cited sentence when an event is selected', async () => {
    const user = userEvent.setup();
    render(<Chronology />);
    await user.click(screen.getByRole('button', { name: /qme evaluation/i }));

    const detail = screen.getByTestId('chronology-detail');
    expect(within(detail).getByText(/QME report — Dr\. A\. Reyes/)).toBeInTheDocument();
    expect(within(detail).getByText('page 14')).toBeInTheDocument();
    expect(
      within(detail).getByText(/4mm disc protrusion at L4–L5/)
    ).toBeInTheDocument();
  });

  it('surfaces a conflict without resolving it', async () => {
    const user = userEvent.setup();
    render(<Chronology />);
    await user.click(screen.getByRole('button', { name: /released to modified duty/i }));

    const detail = screen.getByTestId('chronology-detail');
    expect(within(detail).getByText(/unresolved conflict/i)).toBeInTheDocument();
    expect(within(detail).getByText(/does not pick a winner/i)).toBeInTheDocument();
  });

  it('flags a record that is referenced but never produced', async () => {
    const user = userEvent.setup();
    render(<Chronology />);
    await user.click(screen.getByRole('button', { name: /MRI lumbar spine/i }));

    const detail = screen.getByTestId('chronology-detail');
    expect(within(detail).getByText(/referenced but never produced/i)).toBeInTheDocument();
    expect(within(detail).getByRole('button', { name: /draft records request/i })).toBeInTheDocument();
  });

  it('marks exactly one event as selected', async () => {
    const user = userEvent.setup();
    render(<Chronology />);
    await user.click(screen.getByRole('button', { name: /qme evaluation/i }));

    const selected = screen.getAllByRole('button', { expanded: true });
    expect(selected).toHaveLength(1);
    expect(selected[0]).toHaveAccessibleName(/qme evaluation/i);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- Chronology`
Expected: FAIL — cannot resolve `../Chronology`.

- [ ] **Step 3: Create `src/sections/Chronology.tsx`**

```tsx
import { useState } from 'react';
import { Chip } from '../components/primitives/Chip';
import { CHRONOLOGY } from '../data/demoCase';
import './Chronology.css';

export function Chronology() {
  const [active, setActive] = useState(0);
  const event = CHRONOLOGY[active];

  return (
    <div className="al-chron al-on-navy">
      <div className="al-chron__head">
        <h3 className="al-chron__title">Medical chronology</h3>
        <p className="al-chron__note">Demonstration data &middot; select any event</p>
      </div>

      <div className="al-chron__body">
        <ul className="al-chron__spine">
          {CHRONOLOGY.map((e, i) => (
            <li key={e.date + e.title} className={`al-ev al-ev--${e.tone}`}>
              <button
                type="button"
                aria-expanded={i === active}
                onClick={() => setActive(i)}
              >
                <span className="al-ev__date">{e.date}</span>
                <span className="al-ev__title">{e.title}</span>
                <span className="al-ev__provider">{e.provider}</span>
                {e.flag && (
                  <span className="al-ev__flag">
                    <Chip tone="conflict">{e.flag}</Chip>
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>

        <div className="al-chron__detail" data-testid="chronology-detail" aria-live="polite">
          <div className="al-detail__head">
            <span className="al-detail__src">{event.source}</span>
            <span className="al-detail__pg">{event.page}</span>
          </div>

          {event.warning && (
            <div className="al-detail__warn">
              <b>{event.warning.title}</b>
              {event.warning.body}
            </div>
          )}

          {event.quote && (
            <p className="al-detail__quote">
              {event.quote[0]}
              <mark>{event.quote[1]}</mark>
              {event.quote[2]}
            </p>
          )}

          <dl className="al-detail__meta">
            {event.meta.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
            {event.confidence !== null && (
              <div>
                <dt>Confidence</dt>
                <dd>
                  <span className="al-conf">
                    <span className="al-conf__fill" style={{ width: `${event.confidence}%` }} />
                  </span>
                  {event.confidence}%
                </dd>
              </div>
            )}
          </dl>

          <div className="al-detail__actions">
            <button type="button" className="al-mini al-mini--go">{event.action}</button>
            <button type="button" className="al-mini">Confirm</button>
            <button type="button" className="al-mini">Flag</button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/sections/Chronology.css`**

```css
.al-chron { background: var(--al-navy); border-radius: var(--al-radius-panel); padding: var(--al-space-5); }

.al-chron__head {
  display: flex; justify-content: space-between; align-items: baseline;
  gap: var(--al-space-3); flex-wrap: wrap; margin-bottom: var(--al-space-4);
}
.al-chron__title { margin: 0; color: #fff; font-size: var(--al-text-h3); }
.al-chron__note { margin: 0; color: var(--al-ink-inverse-muted); font-size: var(--al-text-xs); }

.al-chron__body { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); gap: var(--al-space-4); }
@media (max-width: 860px) { .al-chron__body { grid-template-columns: 1fr; } }

.al-chron__spine { list-style: none; margin: 0; padding: 0 0 0 var(--al-space-4); position: relative; }
.al-chron__spine::before {
  content: ""; position: absolute; left: 5px; top: 6px; bottom: 6px;
  width: 2px; background: var(--al-hairline-inverse);
}

.al-ev { position: relative; margin-bottom: 2px; }
.al-ev::before {
  content: ""; position: absolute; left: -19px; top: 15px;
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--al-state-neutral); border: 2px solid var(--al-navy);
}
.al-ev--verified::before { background: var(--al-teal); }
.al-ev--conflict::before { background: var(--al-amber); }

.al-ev button {
  width: 100%; text-align: left; background: transparent;
  border: 1px solid transparent; border-radius: var(--al-radius-card);
  padding: var(--al-space-3); cursor: pointer;
  font-family: var(--al-font-ui); color: #fff; display: block;
  transition: background-color var(--al-duration-fast) var(--al-ease), border-color var(--al-duration-fast) var(--al-ease);
}
.al-ev button:hover { background: var(--al-navy-raised); }
.al-ev button[aria-expanded="true"] { background: var(--al-navy-raised); border-color: var(--al-teal); }

.al-ev__date { display: block; font-size: 11px; color: var(--al-ink-inverse-muted); font-variant-numeric: tabular-nums; }
.al-ev__title { display: block; font-size: var(--al-text-sm); font-weight: var(--al-weight-semibold); margin-top: 2px; }
.al-ev__provider { display: block; font-size: 11px; color: var(--al-ink-inverse-muted); margin-top: 3px; }
/* Chip renders the flag; this only positions it and lifts it onto the navy surface. */
.al-ev__flag { display: inline-block; margin-top: 6px; }
.al-ev__flag .al-chip--conflict {
  background: rgba(199, 107, 59, 0.2);
  color: var(--al-amber);
  border-color: transparent;
  font-size: 10px;
  padding: 2px 8px;
}

.al-chron__detail {
  background: var(--al-surface); color: var(--al-ink);
  border-radius: var(--al-radius-card); padding: var(--al-space-4);
  align-self: start; position: sticky; top: var(--al-space-4);
}
.al-detail__head {
  display: flex; justify-content: space-between; gap: var(--al-space-3);
  align-items: baseline; border-bottom: 1px solid var(--al-hairline);
  padding-bottom: var(--al-space-2); margin-bottom: var(--al-space-3);
}
.al-detail__src { font-size: var(--al-text-sm); font-weight: var(--al-weight-semibold); }
.al-detail__pg { font-size: var(--al-text-xs); color: var(--al-ink-muted); white-space: nowrap; }

.al-detail__warn {
  background: var(--al-amber-wash); color: var(--al-amber-text);
  border-radius: var(--al-radius-sm); padding: var(--al-space-3);
  font-size: var(--al-text-xs); margin-bottom: var(--al-space-3);
}
.al-detail__warn b { display: block; }

.al-detail__quote {
  font-family: var(--al-font-record); font-size: var(--al-text-body); line-height: 1.6;
  border-left: 3px solid var(--al-teal-text); padding-left: var(--al-space-3);
  margin: 0 0 var(--al-space-3);
}
.al-detail__quote mark { background: var(--al-teal-wash); color: inherit; border-radius: 3px; padding: 1px 2px; }

.al-detail__meta { display: grid; gap: 5px; font-size: var(--al-text-xs); margin: 0 0 var(--al-space-3); }
.al-detail__meta > div { display: grid; grid-template-columns: 110px 1fr; gap: var(--al-space-3); }
.al-detail__meta dt { color: var(--al-ink-muted); }
.al-detail__meta dd { margin: 0; font-weight: var(--al-weight-medium); }

.al-conf {
  display: inline-block; width: 52px; height: 5px; border-radius: 3px;
  background: var(--al-hairline); overflow: hidden; vertical-align: middle; margin-right: 6px;
}
.al-conf__fill { display: block; height: 100%; background: var(--al-teal-text); }

.al-detail__actions { display: flex; gap: var(--al-space-2); flex-wrap: wrap; }
.al-mini {
  font-size: var(--al-text-xs); font-weight: var(--al-weight-semibold);
  padding: 7px 13px; border-radius: var(--al-radius-pill);
  border: 1px solid var(--al-hairline-strong); background: transparent;
  cursor: pointer; font-family: var(--al-font-ui);
}
.al-mini--go { background: var(--al-navy); color: #fff; border-color: transparent; }
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test -- Chronology`
Expected: PASS, 5 tests.

- [ ] **Step 6: Commit**

```bash
git add src/sections/Chronology.tsx src/sections/Chronology.css src/sections/__tests__/Chronology.test.tsx
git commit -m "feat: add interactive chronology with citation provenance"
```

---

## Task 10: Body explorer

**Files:**
- Create: `src/sections/BodyExplorer.tsx`, `BodyExplorer.css`
- Test: `src/sections/__tests__/BodyExplorer.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BodyExplorer } from '../BodyExplorer';

describe('BodyExplorer', () => {
  it('opens on the lumbar region in plain English', () => {
    render(<BodyExplorer />);
    expect(screen.getByText(/pressing on a nerve/i)).toBeInTheDocument();
  });

  it('swaps content when another region is selected', async () => {
    const user = userEvent.setup();
    render(<BodyExplorer />);
    await user.click(screen.getByRole('button', { name: /left shoulder/i }));

    const panel = screen.getByTestId('body-detail');
    expect(within(panel).getByText(/rotator cuff is partially torn/i)).toBeInTheDocument();
  });

  it('keeps a non-claimed region visible rather than hiding it', async () => {
    const user = userEvent.setup();
    render(<BodyExplorer />);
    await user.click(screen.getByRole('button', { name: /cervical spine/i }));

    const panel = screen.getByTestId('body-detail');
    expect(within(panel).getByText(/not an accepted body part/i)).toBeInTheDocument();
  });

  it('moves between regions with arrow keys', async () => {
    const user = userEvent.setup();
    render(<BodyExplorer />);
    const first = screen.getByRole('button', { name: /cervical spine/i });
    first.focus();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('button', { name: /left shoulder/i })).toHaveFocus();
  });

  it('cites a source on every row', async () => {
    render(<BodyExplorer />);
    const panel = screen.getByTestId('body-detail');
    const cites = within(panel).getAllByTestId('cite');
    expect(cites.length).toBeGreaterThan(0);
    cites.forEach((c) => expect(c.textContent?.trim()).not.toBe(''));
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- BodyExplorer`
Expected: FAIL — cannot resolve `../BodyExplorer`.

- [ ] **Step 3: Create `src/sections/BodyExplorer.tsx`**

```tsx
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

        <div className="al-bx__info" data-testid="body-detail" aria-live="polite">
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
```

- [ ] **Step 4: Create `src/sections/BodyExplorer.css`**

```css
.al-bx { background: var(--al-navy); border-radius: var(--al-radius-panel); padding: var(--al-space-5); }
.al-bx__title { margin: 0 0 var(--al-space-1); color: #fff; font-size: var(--al-text-h3); }
.al-bx__note { margin: 0 0 var(--al-space-4); color: var(--al-ink-inverse-muted); font-size: var(--al-text-xs); }

.al-bx__body { display: grid; grid-template-columns: 210px minmax(0, 1fr); gap: var(--al-space-5); align-items: start; }
@media (max-width: 780px) { .al-bx__body { grid-template-columns: 1fr; } }

.al-bx__fig { background: var(--al-navy-raised); border-radius: var(--al-radius-card); padding: var(--al-space-3); }
.al-bx__fig svg { width: 100%; height: auto; display: block; }
.al-bx__base { fill: #1d3d59; }

.al-bx__region {
  fill: var(--al-state-neutral); opacity: 0.45; cursor: pointer;
  transition: opacity var(--al-duration-fast) var(--al-ease), fill var(--al-duration-fast) var(--al-ease);
}
.al-bx__region:hover { opacity: 0.8; }
.al-bx__region.is-claimed { fill: var(--al-teal); opacity: 0.6; }
.al-bx__region.is-on { fill: var(--al-teal); opacity: 1; }
.al-bx__region:focus-visible { outline: 2px solid var(--al-teal); outline-offset: 2px; }

.al-bx__legend { display: flex; gap: var(--al-space-3); flex-wrap: wrap; font-size: 10px; color: var(--al-ink-inverse-muted); margin-top: var(--al-space-2); }
.al-bx__legend i { width: 8px; height: 8px; border-radius: 2px; display: inline-block; margin-right: 4px; }

.al-bx__info { background: var(--al-surface); color: var(--al-ink); border-radius: var(--al-radius-card); padding: var(--al-space-4); }
.al-bx__info h4 { margin: 0 0 var(--al-space-1); font-size: var(--al-text-h3); }
.al-bx__plain { margin: 0 0 var(--al-space-4); font-size: var(--al-text-sm); color: var(--al-ink-muted); line-height: 1.55; }

.al-bx__rows { display: grid; gap: var(--al-space-2); }
.al-bx__row {
  border-left: 3px solid var(--al-teal-text); background: var(--al-canvas);
  border-radius: var(--al-radius-sm); padding: var(--al-space-3);
}
.al-bx__row.is-warn { border-left-color: var(--al-amber); }
.al-bx__row b {
  display: block; font-size: 11px; text-transform: uppercase;
  letter-spacing: 0.06em; color: var(--al-ink-muted); margin-bottom: 3px;
}
.al-bx__row span { font-size: var(--al-text-sm); }
.al-bx__row cite {
  display: block; font-style: normal; font-size: 11px;
  color: var(--al-teal-text); margin-top: 4px; font-weight: var(--al-weight-semibold);
}
.al-bx__row.is-warn cite { color: var(--al-amber-text); }
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test -- BodyExplorer`
Expected: PASS, 5 tests.

- [ ] **Step 6: Commit**

```bash
git add src/sections/BodyExplorer.tsx src/sections/BodyExplorer.css src/sections/__tests__/BodyExplorer.test.tsx
git commit -m "feat: add keyboard-operable body explorer"
```

---

## Task 11: Product experience and practice solutions

**Files:**
- Create: `src/sections/ProductExperience.tsx`, `ProductExperience.css`, `src/sections/PracticeSolutions.tsx`, `PracticeSolutions.css`
- Test: `src/sections/__tests__/PracticeSolutions.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PracticeSolutions } from '../PracticeSolutions';

describe('PracticeSolutions', () => {
  it('defaults to personal injury', () => {
    render(<PracticeSolutions />);
    expect(screen.getByRole('tab', { name: /personal injury/i })).toHaveAttribute('aria-selected', 'true');
  });

  it('swaps to workers compensation outputs, not relabelled PI copy', async () => {
    const user = userEvent.setup();
    render(<PracticeSolutions />);
    await user.click(screen.getByRole('tab', { name: /workers/i }));

    const panel = screen.getByRole('tabpanel');
    expect(within(panel).getByText(/QME\/AME vs PTP/i)).toBeInTheDocument();
    expect(within(panel).getByText(/apportionment/i)).toBeInTheDocument();
    expect(within(panel).queryByText(/demand narrative/i)).not.toBeInTheDocument();
  });

  it('moves between tabs with arrow keys', async () => {
    const user = userEvent.setup();
    render(<PracticeSolutions />);
    screen.getByRole('tab', { name: /personal injury/i }).focus();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('tab', { name: /workers/i })).toHaveFocus();
    expect(screen.getByRole('tab', { name: /workers/i })).toHaveAttribute('aria-selected', 'true');
  });

  it('shows exactly one panel at a time', async () => {
    const user = userEvent.setup();
    render(<PracticeSolutions />);
    await user.click(screen.getByRole('tab', { name: /workers/i }));
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- PracticeSolutions`
Expected: FAIL — cannot resolve `../PracticeSolutions`.

- [ ] **Step 3: Create `src/sections/PracticeSolutions.tsx`**

```tsx
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
```

- [ ] **Step 4: Create `src/sections/PracticeSolutions.css`**

```css
.al-seg {
  display: inline-flex; background: var(--al-canvas);
  border: 1px solid var(--al-hairline-strong); border-radius: var(--al-radius-pill);
  padding: 4px; gap: 2px; margin-bottom: var(--al-space-4);
}
.al-seg button {
  font-family: var(--al-font-ui); font-size: var(--al-text-sm);
  font-weight: var(--al-weight-semibold); color: var(--al-ink-muted);
  background: transparent; border: 0; padding: 9px 20px;
  border-radius: var(--al-radius-pill); cursor: pointer; white-space: nowrap;
  transition: background-color var(--al-duration-fast) var(--al-ease), color var(--al-duration-fast) var(--al-ease);
}
.al-seg button[aria-selected="true"] { background: var(--al-navy); color: #fff; }
.al-seg button[aria-selected="false"]:hover { color: var(--al-ink); }

.al-practice {
  background: var(--al-navy); border-radius: var(--al-radius-panel);
  padding: var(--al-space-5); color: var(--al-ink-inverse);
  animation: al-fade var(--al-duration-base) var(--al-ease);
}
@keyframes al-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .al-practice { animation: none; } }

.al-practice h3 { margin: 0 0 var(--al-space-1); font-size: var(--al-text-h3); }
.al-practice > p { margin: 0 0 var(--al-space-4); color: var(--al-ink-inverse-muted); font-size: var(--al-text-sm); max-width: 62ch; }

.al-practice__outs { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--al-space-2); }
.al-practice__out {
  background: var(--al-navy-raised); border-radius: var(--al-radius-card);
  padding: var(--al-space-3); border-left: 3px solid var(--al-teal);
}
.al-practice__out b { display: block; font-size: var(--al-text-sm); margin-bottom: 2px; }
.al-practice__out span { font-size: var(--al-text-xs); color: var(--al-ink-inverse-muted); }
```

- [ ] **Step 5: Create `src/sections/ProductExperience.tsx`**

```tsx
import { Section } from '../components/primitives/Section';
import { Chronology } from './Chronology';
import { BodyExplorer } from './BodyExplorer';
import './ProductExperience.css';

export function ProductExperience() {
  return (
    <Section
      id="products"
      eyebrow="The product"
      heading="See what Autolaw finds — and where it found it"
      intro="Every fact traces to a document, a page, and the sentence it came from. Where two records disagree, the disagreement is surfaced rather than averaged away."
    >
      <div className="al-px">
        <Chronology />
        <BodyExplorer />
      </div>
    </Section>
  );
}
```

- [ ] **Step 6: Create `src/sections/ProductExperience.css`**

```css
.al-px { display: grid; gap: var(--al-space-4); }
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npm test -- PracticeSolutions`
Expected: PASS, 4 tests.

- [ ] **Step 8: Commit**

```bash
git add src/sections/ProductExperience.tsx src/sections/ProductExperience.css src/sections/PracticeSolutions.tsx src/sections/PracticeSolutions.css src/sections/__tests__/PracticeSolutions.test.tsx
git commit -m "feat: add product experience and PI/WC practice toggle"
```

---

## Task 12: Trust section

**Files:**
- Create: `src/sections/Trust.tsx`, `Trust.css`
- Test: `src/sections/__tests__/Trust.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Trust } from '../Trust';
import { CUSTOMER_LOGOS } from '../../config';

describe('Trust', () => {
  it('renders no customer logo wall while no permissioned assets exist', () => {
    expect(CUSTOMER_LOGOS).toHaveLength(0);
    render(<Trust />);
    expect(screen.queryByTestId('logo-wall')).not.toBeInTheDocument();
    expect(screen.queryByText(/trusted by/i)).not.toBeInTheDocument();
  });

  it('states the four control claims in plain language', () => {
    render(<Trust />);
    expect(screen.getByText(/does not train models/i)).toBeInTheDocument();
    expect(screen.getByText(/tenant isolation/i)).toBeInTheDocument();
    expect(screen.getByText(/auditable access/i)).toBeInTheDocument();
    expect(screen.getByText(/human confirmation required/i)).toBeInTheDocument();
  });

  it('puts the comparison table in its own scroll container', () => {
    render(<Trust />);
    expect(screen.getByTestId('comparison-scroller')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- Trust`
Expected: FAIL — cannot resolve `../Trust`.

- [ ] **Step 3: Create `src/sections/Trust.tsx`**

```tsx
import { Section } from '../components/primitives/Section';
import { CUSTOMER_LOGOS, CERTIFICATIONS } from '../config';
import './Trust.css';

const CONTROLS = [
  { title: 'Your data does not train models', body: 'Case content is never used to train or fine-tune any model, ours or a vendor’s.' },
  { title: 'Tenant isolation', body: 'Every case, document, and job is scoped to your firm end-to-end, enforced server-side.' },
  { title: 'Auditable access', body: 'Who opened which document, and when, is recorded and reviewable.' },
  { title: 'Human confirmation required', body: 'Extraction proposes; it never writes case truth. An attorney confirms before a value becomes fact.' },
];

const ROWS: Array<[string, string, string]> = [
  ['Where a fact came from', 'Summarizes; sources approximate or absent', 'Document, page, and the exact sentence — deep-linked'],
  ['Two documents disagree', 'Picks one, silently', 'Surfaced as a conflict with both sources and dates'],
  ['A fact with no support', 'Reads identically to a supported one', 'Held in a separate lane and never grouped with cited facts'],
  ['What is missing from the file', 'Cannot know what it was never given', 'Detects referenced-but-absent records and drafts the request'],
  ['Becoming case truth', 'Output is the answer', 'Proposes only; an attorney confirms before anything is recorded'],
  ['Practice fit', 'Generic', 'PI and WC isolated at the route, navigation, and data layer'],
  ['Your data', 'Consumer terms; retention varies', 'Tenant-isolated, auditable, never used to train models'],
];

function Cross() {
  return (
    <svg className="al-mk__i" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M3.5 3.5l7 7m0-7l-7 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function Check() {
  return (
    <svg className="al-mk__i" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M2.5 7.5l3 3 6-6.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Trust() {
  return (
    <Section
      id="trust"
      eyebrow="Trust"
      heading="Why not simply upload the file to a chatbot"
      intro="Every row below is a behavior implemented in the application, not an adjective."
    >
      <div className="al-trust__badges">
        {CERTIFICATIONS.map((c) => (
          <div key={c.label} className="al-badge">
            <span className="al-badge__mark" aria-hidden="true">{c.mark}</span>
            <div>
              <b>{c.label}</b>
              <span>{c.detail}</span>
            </div>
          </div>
        ))}
      </div>

      {CUSTOMER_LOGOS.length > 0 && (
        <div data-testid="logo-wall" className="al-trust__wall-wrap">
          <p className="al-trust__wall-label">Trusted by:</p>
          <ul className="al-trust__wall">
            {CUSTOMER_LOGOS.map((l) => (
              <li key={l.name}><img src={l.src} alt={l.name} loading="lazy" /></li>
            ))}
          </ul>
        </div>
      )}

      <div className="al-trust__controls">
        {CONTROLS.map((c) => (
          <div key={c.title} className="al-ctrl">
            <b>{c.title}</b>
            <p>{c.body}</p>
          </div>
        ))}
      </div>

      <div className="al-cmp">
        <div className="al-cmp__scroller" data-testid="comparison-scroller" tabIndex={0}>
          <table>
            <caption className="al-visually-hidden">
              Comparison of a general-purpose chatbot and Autolaw across seven requirements
            </caption>
            <thead>
              <tr>
                <th scope="col">Requirement</th>
                <th scope="col">General-purpose chatbot</th>
                <th scope="col">Autolaw</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([req, chatbot, autolaw]) => (
                <tr key={req}>
                  <th scope="row">{req}</th>
                  <td><span className="al-mk al-mk--no"><Cross /></span>{chatbot}</td>
                  <td><span className="al-mk al-mk--yes"><Check /></span>{autolaw}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  );
}
```

- [ ] **Step 4: Create `src/sections/Trust.css`**

```css
.al-trust__badges { display: flex; gap: var(--al-space-3); flex-wrap: wrap; margin-bottom: var(--al-space-5); }
.al-badge {
  display: flex; align-items: center; gap: var(--al-space-3);
  background: var(--al-surface); border: 1px solid var(--al-hairline);
  border-radius: var(--al-radius-card); padding: var(--al-space-3) var(--al-space-4);
}
.al-badge__mark {
  width: 38px; height: 38px; border-radius: 50%;
  background: var(--al-navy); color: var(--al-teal);
  display: grid; place-items: center; font-size: 10px;
  font-weight: var(--al-weight-bold); flex: none;
}
.al-badge b { display: block; font-size: var(--al-text-sm); }
.al-badge span { font-size: var(--al-text-xs); color: var(--al-ink-muted); }

.al-trust__wall-label { font-size: var(--al-text-xs); color: var(--al-ink-muted); margin: 0 0 var(--al-space-3); }
.al-trust__wall {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--al-space-3); list-style: none; margin: 0 0 var(--al-space-5); padding: 0;
}
.al-trust__wall img { height: 40px; width: auto; object-fit: contain; opacity: 0.75; }

.al-trust__controls {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--al-space-3); margin-bottom: var(--al-space-6);
}
.al-ctrl {
  background: var(--al-surface); border: 1px solid var(--al-hairline);
  border-left: 3px solid var(--al-teal-text); border-radius: var(--al-radius-card);
  padding: var(--al-space-4);
}
.al-ctrl b { display: block; font-size: var(--al-text-sm); margin-bottom: var(--al-space-1); }
.al-ctrl p { margin: 0; font-size: var(--al-text-xs); color: var(--al-ink-muted); line-height: 1.5; }

.al-cmp {
  background: var(--al-surface); border: 1px solid var(--al-hairline);
  border-radius: var(--al-radius-panel); overflow: hidden;
}
.al-cmp__scroller { overflow-x: auto; }
.al-cmp table { border-collapse: collapse; width: 100%; min-width: 620px; }
.al-cmp th, .al-cmp td {
  text-align: left; padding: var(--al-space-3) var(--al-space-4);
  border-bottom: 1px solid var(--al-hairline); font-size: var(--al-text-sm); vertical-align: top;
}
.al-cmp thead th {
  background: var(--al-canvas); font-size: var(--al-text-xs);
  text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--al-ink-muted); font-weight: var(--al-weight-bold);
}
.al-cmp thead th:last-child { background: var(--al-navy); color: var(--al-teal); }
.al-cmp tbody tr:last-child th, .al-cmp tbody tr:last-child td { border-bottom: 0; }
.al-cmp tbody th { font-weight: var(--al-weight-semibold); width: 34%; }
.al-cmp td:nth-child(2) { color: var(--al-ink-muted); }
.al-cmp td:last-child { background: rgba(24, 169, 153, 0.05); border-left: 2px solid var(--al-teal-text); }

.al-mk { display: inline-flex; align-items: center; margin-right: 6px; vertical-align: -2px; }
.al-mk--yes { color: var(--al-teal-text); }
.al-mk--no { color: var(--al-amber-text); }
.al-mk__i { width: 13px; height: 13px; flex: none; }
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test -- Trust`
Expected: PASS, 3 tests.

- [ ] **Step 6: Commit**

```bash
git add src/sections/Trust.tsx src/sections/Trust.css src/sections/__tests__/Trust.test.tsx
git commit -m "feat: add trust section with control statements and comparison"
```

---

## Task 13: Nav, footer, conversion, and app assembly

This is the task that turns the Task 3 guards green.

**Files:**
- Create: `src/components/SiteNav.tsx`, `SiteNav.css`, `src/components/SiteFooter.tsx`, `SiteFooter.css`, `src/sections/Conversion.tsx`, `Conversion.css`
- Modify: `src/App.tsx`, `index.html`
- Delete: `src/index.css`, `src/imports/`, `src/assets/`, `src/components/figma/`, `src/styles/globals.css`, `src/codelayer/`, `src/codelayer-2/`

- [ ] **Step 1: Create `src/components/SiteNav.tsx`**

```tsx
import { useState } from 'react';
import { Button } from './primitives/Button';
import { LOGIN_URL, TRIAL_URL } from '../config';
import './SiteNav.css';

const LINKS = [
  { href: '#transformation', label: 'How it works' },
  { href: '#products', label: 'Product' },
  { href: '#solutions', label: 'Solutions' },
  { href: '#trust', label: 'Trust' },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="al-nav" aria-label="Primary">
      <div className="al-container al-nav__inner">
        <a className="al-nav__brand" href="#top">Autolaw</a>

        <ul className="al-nav__links">
          {LINKS.map((l) => (
            <li key={l.href}><a href={l.href}>{l.label}</a></li>
          ))}
        </ul>

        <div className="al-nav__actions">
          <a className="al-nav__login" href={LOGIN_URL}>Log in</a>
          <Button href={TRIAL_URL} variant="primary" size="md">Analyze one case</Button>
        </div>

        <button
          type="button"
          className="al-nav__toggle"
          aria-expanded={open}
          aria-controls="nav-mobile"
          onClick={() => setOpen(!open)}
        >
          <span className="al-visually-hidden">{open ? 'Close menu' : 'Open menu'}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true" width="24" height="24">
            <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="al-nav__mobile" id="nav-mobile">
          <ul>
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
              </li>
            ))}
            <li><a href={LOGIN_URL}>Log in</a></li>
          </ul>
          <Button href={TRIAL_URL} variant="primary" size="md">Analyze one case</Button>
        </div>
      )}
    </nav>
  );
}
```

- [ ] **Step 2: Create `src/components/SiteNav.css`**

```css
.al-nav {
  position: sticky; top: 0; z-index: 40;
  background: rgba(247, 248, 244, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--al-hairline);
}
.al-nav__inner { display: flex; align-items: center; justify-content: space-between; gap: var(--al-space-4); height: 68px; }

.al-nav__brand {
  font-size: 1.25rem; font-weight: var(--al-weight-bold);
  letter-spacing: -0.02em; color: var(--al-ink); text-decoration: none;
}

.al-nav__links { display: flex; gap: var(--al-space-4); list-style: none; margin: 0; padding: 0; }
.al-nav__links a {
  font-size: var(--al-text-sm); font-weight: var(--al-weight-medium);
  color: var(--al-ink-muted); text-decoration: none;
  transition: color var(--al-duration-fast) var(--al-ease);
}
.al-nav__links a:hover { color: var(--al-ink); }

.al-nav__actions { display: flex; align-items: center; gap: var(--al-space-3); }
.al-nav__login {
  font-size: var(--al-text-sm); font-weight: var(--al-weight-semibold);
  color: var(--al-ink); text-decoration: none;
}

.al-nav__toggle { display: none; background: transparent; border: 0; cursor: pointer; padding: 8px; }

.al-nav__mobile { border-top: 1px solid var(--al-hairline); padding: var(--al-space-3) var(--al-gutter) var(--al-space-4); }
.al-nav__mobile ul { list-style: none; margin: 0 0 var(--al-space-3); padding: 0; }
.al-nav__mobile a {
  display: block; padding: var(--al-space-3) 0;
  border-bottom: 1px solid var(--al-hairline);
  color: var(--al-ink); text-decoration: none;
  font-size: var(--al-text-sm); font-weight: var(--al-weight-semibold);
}

@media (max-width: 860px) {
  .al-nav__links, .al-nav__actions { display: none; }
  .al-nav__toggle { display: block; }
}
```

- [ ] **Step 3: Create `src/sections/Conversion.tsx`**

```tsx
import { Button } from '../components/primitives/Button';
import { TRIAL_URL, CONTACT_EMAIL } from '../config';
import './Conversion.css';

export function Conversion() {
  return (
    <section id="contact" className="al-section al-conv al-on-navy" aria-labelledby="conv-heading">
      <div className="al-container al-conv__inner">
        <h2 id="conv-heading" className="al-conv__title">Prove it on one of your matters.</h2>
        <p className="al-conv__sub">
          Bring a single case file. We will return a source-linked chronology, the conflicts we
          found, and the records that are missing &mdash; so you can judge the output against a
          matter you already know.
        </p>
        <div className="al-conv__ctas">
          <Button href={TRIAL_URL} variant="inverse" size="lg" withCaret>Analyze one case</Button>
          <Button href={`mailto:${CONTACT_EMAIL}`} variant="inverse-secondary" size="lg">Talk to us</Button>
        </div>
        <p className="al-conv__fine">
          Personal injury and workers&rsquo; compensation are onboarded separately &mdash; tell us
          which practice and you will get that workflow, not a generic demo.
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create `src/sections/Conversion.css`**

```css
.al-conv { background: var(--al-navy); color: var(--al-ink-inverse); }
.al-conv__inner { max-width: 720px; text-align: center; }
.al-conv__title {
  font-size: var(--al-text-h2); font-weight: var(--al-weight-bold);
  line-height: var(--al-leading-snug); letter-spacing: var(--al-tracking-display);
  margin: 0 0 var(--al-space-3); text-wrap: balance;
}
.al-conv__sub {
  font-size: var(--al-text-body-lg); color: var(--al-ink-inverse-muted);
  margin: 0 0 var(--al-space-5); line-height: var(--al-leading-normal);
}
.al-conv__ctas { display: flex; gap: var(--al-space-3); justify-content: center; flex-wrap: wrap; margin-bottom: var(--al-space-4); }
.al-conv__fine { font-size: var(--al-text-xs); color: var(--al-ink-inverse-muted); margin: 0; }
```

- [ ] **Step 5: Create `src/components/SiteFooter.tsx`**

```tsx
import { CONTACT_EMAIL, LOGIN_URL } from '../config';
import './SiteFooter.css';

export function SiteFooter() {
  return (
    <footer className="al-footer">
      <div className="al-container al-footer__inner">
        <div>
          <p className="al-footer__brand">Autolaw</p>
          <p className="al-footer__tag">Case intelligence for personal injury and workers&rsquo; compensation.</p>
        </div>
        <ul className="al-footer__links">
          <li><a href="#transformation">How it works</a></li>
          <li><a href="#products">Product</a></li>
          <li><a href="#solutions">Solutions</a></li>
          <li><a href="#trust">Trust</a></li>
          <li><a href={LOGIN_URL}>Log in</a></li>
          <li><a href={`mailto:${CONTACT_EMAIL}`}>Contact</a></li>
        </ul>
      </div>
      <div className="al-container al-footer__legal">
        <span>&copy; {new Date().getFullYear()} Autolaw.ai</span>
        <span>All rights reserved</span>
      </div>
    </footer>
  );
}
```

- [ ] **Step 6: Create `src/components/SiteFooter.css`**

```css
.al-footer { border-top: 1px solid var(--al-hairline); padding-block: var(--al-space-6) var(--al-space-4); }
.al-footer__inner {
  display: flex; justify-content: space-between; gap: var(--al-space-5);
  flex-wrap: wrap; margin-bottom: var(--al-space-5);
}
.al-footer__brand { font-size: 1.125rem; font-weight: var(--al-weight-bold); margin: 0 0 var(--al-space-1); }
.al-footer__tag { font-size: var(--al-text-sm); color: var(--al-ink-muted); margin: 0; max-width: 40ch; }

.al-footer__links { display: flex; gap: var(--al-space-4); flex-wrap: wrap; list-style: none; margin: 0; padding: 0; }
.al-footer__links a { font-size: var(--al-text-sm); color: var(--al-ink-muted); text-decoration: none; }
.al-footer__links a:hover { color: var(--al-ink); }

.al-footer__legal {
  display: flex; justify-content: space-between; gap: var(--al-space-3);
  flex-wrap: wrap; padding-top: var(--al-space-4);
  border-top: 1px solid var(--al-hairline);
  font-size: var(--al-text-xs); color: var(--al-ink-muted);
}
```

- [ ] **Step 7: Rewrite `src/App.tsx` as assembly only**

```tsx
import { SiteNav } from './components/SiteNav';
import { SiteFooter } from './components/SiteFooter';
import { Hero } from './sections/Hero';
import { Transformation } from './sections/Transformation';
import { ProductExperience } from './sections/ProductExperience';
import { PracticeSolutions } from './sections/PracticeSolutions';
import { Trust } from './sections/Trust';
import { Conversion } from './sections/Conversion';

export default function App() {
  return (
    <>
      <a className="al-skip" href="#main">Skip to content</a>
      <div id="top" />
      <SiteNav />
      <main id="main">
        <Hero />
        <Transformation />
        <ProductExperience />
        <PracticeSolutions />
        <Trust />
        <Conversion />
      </main>
      <SiteFooter />
    </>
  );
}
```

- [ ] **Step 8: Update `index.html` for the new fonts and metadata**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Autolaw turns intake calls, medical records, and expert reports into a source-linked Case Brain for personal injury and workers' compensation firms. Every fact cites its document, page, and sentence." />
    <meta name="theme-color" content="#0C2238" />
    <title>Autolaw — Turn case complexity into legal advantage</title>

    <meta property="og:title" content="Autolaw — Turn case complexity into legal advantage" />
    <meta property="og:description" content="Source-linked case intelligence for personal injury and workers' compensation firms." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.autolaw.ai/" />
    <meta name="twitter:card" content="summary_large_image" />

    <link rel="canonical" href="https://www.autolaw.ai/" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 9: Delete the Figma export leftovers**

```bash
rm -rf src/index.css src/imports src/assets src/components/figma src/components/ui \
       src/styles/globals.css src/codelayer src/codelayer-2 components.json
```

Then confirm nothing still references them:

```bash
grep -rn "figma:asset\|components/ui\|components/figma\|globals.css\|codelayer" src/ index.html vite.config.ts
```
Expected: no matches. Any match is a live import you must remove before the build will pass.

- [ ] **Step 10: Simplify `vite.config.ts`**

The entire `alias` map existed to serve the Figma export. Replace the whole `resolve` block with:

```ts
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: { '@': path.resolve(__dirname, './src') },
  },
```

Every `figma:asset/*` and `package@version` alias goes. Leave `plugins`, `build`, `server`, and `preview` untouched.

- [ ] **Step 11: Prune the dependencies the deleted components pulled in**

With `src/components/ui/` gone, nothing imports Radix, cmdk, vaul, sonner, recharts, embla, react-hook-form, react-day-picker, input-otp, next-themes, class-variance-authority, tailwind-merge, or clsx. The rebuilt site needs only React.

```bash
npm uninstall $(node -e "
const d = require('./package.json').dependencies;
console.log(Object.keys(d).filter(k => k !== 'react' && k !== 'react-dom').join(' '));
")
```

Then confirm the build still passes:

Run: `npm run build`
Expected: build succeeds. If it fails on a missing module, something still imports a removed package — find it with `grep -rn "<package>" src/` and remove the import.

> Out of scope, worth a follow-up: `server/`, `shared/`, and `client/` are orphaned Replit-era Express code. The Dockerfile builds only the Vite app and serves it with Nginx, so none of it ships. Removing it is a separate change, not this one.

- [ ] **Step 12: Run the full suite — the Task 3 guards must now be green**

Run: `npm test`
Expected: PASS, all files. Specifically `credibility.test.tsx` reports 5 passing — no Logoipsum, no test@ address, no Unsplash, no raw Cloud Run host, tokens in sync.

- [ ] **Step 13: Verify the production build**

Run: `npm run build`
Expected: build succeeds. Confirm `build/assets/*.css` is far smaller than the old 29KB compiled Tailwind.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "feat: rebuild site against the design system, remove Figma export"
```

---

## Task 14: Accessibility and responsive verification

**Files:**
- Create: `src/__tests__/a11y.test.tsx`

- [ ] **Step 1: Write the tests**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('page accessibility', () => {
  it('has exactly one h1', () => {
    render(<App />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('offers a skip link as the first focusable element', () => {
    render(<App />);
    const skip = screen.getByRole('link', { name: /skip to content/i });
    expect(skip).toHaveAttribute('href', '#main');
  });

  it('labels every section landmark', () => {
    render(<App />);
    const regions = screen.getAllByRole('region');
    regions.forEach((r) => expect(r).toHaveAccessibleName());
  });

  it('gives every image an alt attribute', () => {
    const { container } = render(<App />);
    container.querySelectorAll('img').forEach((img) => {
      expect(img).toHaveAttribute('alt');
    });
  });

  it('exposes a single main landmark', () => {
    render(<App />);
    expect(screen.getAllByRole('main')).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run the tests**

Run: `npm test -- a11y`
Expected: PASS, 5 tests. If "labels every section landmark" fails, the offending `<Section>` is missing an `id` — `aria-labelledby` is derived from it.

- [ ] **Step 3: Manual keyboard pass**

Run: `npm run dev`, then press Tab from page load and confirm:
- Skip link appears first and jumps to `#main`
- Every nav link, CTA, chronology event, body region, and practice tab is reachable
- Focus is always visible — teal ring on light, teal ring on navy
- Arrow keys move within the practice toggle and the body explorer
- No focus trap anywhere

Record any failure as a bug and fix before continuing.

- [ ] **Step 4: Manual responsive pass**

In devtools, check 360, 768, 1024, and 1440 widths:
- No horizontal page scroll at any width
- The comparison table scrolls inside its own container, not the page
- The hero collapses to one column below 900px
- The cockpit tiles go to two columns below 520px

- [ ] **Step 5: Reduced-motion pass**

Enable "Reduce motion" at the OS level, reload, and confirm the cockpit pulse stops, the practice panel does not slide, and no content is lost.

- [ ] **Step 6: Commit**

```bash
git add src/__tests__/a11y.test.tsx
git commit -m "test: add accessibility guards"
```

---

## Task 15: Deploy

**Prerequisite — resolve these first.** They live outside this repo and the site is not launch-ready without them:

1. Set `TRIAL_SIGNUP_ENABLED=true` on the `case-app` Cloud Run service, or the primary CTA 404s.
2. Create the `app.autolaw.ai` DNS record and Cloud Run domain mapping, then set `NEXT_PUBLIC_APP_URL` and `CASE_APP_BASE_URL` to the same host. They must match or the Dropbox OAuth callback breaks.
3. Point `CONTACT_EMAIL` at a monitored inbox.

- [ ] **Step 1: Confirm the trial URL actually resolves**

Run: `curl -sI https://app.autolaw.ai/trial | head -1`
Expected: `HTTP/2 200`. A 404 means step 1 of the prerequisites is incomplete — stop and fix it before deploying.

- [ ] **Step 2: Run the full gate**

```bash
npm test && npm run build && node design-system/build.mjs
```
Expected: tests pass, build succeeds, 15 contrast pairs verified.

- [ ] **Step 3: Preview the production bundle locally**

Run: `npm run preview` and open the printed URL. Click through all six sections.

- [ ] **Step 4: Deploy to Cloud Run**

```bash
gcloud config set project legal-intelligence
gcloud run deploy autolaw \
  --source . \
  --region us-west1 \
  --allow-unauthenticated \
  --port 8080
```

- [ ] **Step 5: Verify the deployment**

```bash
curl -sI https://www.autolaw.ai | head -3
curl -s https://www.autolaw.ai | grep -c "Logoipsum" || echo "clean: no placeholder logos"
```
Expected: `HTTP/2 200`, and the grep reports clean.

- [ ] **Step 6: Tag the release**

```bash
git tag -a site-v2 -m "Site rebuild against the Autolaw design system"
git push origin main --tags
```

---

## Verification summary

| Requirement from the spec | Task |
|---|---|
| Tokens as single source, contrast verified numerically | 2, plus `design-system/build.mjs` |
| No fake logos, no test address, no stock photo, no raw Cloud Run host | 3, enforced; 13, resolved |
| Hero with eyebrow, outcome headline, dual CTA, trust strip | 7 |
| Transformation flow | 8 |
| Interactive chronology with document/page/excerpt | 9 |
| Body explorer | 10 |
| PI/WC toggle with distinct outputs | 11 |
| Trust comparison and control statements | 12 |
| Practice-specific conversion | 13 |
| WCAG AA, keyboard, reduced motion, responsive | 14 |
| Launch dependencies resolved before deploy | 15 |
