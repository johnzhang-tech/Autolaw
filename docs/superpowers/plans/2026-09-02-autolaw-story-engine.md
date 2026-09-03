# Autolaw Story Engine Implementation Plan (refresh, plan 1 of 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the top of the home page as one pinned, scroll-driven demonstration of one fictional matter — hero copy beside a stage that morphs through seven chapters — with a stacked static fallback, and simplify the nav to match.

**Architecture:** A `Story` section holds a two-column grid: the hero copy and seven chapter blocks on the left, a `position: sticky` `Stage` on the right. An `IntersectionObserver` hook picks the active chapter; `Stage` renders one of eight state components from a shared demo-data module. Under 900 px or reduced motion, the same state components render inline under each chapter with no pinning and no transitions. No animation library; transitions are CSS using the design-system duration tokens.

**Tech Stack:** React 18, Vite 6, TypeScript, Vitest + Testing Library, plain CSS on design tokens. Spec: `docs/superpowers/specs/2026-09-02-autolaw-site-refresh-design.md`.

## Global Constraints

- Every capability shown traces to `case-app` behaviour listed in the spec's "Product truth" table. Nothing from the Ask AL roadmap appears.
- The demo matter is the one in `src/data/demoCase.ts`: lumbar spine and left shoulder, workers' compensation, 214 documents, 1,880 pages. Every stage state carries "Sample data" visibly.
- Motion: one easing `var(--al-ease)`, durations only via `--al-duration-fast|base|slow` (240 ms ceiling), no stagger over 60 ms. `src/__tests__/a11y.test.tsx` reads the shipped CSS and fails on hard-coded durations.
- Reduced motion and widths below 900 px get the stacked layout: same eight states, no pinning, no transitions, nothing hidden.
- No text inside the stage below 12 px.
- "Schedule a call" is the only primary CTA. `TRIAL_ENABLED` stays `false`; `LOGIN_URL` stays `null`.
- Retired phrases (claim guard) plus four new ones: "suggested questions", "streaming", "generate documents", "Compute Action".
- Copy uses curly apostrophes in JSX string attributes (`’`), `&rsquo;` in JSX text.
- Commit after every task; `npm test` must be green at every commit.

**Spec deviation, decided here:** the spec said the pinned stage is `aria-hidden` from chapter 1 onward. That would hide focusable chronology buttons from assistive tech, which is an accessibility failure. Instead the pinned stage is a labelled region (`role="region"`, `aria-label`), never hidden, with no live announcements. Chapter text remains the primary narrative in reading order.

---

## File Structure

**Created**

| Path | Responsibility |
|---|---|
| `src/story/chapters.ts` | The seven chapters: id, heading, body. `ChapterIndex` type. |
| `src/story/useStoryMode.ts` | `'pinned' \| 'stacked'` from one media query. |
| `src/story/useActiveChapter.ts` | IntersectionObserver hook → active `ChapterIndex`. |
| `src/story/Stage.tsx` + `Stage.css` | The navy panel; renders one state per chapter; `InlineState` for stacked mode. |
| `src/story/ChapterList.tsx` | Eight-dot progress list with links; the keyboard path. |
| `src/story/Story.tsx` + `Story.css` | The section: grid, sticky column, chapter blocks, both modes. |
| `src/story/states/Signals.tsx` | State 0 (moved from `src/sections/SignalCockpit.tsx`). |
| `src/story/states/Arrival.tsx` | State 1. |
| `src/story/states/ChronologyState.tsx` | States 2–4: spine plus citation card, phase-driven. Exports `Spine`, `CitationCard`. |
| `src/story/states/AskPreview.tsx` | State 5. |
| `src/story/states/Review.tsx` | State 6. |
| `src/story/states/Output.tsx` | State 7. |
| `src/story/states/states.css` | Styles for all six state files (one sheet, they share vocabulary). |
| `src/navigation.ts` | `SITE_LINKS`, shared by nav and footer. |
| `src/test-utils/media.ts` | `mockMatchMedia`, `installFakeIntersectionObserver`. |
| tests under `src/story/__tests__/` | One file per unit. |

**Modified:** `src/data/demoCase.ts` (extended), `src/sections/Hero.tsx` + `Hero.css` (copy only, no stage), `src/sections/ProductExperience.tsx` (body explorer only, interim), `src/App.tsx`, `src/components/SiteNav.tsx` + `.css`, `src/components/SiteFooter.tsx`, `src/config.ts`, `src/__tests__/a11y.test.tsx`, `src/__tests__/claims.test.tsx`, tests for Hero, SiteNav, SiteFooter.

**Deleted:** `src/sections/Transformation.tsx` + `.css`, `src/sections/Chronology.tsx` + `.css`, `src/sections/SignalCockpit.tsx` + `.css`, `src/sections/__tests__/Chronology.test.tsx`, the `NavMenu` component and its tests.

---

### Task 1: Chapters and demo-data extension

**Files:**
- Create: `src/story/chapters.ts`, `src/story/__tests__/chapters.test.ts`
- Modify: `src/data/demoCase.ts`
- Test: `src/data/__tests__/demoCase.test.ts` (create)

**Interfaces:**
- Produces: `ChapterIndex`, `Chapter`, `CHAPTERS` from `chapters.ts`; `DOCUMENT_COUNT`, `ARRIVALS`, `ArrivalGroup`, `CONFLICT_COUNTERPART`, `ASK_AL_PREVIEW`, `CITATION_KINDS`, `REVIEW_ITEM`, `OUTPUT_ROWS`, `EXPORT_RULE`, `SAMPLE_MARK` from `demoCase.ts`; `ChronologyEvent.counterpart`.

- [ ] **Step 1: Write the failing tests**

`src/story/__tests__/chapters.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { CHAPTERS } from '../chapters';

describe('chapters', () => {
  it('numbers seven chapters 1 through 7 with unique ids', () => {
    expect(CHAPTERS.map((c) => c.index)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(new Set(CHAPTERS.map((c) => c.id)).size).toBe(7);
    CHAPTERS.forEach((c) => expect(c.id).toMatch(/^story-[a-z]+$/));
  });

  it('gives every chapter a heading and one paragraph', () => {
    CHAPTERS.forEach((c) => {
      expect(c.heading.length).toBeGreaterThan(8);
      expect(c.body.length).toBeGreaterThan(40);
      expect(c.body).not.toMatch(/\n/);
    });
  });
});
```

`src/data/__tests__/demoCase.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  ARRIVALS, DOCUMENT_COUNT, CASE_SUMMARY, CHRONOLOGY, CONFLICT_COUNTERPART,
  ASK_AL_PREVIEW, CITATION_KINDS, REVIEW_ITEM, OUTPUT_ROWS, EXPORT_RULE,
} from '../demoCase';

describe('demo case', () => {
  it('arrivals add up to the document count the summary states', () => {
    expect(ARRIVALS.reduce((n, g) => n + g.count, 0)).toBe(DOCUMENT_COUNT);
    expect(CASE_SUMMARY.meta).toContain(String(DOCUMENT_COUNT));
  });

  it('attaches the QME counterpart to the modified-duty event, and nowhere else', () => {
    const withCounterpart = CHRONOLOGY.filter((e) => e.counterpart);
    expect(withCounterpart).toHaveLength(1);
    expect(withCounterpart[0].title).toMatch(/modified duty/i);
    expect(withCounterpart[0].counterpart).toBe(CONFLICT_COUNTERPART);
  });

  it('cites the Ask AL preview only with kinds the product has', () => {
    ASK_AL_PREVIEW.chips.forEach((chip) => expect(CITATION_KINDS).toContain(chip.kind));
    const cited = ASK_AL_PREVIEW.answer.filter((s) => s.cite !== null).map((s) => s.cite);
    expect(cited).toEqual(ASK_AL_PREVIEW.chips.map((c) => c.n));
  });

  it('keeps the review item, output rows and export rule to what the product shows', () => {
    expect(REVIEW_ITEM.status).toBe('Needs review');
    expect(OUTPUT_ROWS.map((r) => r.label)).toEqual(['Source-linked chronology', 'Missing evidence', 'Claim readiness']);
    expect(EXPORT_RULE).toBe('A human-approved event is required before exporting.');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- chapters demoCase`
Expected: FAIL — cannot resolve `../chapters`; `ARRIVALS` is not exported.

- [ ] **Step 3: Create `src/story/chapters.ts`**

```ts
/**
 * The seven chapters of the story. Chapter 0 is the hero (state "Signals") and has no
 * block of its own. Ids double as anchor targets, so they must stay unique across the page.
 */
export type ChapterIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface Chapter {
  index: Exclude<ChapterIndex, 0>;
  id: string;
  heading: string;
  body: string;
}

export const CHAPTERS: ReadonlyArray<Chapter> = [
  {
    index: 1,
    id: 'story-arrives',
    heading: '214 documents, out of order',
    body: 'Records arrive continuously and never in sequence. Autolaw reads each one as it lands and files it by what it is, not by when it turned up.',
  },
  {
    index: 2,
    id: 'story-connected',
    heading: 'One timeline, every fact cited',
    body: 'Each event names the document, the page, and the sentence it came from. Select one and the source opens beside it.',
  },
  {
    index: 3,
    id: 'story-conflict',
    heading: 'Both records stay visible',
    body: 'The PTP released him to modified duty on 04/02. The QME on 04/18 says temporarily totally disabled. Autolaw does not pick a winner.',
  },
  {
    index: 4,
    id: 'story-missing',
    heading: 'Referenced, never produced',
    body: 'Two reports cite an MRI. No imaging report is in the file. Autolaw lists it as needed rather than inferring what it says.',
  },
  {
    index: 5,
    id: 'story-ask',
    heading: 'Answers only from the file',
    body: 'Ask a question and every sentence of the answer cites its source. Ask for what is not there and it says so.',
  },
  {
    index: 6,
    id: 'story-confirm',
    heading: 'An attorney decides',
    body: 'Autolaw proposes. It never writes case truth on its own. Date of injury, employer, and claim status carry statute-of-limitations consequences, so a person confirms each one.',
  },
  {
    index: 7,
    id: 'story-output',
    heading: 'What leaves the system',
    body: 'A chronology you can check, a list of what is missing, and a readiness score — exported only once a person has approved what is in it.',
  },
];
```

- [ ] **Step 4: Extend `src/data/demoCase.ts`**

At the top, after the file comment, add the count and change `CASE_SUMMARY.meta` to use it:

```ts
export const DOCUMENT_COUNT = 214;

/** Shown on every stage state; the figures are fictional and must always say so. */
export const SAMPLE_MARK = 'Sample data';

export const CASE_SUMMARY = {
  title: 'Demo case — lumbar & left shoulder',
  meta: `Workers' compensation · ${DOCUMENT_COUNT} documents · 1,880 pages`,
};
```

(Replace the existing `CASE_SUMMARY` block; keep `SIGNALS` as it is.)

Add `counterpart` to the `ChronologyEvent` interface, after `warning?`:

```ts
  /** The opposing source in a conflict, shown beneath this event's citation. */
  counterpart?: { source: string; page: string; quote: [string, string, string] };
```

Add, immediately before `export const CHRONOLOGY`, the counterpart constant:

```ts
/**
 * The QME's opposing finding on work status. Page 22 is where the QME addresses work
 * status; page 14 (cited on the QME event itself) is the imaging finding.
 */
export const CONFLICT_COUNTERPART = {
  source: 'QME report — Dr. A. Reyes',
  page: 'page 22',
  quote: [
    'On examination the claimant ',
    'remains temporarily totally disabled',
    ' pending orthopedic consultation.',
  ] as [string, string, string],
};
```

In the `CHRONOLOGY` array, on the event titled `'Released to modified duty'`, add `counterpart: CONFLICT_COUNTERPART,` after its `warning` block.

Append at the end of the file:

```ts
/* ---- Story states ---- */

export interface ArrivalGroup { label: string; count: number }

/** In arrival order, not date order — that is the point of chapter 1. Sums to DOCUMENT_COUNT. */
export const ARRIVALS: ReadonlyArray<ArrivalGroup> = [
  { label: 'QME report', count: 1 },
  { label: 'PTP reports', count: 9 },
  { label: 'Imaging order', count: 1 },
  { label: 'Wage records', count: 12 },
  { label: 'Billing', count: 38 },
  { label: 'Incident report', count: 1 },
  { label: 'UR letter', count: 1 },
  { label: 'Correspondence', count: 40 },
  { label: 'Claims administrator notices', count: 11 },
  { label: 'Prior claim records', count: 100 },
];

/** The product's citation-kind vocabulary, verbatim from case-app's citationDisplayTitle.ts. */
export const CITATION_KINDS = [
  'Timeline event',
  'Document excerpt',
  'Workers’ Comp fact',
  'Wage record',
  'Computed figure',
  'Medical encounter',
  'Clinical recommendation',
] as const;
export type CitationKind = (typeof CITATION_KINDS)[number];

export interface AnswerSentence { text: string; cite: number | null }
export interface CitationChip { n: number; kind: CitationKind; document: string; page: number }

export const ASK_AL_PREVIEW: {
  question: string;
  answer: ReadonlyArray<AnswerSentence>;
  chips: ReadonlyArray<CitationChip>;
} = {
  question: 'What are the current work restrictions?',
  answer: [
    { text: 'No lifting over 15 lb per the PTP on 04/02/2025', cite: 1 },
    { text: 'The QME on 04/18/2025 finds the claimant temporarily totally disabled', cite: 2 },
    { text: 'The two opinions conflict and are flagged for review.', cite: null },
  ],
  chips: [
    { n: 1, kind: 'Workers’ Comp fact', document: 'PTP report', page: 3 },
    { n: 2, kind: 'Document excerpt', document: 'QME report', page: 22 },
  ],
};

/** One fact in the review queue, in the queue's own vocabulary. */
export const REVIEW_ITEM = {
  title: 'Work restriction',
  value: 'No lifting over 15 lb',
  source: 'PTP report',
  page: 'p.3',
  status: 'Needs review',
  confidence: 92,
};

export const OUTPUT_ROWS: ReadonlyArray<{ label: string; value: string }> = [
  { label: 'Source-linked chronology', value: '5 events · 5 citations' },
  { label: 'Missing evidence', value: '1 · Needed: imaging report' },
  { label: 'Claim readiness', value: 'Developing' },
];

/** The product's own export tooltip, verbatim. */
export const EXPORT_RULE = 'A human-approved event is required before exporting.';
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test -- chapters demoCase`
Expected: PASS, 6 tests. Then `npm test` — everything else still green (the meta string is unchanged in content).

- [ ] **Step 6: Commit**

```bash
git add src/story/chapters.ts src/story/__tests__/chapters.test.ts src/data/demoCase.ts src/data/__tests__/demoCase.test.ts
git commit -m "Add the story chapters and the demo data the stage states read"
```

---

### Task 2: Media helpers and the two hooks

**Files:**
- Create: `src/test-utils/media.ts`, `src/story/useStoryMode.ts`, `src/story/useActiveChapter.ts`
- Test: `src/story/__tests__/useStoryMode.test.tsx`, `src/story/__tests__/useActiveChapter.test.tsx`

**Interfaces:**
- Produces: `useStoryMode(): StoryMode` where `type StoryMode = 'pinned' | 'stacked'`; `PINNED_QUERY: string`; `useActiveChapter(container: RefObject<HTMLElement | null>, enabled: boolean): ChapterIndex`; `CHAPTER_ROOT_MARGIN: string`; test helpers `mockMatchMedia(matches: boolean): void` and `installFakeIntersectionObserver(): typeof FakeIntersectionObserver`.

- [ ] **Step 1: Create `src/test-utils/media.ts`**

```ts
import { vi } from 'vitest';

/**
 * jsdom has no matchMedia. Components treat its absence as "stacked", which is the safe
 * default; tests that need the pinned layout install this with `matches: true`.
 */
export function mockMatchMedia(matches: boolean): void {
  const listeners = new Set<() => void>();
  const mql = {
    matches,
    media: '',
    onchange: null,
    addEventListener: (_: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
    addListener: (cb: () => void) => listeners.add(cb),
    removeListener: (cb: () => void) => listeners.delete(cb),
    dispatchEvent: () => true,
  };
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mql));
}

export interface FakeEntry {
  target: Element;
  isIntersecting: boolean;
  boundingClientRect?: { top: number };
}

/**
 * A stand-in for IntersectionObserver that records what it observes and lets a test fire
 * the callback with hand-built entries. `instances` is reset by each install.
 */
export class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  observed: Element[] = [];
  constructor(
    public cb: (entries: FakeEntry[]) => void,
    public options?: IntersectionObserverInit,
  ) {
    FakeIntersectionObserver.instances.push(this);
  }
  observe(el: Element) { this.observed.push(el); }
  unobserve() {}
  disconnect() { this.observed = []; }
  fire(entries: FakeEntry[]) {
    this.cb(entries.map((e) => ({ boundingClientRect: { top: 0 }, ...e })));
  }
}

export function installFakeIntersectionObserver(): typeof FakeIntersectionObserver {
  FakeIntersectionObserver.instances = [];
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  return FakeIntersectionObserver;
}
```

- [ ] **Step 2: Write the failing hook tests**

`src/story/__tests__/useStoryMode.test.tsx`:

```tsx
import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useStoryMode, PINNED_QUERY } from '../useStoryMode';
import { mockMatchMedia } from '../../test-utils/media';

afterEach(() => vi.unstubAllGlobals());

describe('useStoryMode', () => {
  it('is stacked when matchMedia does not exist, so nothing pins in an environment it cannot measure', () => {
    vi.stubGlobal('matchMedia', undefined);
    expect(renderHook(() => useStoryMode()).result.current).toBe('stacked');
  });

  it('is pinned only when the viewport is wide and motion is not reduced', () => {
    mockMatchMedia(true);
    expect(renderHook(() => useStoryMode()).result.current).toBe('pinned');
    expect(window.matchMedia).toHaveBeenCalledWith(PINNED_QUERY);
  });

  it('is stacked when the query does not match', () => {
    mockMatchMedia(false);
    expect(renderHook(() => useStoryMode()).result.current).toBe('stacked');
  });

  it('asks for both conditions in one query', () => {
    expect(PINNED_QUERY).toContain('min-width: 900px');
    expect(PINNED_QUERY).toContain('prefers-reduced-motion: no-preference');
  });
});
```

`src/story/__tests__/useActiveChapter.test.tsx`:

```tsx
import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRef } from 'react';
import { useActiveChapter, CHAPTER_ROOT_MARGIN } from '../useActiveChapter';
import { installFakeIntersectionObserver } from '../../test-utils/media';

function mount(enabled: boolean) {
  const root = document.createElement('div');
  for (let i = 1; i <= 7; i++) {
    const block = document.createElement('div');
    block.dataset.chapter = String(i);
    root.appendChild(block);
  }
  document.body.appendChild(root);
  const hook = renderHook(() => {
    const ref = useRef<HTMLElement | null>(root);
    return useActiveChapter(ref, enabled);
  });
  return { root, hook, block: (n: number) => root.children[n - 1] };
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('useActiveChapter', () => {
  it('starts at chapter 0 and observes every chapter block with the upper-third band', () => {
    const IO = installFakeIntersectionObserver();
    const { hook } = mount(true);
    expect(hook.result.current).toBe(0);
    expect(IO.instances).toHaveLength(1);
    expect(IO.instances[0].observed).toHaveLength(7);
    expect(IO.instances[0].options?.rootMargin).toBe(CHAPTER_ROOT_MARGIN);
  });

  it('activates the highest chapter currently in the band', () => {
    const IO = installFakeIntersectionObserver();
    const { hook, block } = mount(true);
    act(() => IO.instances[0].fire([{ target: block(2), isIntersecting: true }]));
    expect(hook.result.current).toBe(2);
    act(() => IO.instances[0].fire([{ target: block(3), isIntersecting: true }]));
    expect(hook.result.current).toBe(3);
    act(() => IO.instances[0].fire([{ target: block(3), isIntersecting: false }]));
    expect(hook.result.current).toBe(2);
  });

  it('holds the last chapter when nothing is in the band below the story, and returns to 0 above it', () => {
    const IO = installFakeIntersectionObserver();
    const { hook, block } = mount(true);
    act(() => IO.instances[0].fire([{ target: block(7), isIntersecting: true }]));
    act(() => IO.instances[0].fire([{ target: block(7), isIntersecting: false, boundingClientRect: { top: -900 } }]));
    expect(hook.result.current).toBe(7);
    // Scrolled back above chapter 1: its block is below the viewport top.
    act(() => IO.instances[0].fire([{ target: block(1), isIntersecting: false, boundingClientRect: { top: 400 } }]));
    expect(hook.result.current).toBe(0);
  });

  it('does nothing when disabled, and when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    expect(mount(true).hook.result.current).toBe(0);
    const IO = installFakeIntersectionObserver();
    expect(mount(false).hook.result.current).toBe(0);
    expect(IO.instances).toHaveLength(0);
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npm test -- useStoryMode useActiveChapter`
Expected: FAIL — cannot resolve the hook modules.

- [ ] **Step 4: Create `src/story/useStoryMode.ts`**

```ts
import { useEffect, useState } from 'react';

export type StoryMode = 'pinned' | 'stacked';

/**
 * One query, both conditions. The pinned layout needs room for two columns and it moves
 * the stage as you scroll, so a reduced-motion preference turns it off outright rather
 * than merely shortening its transitions.
 */
export const PINNED_QUERY = '(min-width: 900px) and (prefers-reduced-motion: no-preference)';

function read(): StoryMode {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'stacked';
  return window.matchMedia(PINNED_QUERY).matches ? 'pinned' : 'stacked';
}

export function useStoryMode(): StoryMode {
  const [mode, setMode] = useState<StoryMode>(read);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia(PINNED_QUERY);
    const onChange = () => setMode(mql.matches ? 'pinned' : 'stacked');
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return mode;
}
```

- [ ] **Step 5: Create `src/story/useActiveChapter.ts`**

```ts
import { useEffect, useState, type RefObject } from 'react';
import type { ChapterIndex } from './chapters';

/**
 * A chapter is active while its block crosses the band between 33% and 40% down the
 * viewport — roughly the upper third, where a reader's eye rests. Negative margins shrink
 * the observer's root to that band.
 */
export const CHAPTER_ROOT_MARGIN = '-33% 0px -60% 0px';

/**
 * Which chapter the reader is on. Observes every `[data-chapter]` descendant of
 * `container`. The highest chapter in the band wins, so a tall block that is still in
 * view does not pull the stage back while the next heading is being read. When nothing
 * is in the band the last value is kept — below chapter 7 the stage has unpinned anyway —
 * except when chapter 1 is still below the viewport top, which means the reader is back
 * in the hero and state 0 is right.
 */
export function useActiveChapter(
  container: RefObject<HTMLElement | null>,
  enabled: boolean,
): ChapterIndex {
  const [active, setActive] = useState<ChapterIndex>(0);

  useEffect(() => {
    if (!enabled) {
      setActive(0);
      return;
    }
    const root = container.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;

    const blocks = [...root.querySelectorAll<HTMLElement>('[data-chapter]')];
    const inBand = new Set<number>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const n = Number((entry.target as HTMLElement).dataset.chapter);
          if (entry.isIntersecting) inBand.add(n);
          else inBand.delete(n);
        }
        if (inBand.size > 0) {
          setActive(Math.max(...inBand) as ChapterIndex);
          return;
        }
        const first = entries.find((e) => (e.target as HTMLElement).dataset.chapter === '1');
        if (first && first.boundingClientRect.top > 0) setActive(0);
      },
      { rootMargin: CHAPTER_ROOT_MARGIN, threshold: 0 },
    );

    blocks.forEach((b) => io.observe(b));
    return () => io.disconnect();
  }, [container, enabled]);

  return active;
}
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npm test -- useStoryMode useActiveChapter`
Expected: PASS, 8 tests.

- [ ] **Step 7: Commit**

```bash
git add src/test-utils/media.ts src/story/useStoryMode.ts src/story/useActiveChapter.ts src/story/__tests__/useStoryMode.test.tsx src/story/__tests__/useActiveChapter.test.tsx
git commit -m "Add the story-mode and active-chapter hooks with fake media helpers"
```

---

### Task 3: Stage shell and the Signals state

**Files:**
- Create: `src/story/Stage.tsx`, `src/story/Stage.css`, `src/story/states/Signals.tsx`, `src/story/states/states.css`
- Test: `src/story/__tests__/Stage.test.tsx`
- (Leave `src/sections/SignalCockpit.tsx` in place until Task 8 deletes it; the Hero still imports it.)

**Interfaces:**
- Produces: `Stage({ chapter: ChapterIndex; animate?: boolean })` rendering `[data-testid="stage"][data-chapter]`; `StageState({ chapter })`; `InlineState({ chapter })` (wraps a state in the same panel, never animates); `Signals()` with `role="img"`. Every state root has `className="al-state"` and `data-testid="state-<name>"` where name ∈ `signals | arrival | chronology | ask | review | output`.
- Consumes: Task 1 data.

- [ ] **Step 1: Write the failing test**

`src/story/__tests__/Stage.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stage, InlineState } from '../Stage';
import type { ChapterIndex } from '../chapters';

const STATE_FOR: Record<ChapterIndex, string> = {
  0: 'signals', 1: 'arrival', 2: 'chronology', 3: 'chronology', 4: 'chronology',
  5: 'ask', 6: 'review', 7: 'output',
};

describe('Stage', () => {
  it('renders exactly one state per chapter', () => {
    for (const chapter of [0, 1, 2, 3, 4, 5, 6, 7] as ChapterIndex[]) {
      const { unmount } = render(<Stage chapter={chapter} />);
      expect(screen.getByTestId('stage')).toHaveAttribute('data-chapter', String(chapter));
      expect(screen.getAllByTestId(/^state-/)).toHaveLength(1);
      expect(screen.getByTestId(`state-${STATE_FOR[chapter]}`)).toBeInTheDocument();
      unmount();
    }
  });

  it('is a labelled region that is never hidden from assistive tech', () => {
    render(<Stage chapter={3} />);
    const stage = screen.getByRole('region', { name: /demonstration/i });
    expect(stage).not.toHaveAttribute('aria-hidden');
  });

  it('describes the signal panel as one image with the counts in its name', () => {
    render(<Stage chapter={0} />);
    expect(screen.getByRole('img', { name: /3 missing records/i })).toBeInTheDocument();
  });

  it('marks every state as sample data', () => {
    for (const chapter of [0, 1, 2, 5, 6, 7] as ChapterIndex[]) {
      const { unmount } = render(<Stage chapter={chapter} />);
      expect(screen.getAllByText(/sample data/i).length).toBeGreaterThan(0);
      unmount();
    }
  });

  it('animates only when asked, and never inline', () => {
    const { unmount } = render(<Stage chapter={1} />);
    expect(screen.getByTestId('stage')).toHaveClass('al-stage--live');
    unmount();
    render(<InlineState chapter={1} />);
    expect(screen.getByTestId('stage')).not.toHaveClass('al-stage--live');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- Stage`
Expected: FAIL — cannot resolve `../Stage`.

- [ ] **Step 3: Create `src/story/states/Signals.tsx`**

The body of `src/sections/SignalCockpit.tsx`, renamed, with the state wrapper:

```tsx
import { CASE_SUMMARY, SIGNALS, SAMPLE_MARK } from '../../data/demoCase';
import './states.css';

/** State 0. The hero's panel: case identity and the six signal tiles. */
export function Signals() {
  const label =
    `Demonstration case summary: ` +
    SIGNALS.map((s) => `${s.count} ${s.label.toLowerCase()}`).join(', ') + '.';

  return (
    <div className="al-state al-signals" data-testid="state-signals" role="img" aria-label={label}>
      <div className="al-state__top">
        <div>
          <div className="al-state__case">{CASE_SUMMARY.title}</div>
          <div className="al-state__meta">{CASE_SUMMARY.meta}</div>
        </div>
        <span className="al-state__mark">{SAMPLE_MARK}</span>
      </div>
      <div className="al-signals__tiles">
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

- [ ] **Step 4: Create `src/story/states/states.css`**

Shared vocabulary for all states. Only the parts Signals needs now; later tasks append to this file.

```css
/* ---- Shared by every stage state ---- */

.al-state { color: var(--al-ink-inverse); }

.al-state__top {
  display: flex; align-items: center; justify-content: space-between;
  gap: var(--al-space-3);
  padding-bottom: var(--al-space-3);
  border-bottom: 1px solid var(--al-hairline-inverse);
  margin-bottom: var(--al-space-3);
}
.al-state__case { color: #fff; font-size: var(--al-text-sm); font-weight: var(--al-weight-semibold); }
.al-state__meta { color: var(--al-ink-inverse-muted); font-size: var(--al-text-xs); margin-top: 2px; }
/* Muted, not teal: teal means "verified" everywhere else and this is a disclaimer. */
.al-state__mark {
  font-size: var(--al-text-xs); text-transform: uppercase; letter-spacing: var(--al-tracking-eyebrow);
  color: var(--al-ink-inverse-muted); font-weight: var(--al-weight-bold); white-space: nowrap;
}
.al-state__title { margin: 0 0 var(--al-space-3); color: #fff; font-size: var(--al-text-h3); }

/* ---- Signals (state 0) ---- */

.al-signals__tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--al-space-2); }
@media (max-width: 520px) { .al-signals__tiles { grid-template-columns: repeat(2, 1fr); } }

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
/* 12px floor: the old tiles used 11px labels. */
.al-tile__l { font-size: var(--al-text-xs); color: var(--al-ink-inverse-muted); margin-top: 6px; line-height: var(--al-leading-snug); }
```

- [ ] **Step 5: Create `src/story/Stage.tsx`**

Only `Signals` exists yet; the other cases render a placeholder **for this task only** and are replaced in Tasks 4–7. Each placeholder carries the correct test id so the Stage test passes now and the later tasks swap the body.

```tsx
import type { ChapterIndex } from './chapters';
import { Signals } from './states/Signals';
import { SAMPLE_MARK } from '../data/demoCase';
import './Stage.css';

interface StageProps {
  chapter: ChapterIndex;
  /** Entry transitions. Off for the inline (stacked) copies, which never change state. */
  animate?: boolean;
}

/**
 * The navy panel. Renders one state per chapter. A labelled region rather than
 * aria-hidden: it holds real controls in the chronology states, and hidden focusable
 * content is an accessibility failure. No live region either — the chapter text beside
 * it is the narrative, and announcing every transition would be noise.
 */
export function Stage({ chapter, animate = true }: StageProps) {
  return (
    <div
      className={`al-stage al-on-navy${animate ? ' al-stage--live' : ''}`}
      data-chapter={chapter}
      data-testid="stage"
      role="region"
      aria-label="Demonstration of one matter"
    >
      <StageState chapter={chapter} />
    </div>
  );
}

/** The inline copy used by the stacked layout: same panel, no transitions, no region role
 *  (the chapter heading above it is its label there). */
export function InlineState({ chapter }: { chapter: ChapterIndex }) {
  return (
    <div className="al-stage al-on-navy" data-chapter={chapter} data-testid="stage">
      <StageState chapter={chapter} />
    </div>
  );
}

function Placeholder({ name }: { name: string }) {
  return (
    <div className="al-state" data-testid={`state-${name}`}>
      <div className="al-state__top"><span className="al-state__mark">{SAMPLE_MARK}</span></div>
    </div>
  );
}

export function StageState({ chapter }: { chapter: ChapterIndex }) {
  switch (chapter) {
    case 0: return <Signals />;
    case 1: return <Placeholder name="arrival" />;
    case 2:
    case 3:
    case 4: return <Placeholder name="chronology" />;
    case 5: return <Placeholder name="ask" />;
    case 6: return <Placeholder name="review" />;
    case 7: return <Placeholder name="output" />;
  }
}
```

- [ ] **Step 6: Create `src/story/Stage.css`**

```css
.al-stage {
  background: var(--al-navy);
  border-radius: var(--al-radius-panel);
  padding: var(--al-space-5);
  box-shadow: var(--al-shadow-card);
  min-height: 440px;
}

/*
 * Entry transition, only on the live (pinned) stage. Duration and easing are tokens, so
 * reduced motion collapses this to 1ms at :root without a per-component opt-out — the
 * pinned stage does not render under reduced motion anyway, but the rule holds.
 */
.al-stage--live .al-state { animation: al-state-in var(--al-duration-slow) var(--al-ease) both; }
@keyframes al-state-in {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: none; }
}
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npm test -- Stage`
Expected: PASS, 5 tests. (The "sample data" check passes for placeholders because each carries the mark.)

- [ ] **Step 8: Commit**

```bash
git add src/story/Stage.tsx src/story/Stage.css src/story/states/Signals.tsx src/story/states/states.css src/story/__tests__/Stage.test.tsx
git commit -m "Add the Stage shell with the Signals state and placeholders for the rest"
```

---

### Task 4: Arrival state

**Files:**
- Create: `src/story/states/Arrival.tsx`
- Modify: `src/story/Stage.tsx` (case 1), `src/story/states/states.css` (append)
- Test: `src/story/__tests__/Arrival.test.tsx`

**Interfaces:**
- Produces: `Arrival()`; root `data-testid="state-arrival"`; the total count in `[data-testid="arrival-count"]`.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Arrival } from '../states/Arrival';
import { ARRIVALS, DOCUMENT_COUNT } from '../../data/demoCase';

afterEach(() => vi.useRealTimers());

describe('Arrival', () => {
  it('renders one chip per document group, in arrival order, with counts', () => {
    render(<Arrival />);
    const chips = screen.getAllByRole('listitem');
    expect(chips.map((c) => c.textContent)).toEqual(ARRIVALS.map((g) => `${g.label}${g.count > 1 ? ` ×${g.count}` : ''}`));
  });

  it('counts up to the document total and stops there', () => {
    vi.useFakeTimers();
    render(<Arrival />);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByTestId('arrival-count')).toHaveTextContent(String(DOCUMENT_COUNT));
  });

  it('labels the list for assistive tech and names the count', () => {
    render(<Arrival />);
    expect(screen.getByRole('list', { name: /documents by type/i })).toBeInTheDocument();
    expect(screen.getByText(/documents received/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- Arrival`
Expected: FAIL — cannot resolve `../states/Arrival`.

- [ ] **Step 3: Create `src/story/states/Arrival.tsx`**

The counter uses `requestAnimationFrame` over one `--al-duration-slow` (240 ms). jsdom polyfills rAF on timers, which is why the test uses fake timers. Under reduced motion the pinned stage does not render, and the inline copy shows the final number at once because the effect runs once and completes within the same tick budget.

```tsx
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
```

- [ ] **Step 4: Append to `src/story/states/states.css`**

```css
/* ---- Arrival (state 1) ---- */

.al-arrival__count {
  display: flex; align-items: baseline; gap: var(--al-space-2);
  font-size: 2.5rem; font-weight: var(--al-weight-bold); line-height: 1;
  color: var(--al-teal); font-variant-numeric: tabular-nums;
  margin-bottom: var(--al-space-4);
}
.al-arrival__of { font-size: var(--al-text-sm); color: var(--al-ink-inverse-muted); font-weight: var(--al-weight-medium); }

.al-arrival__chips { display: flex; flex-wrap: wrap; gap: var(--al-space-2); list-style: none; margin: 0; padding: 0; }
.al-arrival__chips li {
  font-size: var(--al-text-xs); padding: 6px 12px; border-radius: var(--al-radius-pill);
  background: var(--al-navy-raised); border: 1px solid var(--al-hairline-inverse);
  color: var(--al-ink-inverse);
}
/*
 * Chips land one after another. 40ms per chip is under the 60ms stagger ceiling; the
 * fade itself is the fast token. Only on the live stage — the inline copy is static.
 */
.al-stage--live .al-arrival__chips li {
  animation: al-chip-in var(--al-duration-fast) var(--al-ease) both;
  animation-delay: calc(var(--i, 0) * 40ms);
}
@keyframes al-chip-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
```

- [ ] **Step 5: Wire it into `Stage.tsx`**

Replace `case 1: return <Placeholder name="arrival" />;` with `case 1: return <Arrival />;` and add `import { Arrival } from './states/Arrival';`.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npm test -- Arrival Stage`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/story/states/Arrival.tsx src/story/states/states.css src/story/Stage.tsx src/story/__tests__/Arrival.test.tsx
git commit -m "Add the Arrival state: documents land in arrival order and the count ticks to 214"
```

---

### Task 5: Chronology state — spine, citation card, page facsimile, three phases

**Files:**
- Create: `src/story/states/ChronologyState.tsx`
- Modify: `src/story/Stage.tsx` (cases 2–4), `src/story/states/states.css` (append)
- Test: `src/story/__tests__/ChronologyState.test.tsx`

**Interfaces:**
- Produces: `type Phase = 'connected' | 'conflict' | 'missing'`; `phaseFor(chapter: 2 | 3 | 4): Phase`; `PHASE_EVENT: Record<Phase, number>` (index into `CHRONOLOGY`: connected → 0, conflict → 3, missing → 2); `ChronologyState({ phase })` root `data-testid="state-chronology"`; `Spine({ selected, onSelect, phase })`; `CitationCard({ event, phase })` with `data-testid="citation-card"`.
- Consumes: `CHRONOLOGY`, `CONFLICT_COUNTERPART`, `SAMPLE_MARK`, `SCHEDULE_URL`, `TRIAL_ENABLED`, `TRIAL_URL`, `Chip`.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChronologyState, phaseFor, PHASE_EVENT } from '../states/ChronologyState';
import { CHRONOLOGY } from '../../data/demoCase';
import { SCHEDULE_URL } from '../../config';

describe('ChronologyState', () => {
  it('maps chapters 2, 3, 4 to connected, conflict, missing', () => {
    expect([phaseFor(2), phaseFor(3), phaseFor(4)]).toEqual(['connected', 'conflict', 'missing']);
    expect(CHRONOLOGY[PHASE_EVENT.conflict].title).toMatch(/modified duty/i);
    expect(CHRONOLOGY[PHASE_EVENT.missing].title).toMatch(/MRI/);
  });

  it('lists every event in date order with a document and page citation line', () => {
    render(<ChronologyState phase="connected" />);
    const events = screen.getAllByRole('button', { expanded: false }).concat(screen.getAllByRole('button', { expanded: true }));
    expect(events).toHaveLength(CHRONOLOGY.length);
    CHRONOLOGY.forEach((e) => {
      expect(screen.getByText(`${e.source} · ${e.page}`)).toBeInTheDocument();
    });
  });

  it('opens the first event on connected and lets the reader select another', async () => {
    const user = userEvent.setup();
    render(<ChronologyState phase="connected" />);
    const card = screen.getByTestId('citation-card');
    // Event 0's source is the DWC-1 claim form (the demo data was corrected on 2026-08-05
    // to claim no more than its own sources say).
    expect(within(card).getByText(/DWC-1 claim form/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /qme evaluation/i }));
    expect(within(card).getByText(/4mm disc protrusion at L4–L5/)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { expanded: true })).toHaveLength(1);
  });

  it('on conflict, shows the PTP sentence on a page and the QME counterpart beneath it', () => {
    render(<ChronologyState phase="conflict" />);
    const card = screen.getByTestId('citation-card');
    expect(within(card).getByText(/may return to modified duty/)).toBeInTheDocument();
    expect(within(card).getByTestId('page-facsimile')).toBeInTheDocument();
    const counter = within(card).getByTestId('counterpart');
    expect(within(counter).getByText(/QME report — Dr\. A\. Reyes/)).toBeInTheDocument();
    expect(within(counter).getByText('page 22')).toBeInTheDocument();
    expect(within(counter).getByText(/remains temporarily totally disabled/)).toBeInTheDocument();
    expect(within(card).getByText(/does not pick a winner/i)).toBeInTheDocument();
  });

  it('on missing, names the needed document and no page to open', () => {
    render(<ChronologyState phase="missing" />);
    const card = screen.getByTestId('citation-card');
    expect(within(card).getByText(/referenced but never produced/i)).toBeInTheDocument();
    expect(within(card).getByText(/needed: imaging report/i)).toBeInTheDocument();
    expect(within(card).getByText(/needs review/i)).toBeInTheDocument();
    expect(within(card).queryByTestId('page-facsimile')).not.toBeInTheDocument();
  });

  it('follows a phase change by moving the selection, then yields to the reader again', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ChronologyState phase="connected" />);
    rerender(<ChronologyState phase="conflict" />);
    expect(screen.getByRole('button', { expanded: true })).toHaveAccessibleName(/modified duty/i);
    await user.click(screen.getByRole('button', { name: /initial evaluation/i }));
    expect(screen.getByRole('button', { expanded: true })).toHaveAccessibleName(/initial evaluation/i);
  });

  it('offers the call as the one live action while the trial is off', () => {
    render(<ChronologyState phase="connected" />);
    expect(screen.getByRole('link', { name: /on your own matter/i })).toHaveAttribute('href', SCHEDULE_URL);
    expect(screen.queryByRole('link', { name: /analyze one/i })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- ChronologyState`
Expected: FAIL — cannot resolve `../states/ChronologyState`.

- [ ] **Step 3: Create `src/story/states/ChronologyState.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { Chip } from '../../components/primitives/Chip';
import { CHRONOLOGY, SAMPLE_MARK, type ChronologyEvent } from '../../data/demoCase';
import { SCHEDULE_URL, TRIAL_ENABLED, TRIAL_URL } from '../../config';
import './states.css';

export type Phase = 'connected' | 'conflict' | 'missing';

export function phaseFor(chapter: 2 | 3 | 4): Phase {
  return chapter === 2 ? 'connected' : chapter === 3 ? 'conflict' : 'missing';
}

/** Which event each phase opens. Indexes into CHRONOLOGY, which is in date order. */
export const PHASE_EVENT: Record<Phase, number> = { connected: 0, conflict: 3, missing: 2 };

interface SpineProps {
  selected: number;
  onSelect: (i: number) => void;
  phase: Phase;
}

/** The timeline. Every event is a real button; the citation line is always visible. */
export function Spine({ selected, onSelect, phase }: SpineProps) {
  return (
    <ul className="al-spine" data-phase={phase}>
      {CHRONOLOGY.map((e, i) => (
        <li key={e.date + e.title} className={`al-ev al-ev--${e.tone}`}>
          <button type="button" aria-expanded={i === selected} onClick={() => onSelect(i)}>
            <span className="al-ev__date">{e.date}</span>
            <span className="al-ev__title">{e.title}</span>
            <span className="al-ev__cite">{e.source} · {e.page}</span>
            {e.flag && (
              <span className="al-ev__flag"><Chip tone="conflict">{e.flag}</Chip></span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}

/**
 * A page facsimile: the cited sentence set in the record face on a white page, with
 * faint rules standing in for the surrounding text. This is the site's rendering of what
 * the product does when a citation is opened — the page, with the passage highlighted.
 */
function PageFacsimile({ quote, page }: { quote: [string, string, string]; page: string }) {
  return (
    <div className="al-page" data-testid="page-facsimile">
      <div className="al-page__rules" aria-hidden="true"><i /><i /><i /></div>
      <p className="al-page__quote">
        {quote[0]}<mark>{quote[1]}</mark>{quote[2]}
      </p>
      <div className="al-page__rules" aria-hidden="true"><i /><i /></div>
      <span className="al-page__no">{page}</span>
    </div>
  );
}

export function CitationCard({ event, phase }: { event: ChronologyEvent; phase: Phase }) {
  return (
    <div className="al-cite al-on-canvas" data-testid="citation-card">
      <div className="al-cite__head">
        <span className="al-cite__src">{event.source}</span>
        <span className="al-cite__pg">{event.page}</span>
      </div>

      {event.warning && (
        <div className="al-cite__warn">
          <b>{event.warning.title}</b>
          {event.warning.body}
        </div>
      )}

      {event.quote && <PageFacsimile quote={event.quote} page={event.page} />}

      {event.counterpart && (
        <div className="al-cite__counter" data-testid="counterpart">
          <div className="al-cite__head">
            <span className="al-cite__src">{event.counterpart.source}</span>
            <span className="al-cite__pg">{event.counterpart.page}</span>
          </div>
          <p className="al-cite__quote">
            {event.counterpart.quote[0]}<mark>{event.counterpart.quote[1]}</mark>{event.counterpart.quote[2]}
          </p>
        </div>
      )}

      <dl className="al-cite__meta">
        {event.meta.map(([k, v]) => (
          <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
        ))}
        {event.confidence !== null && (
          <div>
            <dt>Extraction confidence</dt>
            <dd>
              <span className="al-conf"><span className="al-conf__fill" style={{ width: `${event.confidence}%` }} /></span>
              {event.confidence}%
            </dd>
          </div>
        )}
        {phase === 'missing' && (
          <div><dt>Review state</dt><dd>Needs review</dd></div>
        )}
      </dl>

      <div className="al-cite__actions">
        {/* Labels, not controls: what the product offers on a fact. "Confirm" and "Dismiss"
            are the review queue's own words. */}
        <ul className="al-cite__offers">
          <li>{event.action}</li>
          <li>Confirm</li>
          <li>Dismiss</li>
        </ul>
        {TRIAL_ENABLED ? (
          <a className="al-mini al-mini--go" href={TRIAL_URL}>Try this on one of your reports</a>
        ) : (
          <a className="al-mini al-mini--go" href={SCHEDULE_URL}>See it on your own matter</a>
        )}
      </div>
    </div>
  );
}

/**
 * States 2, 3 and 4 in one component so the spine's DOM persists across them and the
 * card genuinely rises out of the row that produced it. A phase change moves the
 * selection; a click moves it again. The phase does not fight the reader afterwards.
 */
export function ChronologyState({ phase }: { phase: Phase }) {
  const [selected, setSelected] = useState(PHASE_EVENT[phase]);

  useEffect(() => {
    setSelected(PHASE_EVENT[phase]);
  }, [phase]);

  const event = CHRONOLOGY[selected];

  return (
    <div className="al-state al-chron" data-testid="state-chronology" data-phase={phase}>
      <div className="al-state__top">
        <div>
          <div className="al-state__case">Medical chronology</div>
          <div className="al-state__meta">Select any event</div>
        </div>
        <span className="al-state__mark">{SAMPLE_MARK}</span>
      </div>
      <div className="al-chron__body">
        <Spine selected={selected} onSelect={setSelected} phase={phase} />
        <CitationCard event={event} phase={phase} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Append to `src/story/states/states.css`**

Lifted from `src/sections/Chronology.css` (which Task 8 deletes), with the page facsimile and counterpart added and the 11px sizes raised to the 12px floor.

```css
/* ---- Chronology (states 2–4) ---- */

.al-chron__body { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); gap: var(--al-space-4); }
@media (max-width: 860px) { .al-chron__body { grid-template-columns: minmax(0, 1fr); } }

.al-spine { list-style: none; margin: 0; padding: 0 0 0 var(--al-space-4); position: relative; }
.al-ev { position: relative; margin-bottom: 2px; }
/* Dot and rail share x=10; see the arithmetic in git history of Chronology.css. */
.al-ev::before {
  content: ""; position: absolute; left: -19px; top: 20px;
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--al-state-neutral); border: 2px solid var(--al-navy);
}
.al-ev::after {
  content: ""; position: absolute; left: -15px; top: 30px; bottom: -22px;
  width: 2px; background: var(--al-hairline-inverse);
}
.al-ev:last-child::after { content: none; }
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
/* In the conflict phase the two disagreeing rows carry the amber edge together. */
.al-spine[data-phase="conflict"] .al-ev:nth-child(4) button,
.al-spine[data-phase="conflict"] .al-ev:nth-child(5) button { border-color: var(--al-amber); }

.al-ev__date { display: block; font-size: var(--al-text-xs); color: var(--al-ink-inverse-muted); font-variant-numeric: tabular-nums; }
.al-ev__title { display: block; font-size: var(--al-text-sm); font-weight: var(--al-weight-semibold); margin-top: 2px; }
.al-ev__cite { display: block; font-size: var(--al-text-xs); color: var(--al-ink-inverse-muted); margin-top: 3px; text-decoration: underline dotted; text-underline-offset: 3px; }
.al-ev__flag { display: inline-block; margin-top: 6px; }
.al-ev__flag .al-chip--conflict {
  background: color-mix(in srgb, var(--al-amber) 30%, transparent);
  color: var(--al-amber-wash);
  border-color: transparent;
  font-size: var(--al-text-xs);
  padding: 2px 8px;
}

.al-cite {
  background: var(--al-surface); color: var(--al-ink);
  border-radius: var(--al-radius-card); padding: var(--al-space-4);
  align-self: start;
}
.al-cite__head {
  display: flex; justify-content: space-between; gap: var(--al-space-3);
  align-items: baseline; border-bottom: 1px solid var(--al-hairline);
  padding-bottom: var(--al-space-2); margin-bottom: var(--al-space-3);
}
.al-cite__src { font-size: var(--al-text-sm); font-weight: var(--al-weight-semibold); }
.al-cite__pg { font-size: var(--al-text-xs); color: var(--al-ink-muted); white-space: nowrap; }

.al-cite__warn {
  background: var(--al-amber-wash); color: var(--al-amber-text);
  border-radius: var(--al-radius-sm); padding: var(--al-space-3);
  font-size: var(--al-text-xs); margin-bottom: var(--al-space-3);
}
.al-cite__warn b { display: block; }

/* The page. Off-white, a shadow's worth of edge, faint rules for the text around the
   passage, and the passage itself in the record face. Rises out of the spine on the live
   stage; sits still inline. */
.al-page {
  position: relative;
  background: #FDFDFB; border: 1px solid var(--al-hairline);
  border-radius: 4px; padding: var(--al-space-3) var(--al-space-4);
  margin: 0 0 var(--al-space-3);
  box-shadow: 0 1px 0 rgba(19, 34, 46, 0.06), 0 6px 18px rgba(19, 34, 46, 0.08);
}
.al-page__rules { display: grid; gap: 6px; margin: 4px 0; }
.al-page__rules i { display: block; height: 4px; border-radius: 2px; background: var(--al-hairline); }
.al-page__rules i:nth-child(2) { width: 82%; }
.al-page__rules i:nth-child(3) { width: 64%; }
.al-page__quote {
  font-family: var(--al-font-record); font-size: var(--al-text-body);
  line-height: var(--al-leading-record); margin: var(--al-space-2) 0;
}
.al-page__quote mark, .al-cite__quote mark { background: var(--al-teal-wash); color: inherit; border-radius: 3px; padding: 1px 2px; }
.al-page__no { position: absolute; right: var(--al-space-3); bottom: 6px; font-size: var(--al-text-xs); color: var(--al-ink-muted); }
.al-stage--live .al-page { animation: al-page-in var(--al-duration-slow) var(--al-ease) both; }
@keyframes al-page-in { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: none; } }

.al-cite__counter {
  border-left: 3px solid var(--al-amber); padding-left: var(--al-space-3);
  margin: 0 0 var(--al-space-3);
}
.al-cite__counter .al-cite__head { border-bottom: 0; padding-bottom: 0; margin-bottom: var(--al-space-1); }
.al-cite__quote { font-family: var(--al-font-record); font-size: var(--al-text-sm); line-height: var(--al-leading-record); margin: 0; }

.al-cite__meta { display: grid; gap: var(--al-space-1); font-size: var(--al-text-xs); margin: 0 0 var(--al-space-3); }
.al-cite__meta > div { display: grid; grid-template-columns: 120px minmax(0, 1fr); gap: var(--al-space-3); }
.al-cite__meta dt { color: var(--al-ink-muted); }
.al-cite__meta dd { margin: 0; font-weight: var(--al-weight-medium); }
@media (max-width: 520px) {
  .al-cite__meta { gap: var(--al-space-2); }
  .al-cite__meta > div { grid-template-columns: minmax(0, 1fr); gap: 0; }
}

.al-conf {
  display: inline-block; width: 52px; height: 5px; border-radius: 3px;
  background: var(--al-hairline); overflow: hidden; vertical-align: middle; margin-right: 6px;
}
.al-conf__fill { display: block; height: 100%; background: var(--al-teal-text); }

.al-cite__actions {
  display: flex; gap: var(--al-space-3); flex-wrap: wrap;
  align-items: center; justify-content: space-between;
  border-top: 1px solid var(--al-hairline); padding-top: var(--al-space-3);
}
.al-cite__offers {
  display: flex; gap: var(--al-space-2); flex-wrap: wrap;
  list-style: none; margin: 0; padding: 0;
  font-size: var(--al-text-xs); color: var(--al-ink-muted);
}
.al-cite__offers li { display: inline-flex; align-items: center; }
.al-cite__offers li + li::before { content: "·"; margin-right: var(--al-space-2); color: var(--al-hairline-strong); }

.al-mini {
  font-size: var(--al-text-xs); font-weight: var(--al-weight-semibold);
  padding: 8px 14px; border-radius: var(--al-radius-pill);
  border: 1px solid var(--al-hairline-strong); background: transparent;
  cursor: pointer; font-family: var(--al-font-ui); text-decoration: none;
  transition:
    background-color var(--al-duration-fast) var(--al-ease),
    border-color var(--al-duration-fast) var(--al-ease),
    color var(--al-duration-fast) var(--al-ease);
}
.al-mini:hover { border-color: var(--al-ink); background: color-mix(in srgb, var(--al-ink) 3%, transparent); }
.al-mini--go { background: var(--al-navy); color: #fff; border-color: transparent; }
.al-mini--go:hover { background: var(--al-navy-raised); border-color: transparent; }
```

- [ ] **Step 5: Wire it into `Stage.tsx`**

Replace the three placeholder cases with:

```tsx
    case 2:
    case 3:
    case 4: return <ChronologyState key="chronology" phase={phaseFor(chapter)} />;
```

and add `import { ChronologyState, phaseFor } from './states/ChronologyState';`. The shared `key` keeps one instance across the three chapters.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npm test -- ChronologyState Stage`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/story/states/ChronologyState.tsx src/story/states/states.css src/story/Stage.tsx src/story/__tests__/ChronologyState.test.tsx
git commit -m "Add the Chronology state: spine, page facsimile, counterpart, three phases"
```

---

### Task 6: Ask AL preview state

**Files:**
- Create: `src/story/states/AskPreview.tsx`
- Modify: `src/story/Stage.tsx` (case 5), `src/story/states/states.css` (append)
- Test: `src/story/__tests__/AskPreview.test.tsx`

**Interfaces:**
- Produces: `AskPreview()`, root `data-testid="state-ask"`; `typeOut(full: string, ms: number, onTick: (s: string) => void): () => void` (exported helper, returns a cancel function).

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AskPreview } from '../states/AskPreview';
import { ASK_AL_PREVIEW, CITATION_KINDS } from '../../data/demoCase';

afterEach(() => vi.useRealTimers());

describe('AskPreview', () => {
  it('types the question in, then shows the whole answer with numbered markers', () => {
    vi.useFakeTimers();
    render(<AskPreview />);
    act(() => { vi.advanceTimersByTime(2000); });
    expect(screen.getByTestId('ask-question')).toHaveTextContent(ASK_AL_PREVIEW.question);
    const answer = screen.getByTestId('ask-answer');
    ASK_AL_PREVIEW.answer.forEach((s) => expect(answer).toHaveTextContent(s.text));
    expect(answer.querySelectorAll('sup')).toHaveLength(2);
  });

  it('renders one chip per citation, each naming a kind the product has, a document, and a page', () => {
    vi.useFakeTimers();
    render(<AskPreview />);
    act(() => { vi.advanceTimersByTime(2000); });
    const chips = screen.getAllByTestId('ask-chip');
    expect(chips).toHaveLength(ASK_AL_PREVIEW.chips.length);
    chips.forEach((chip, i) => {
      const c = ASK_AL_PREVIEW.chips[i];
      expect(CITATION_KINDS).toContain(c.kind);
      expect(chip).toHaveTextContent(c.kind);
      expect(chip).toHaveTextContent(c.document);
      expect(chip).toHaveTextContent(`pg. ${c.page}`);
    });
  });

  it('uses the name the application uses, and promises nothing from the roadmap', () => {
    render(<AskPreview />);
    expect(screen.getByText(/^Ask AL$/)).toBeInTheDocument();
    const text = screen.getByTestId('state-ask').textContent ?? '';
    expect(text).not.toMatch(/suggested questions|streaming|generate documents|compute action/i);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- AskPreview`
Expected: FAIL — cannot resolve `../states/AskPreview`.

- [ ] **Step 3: Create `src/story/states/AskPreview.tsx`**

```tsx
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
```

- [ ] **Step 4: Append to `src/story/states/states.css`**

```css
/* ---- Ask AL preview (state 5) ---- */

.al-ask__input {
  display: flex; align-items: center; gap: var(--al-space-2);
  background: var(--al-navy-raised); border: 1px solid var(--al-hairline-inverse);
  border-radius: var(--al-radius-pill); padding: 10px 10px 10px var(--al-space-3);
  margin-bottom: var(--al-space-3);
}
.al-ask__q { flex: 1; font-size: var(--al-text-sm); color: #fff; min-height: 1.4em; }
.al-ask__caret { display: inline-block; width: 1px; height: 1em; background: var(--al-teal); vertical-align: -2px; margin-left: 2px; }
.al-ask__go {
  background: var(--al-teal); color: var(--al-navy); font-weight: var(--al-weight-bold);
  font-size: var(--al-text-xs); border-radius: var(--al-radius-pill); padding: 6px 12px; white-space: nowrap;
}

.al-ask__answer { opacity: 0; transition: opacity var(--al-duration-base) var(--al-ease); }
.al-ask__answer.is-in { opacity: 1; }
.al-ask__answer p {
  margin: 0 0 var(--al-space-3); background: var(--al-navy-raised);
  border-radius: var(--al-radius-card); padding: var(--al-space-3);
  font-size: var(--al-text-sm); line-height: var(--al-leading-normal); color: #fff;
}
.al-ask__answer sup { color: var(--al-teal); font-weight: var(--al-weight-bold); font-size: 0.75em; margin-left: 2px; }

.al-ask__chips { display: flex; flex-wrap: wrap; gap: var(--al-space-2); list-style: none; margin: 0; padding: 0; }
.al-ask__chips li {
  display: inline-flex; align-items: center; gap: var(--al-space-2);
  font-size: var(--al-text-xs); color: var(--al-ink-inverse);
  border: 1px solid var(--al-hairline-inverse); border-radius: var(--al-radius-pill); padding: 4px 10px 4px 6px;
}
.al-ask__chips b {
  display: inline-grid; place-items: center; width: 18px; height: 18px; border-radius: 50%;
  background: var(--al-teal); color: var(--al-navy); font-size: 11px;
}
.al-ask__chips span + span::before { content: "·"; margin-right: var(--al-space-2); color: var(--al-ink-inverse-muted); }
```

(The 11px on the chip index digit is inside an 18px disc and is a numeral, not running text; the 12px floor applies to text.)

- [ ] **Step 5: Wire it into `Stage.tsx`**

Replace `case 5: return <Placeholder name="ask" />;` with `case 5: return <AskPreview />;` and add the import.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npm test -- AskPreview Stage`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/story/states/AskPreview.tsx src/story/states/states.css src/story/Stage.tsx src/story/__tests__/AskPreview.test.tsx
git commit -m "Add the Ask AL preview state: one typed question, one cited answer"
```

---

### Task 7: Review and Output states

**Files:**
- Create: `src/story/states/Review.tsx`, `src/story/states/Output.tsx`
- Modify: `src/story/Stage.tsx` (cases 6, 7; remove `Placeholder`), `src/story/states/states.css` (append)
- Test: `src/story/__tests__/ReviewOutput.test.tsx`

**Interfaces:**
- Produces: `Review()` root `data-testid="state-review"`; `Output()` root `data-testid="state-output"`.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Review } from '../states/Review';
import { Output } from '../states/Output';
import { REVIEW_ITEM, OUTPUT_ROWS, EXPORT_RULE } from '../../data/demoCase';

describe('Review', () => {
  it('shows one fact awaiting a person, with the queue’s own labels and no live controls', () => {
    render(<Review />);
    expect(screen.getByText(REVIEW_ITEM.title)).toBeInTheDocument();
    expect(screen.getByText(REVIEW_ITEM.value)).toBeInTheDocument();
    expect(screen.getByText(`${REVIEW_ITEM.source} · ${REVIEW_ITEM.page}`)).toBeInTheDocument();
    expect(screen.getByText('Needs review')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Dismiss')).toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toEqual([]);
  });

  it('labels the confidence as extraction confidence, with the number', () => {
    render(<Review />);
    expect(screen.getByText(/extraction confidence/i)).toBeInTheDocument();
    expect(screen.getByText(`${REVIEW_ITEM.confidence}%`)).toBeInTheDocument();
  });
});

describe('Output', () => {
  it('lists the three outputs and states the export rule verbatim', () => {
    render(<Output />);
    OUTPUT_ROWS.forEach((r) => {
      expect(screen.getByText(r.label)).toBeInTheDocument();
      expect(screen.getByText(r.value)).toBeInTheDocument();
    });
    expect(screen.getByText(EXPORT_RULE)).toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- ReviewOutput`
Expected: FAIL — modules not found.

- [ ] **Step 3: Create `src/story/states/Review.tsx`**

```tsx
import { REVIEW_ITEM, SAMPLE_MARK } from '../../data/demoCase';
import './states.css';

/** State 6. The review queue with one fact in it. Buttons are labels here: nothing on this
 *  page confirms anything, and a focusable inert "Confirm" would be a lie. */
export function Review() {
  return (
    <div className="al-state al-review" data-testid="state-review">
      <div className="al-state__top">
        <div>
          <div className="al-state__case">Review queue</div>
          <div className="al-state__meta">Needs review · 1</div>
        </div>
        <span className="al-state__mark">{SAMPLE_MARK}</span>
      </div>

      <div className="al-review__item">
        <div className="al-review__row">
          <span className="al-review__status">{REVIEW_ITEM.status}</span>
          <span className="al-review__cite">{REVIEW_ITEM.source} · {REVIEW_ITEM.page}</span>
        </div>
        <b className="al-review__title">{REVIEW_ITEM.title}</b>
        <p className="al-review__value">{REVIEW_ITEM.value}</p>
        <div className="al-review__conf">
          <span>Extraction confidence</span>
          <span className="al-conf al-conf--inverse"><span className="al-conf__fill" style={{ width: `${REVIEW_ITEM.confidence}%` }} /></span>
          <span>{REVIEW_ITEM.confidence}%</span>
        </div>
        <div className="al-review__actions" aria-label="What the reviewer can do">
          <span className="al-review__btn al-review__btn--go">Confirm</span>
          <span className="al-review__btn">Dismiss</span>
        </div>
      </div>

      <p className="al-review__note">
        Nothing above is in the case yet. It becomes a fact when a person presses Confirm.
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/story/states/Output.tsx`**

```tsx
import { OUTPUT_ROWS, EXPORT_RULE, SAMPLE_MARK } from '../../data/demoCase';
import './states.css';

/** State 7. What the firm takes away, and the rule that gates the export. */
export function Output() {
  return (
    <div className="al-state al-output" data-testid="state-output">
      <div className="al-state__top">
        <div>
          <div className="al-state__case">Work product</div>
          <div className="al-state__meta">Every line traceable to a page</div>
        </div>
        <span className="al-state__mark">{SAMPLE_MARK}</span>
      </div>

      <ul className="al-output__rows">
        {OUTPUT_ROWS.map((r) => (
          <li key={r.label}>
            <b>{r.label}</b>
            <span>{r.value}</span>
          </li>
        ))}
      </ul>

      <div className="al-output__export">
        <span className="al-review__btn al-review__btn--go" aria-hidden="true">Export DOCX</span>
        <p>{EXPORT_RULE}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Append to `src/story/states/states.css`**

```css
/* ---- Review (state 6) ---- */

.al-review__item {
  background: var(--al-navy-raised); border-radius: var(--al-radius-card);
  padding: var(--al-space-3); border-left: 3px solid var(--al-amber);
}
.al-review__row { display: flex; justify-content: space-between; gap: var(--al-space-3); align-items: baseline; margin-bottom: var(--al-space-2); }
.al-review__status {
  font-size: var(--al-text-xs); font-weight: var(--al-weight-bold);
  color: var(--al-amber-wash); background: color-mix(in srgb, var(--al-amber) 30%, transparent);
  border-radius: var(--al-radius-pill); padding: 2px 8px;
}
.al-review__cite { font-size: var(--al-text-xs); color: var(--al-ink-inverse-muted); text-decoration: underline dotted; text-underline-offset: 3px; }
.al-review__title { display: block; font-size: var(--al-text-sm); color: #fff; }
.al-review__value { margin: 2px 0 var(--al-space-3); font-size: var(--al-text-body); color: #fff; }
.al-review__conf { display: flex; align-items: center; gap: var(--al-space-2); font-size: var(--al-text-xs); color: var(--al-ink-inverse-muted); margin-bottom: var(--al-space-3); }
.al-conf--inverse { background: var(--al-hairline-inverse); }
.al-conf--inverse .al-conf__fill { background: var(--al-teal); }

.al-review__actions { display: flex; gap: var(--al-space-2); }
/* Rendered as pills, never as <button>: see Review.tsx. */
.al-review__btn {
  font-size: var(--al-text-xs); font-weight: var(--al-weight-semibold);
  padding: 8px 14px; border-radius: var(--al-radius-pill);
  border: 1px solid var(--al-hairline-inverse); color: #fff;
}
.al-review__btn--go { background: var(--al-teal); color: var(--al-navy); border-color: transparent; }
.al-review__note { margin: var(--al-space-3) 0 0; font-size: var(--al-text-xs); color: var(--al-ink-inverse-muted); }

/* ---- Output (state 7) ---- */

.al-output__rows { list-style: none; margin: 0 0 var(--al-space-4); padding: 0; display: grid; gap: var(--al-space-2); }
.al-output__rows li {
  display: flex; justify-content: space-between; gap: var(--al-space-3); align-items: baseline;
  background: var(--al-navy-raised); border-radius: var(--al-radius-sm);
  border-left: 3px solid var(--al-teal); padding: 10px 12px;
  font-size: var(--al-text-sm);
}
.al-output__rows li:nth-child(2) { border-left-color: var(--al-amber); }
.al-output__rows b { color: #fff; }
.al-output__rows span { color: var(--al-ink-inverse-muted); font-size: var(--al-text-xs); text-align: right; }

.al-output__export { display: flex; align-items: center; gap: var(--al-space-3); flex-wrap: wrap; }
.al-output__export .al-review__btn--go { opacity: 0.55; }
.al-output__export p { margin: 0; font-size: var(--al-text-xs); color: var(--al-ink-inverse-muted); }
```

- [ ] **Step 6: Wire both into `Stage.tsx` and delete `Placeholder`**

Cases 6 and 7 render `<Review />` and `<Output />`; add the two imports; remove the `Placeholder` function and the `SAMPLE_MARK` import from `Stage.tsx`.

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npm test -- ReviewOutput Stage`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/story/states/Review.tsx src/story/states/Output.tsx src/story/states/states.css src/story/Stage.tsx src/story/__tests__/ReviewOutput.test.tsx
git commit -m "Add the Review and Output states; Stage now renders all eight"
```

---

### Task 8: The Story section, hero rebalance, and page assembly

**Files:**
- Create: `src/story/Story.tsx`, `src/story/Story.css`, `src/story/ChapterList.tsx`
- Modify: `src/sections/Hero.tsx`, `src/sections/Hero.css`, `src/sections/ProductExperience.tsx`, `src/App.tsx`, `src/config.ts`
- Delete: `src/sections/Transformation.tsx`, `src/sections/Transformation.css`, `src/sections/Chronology.tsx`, `src/sections/Chronology.css`, `src/sections/SignalCockpit.tsx`, `src/sections/SignalCockpit.css`, `src/sections/__tests__/Chronology.test.tsx`
- Test: `src/story/__tests__/Story.test.tsx`, modify `src/sections/__tests__/Hero.test.tsx`

**Interfaces:**
- Produces: `Story()` — `<section id="story">`; chapter blocks `li[id][data-chapter]`; `ChapterList({ active })` — `role="group"` named "Story chapters", eight links, `aria-current="step"` on the active one.
- Consumes: everything above; `HOW_IT_WORKS_URL` changes to `'/#story-arrives'`.

- [ ] **Step 1: Write the failing tests**

`src/story/__tests__/Story.test.tsx`:

```tsx
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, within, act } from '@testing-library/react';
import { Story } from '../Story';
import { CHAPTERS } from '../chapters';
import { mockMatchMedia, installFakeIntersectionObserver } from '../../test-utils/media';

afterEach(() => vi.unstubAllGlobals());

describe('Story — stacked (default in jsdom, and under reduced motion or a narrow viewport)', () => {
  it('renders the hero copy, the signal panel, and every chapter with its state inline', () => {
    vi.stubGlobal('matchMedia', undefined);
    render(<Story />);
    expect(screen.getByRole('heading', { level: 1, name: /know where every fact came from/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /3 missing records/i })).toBeInTheDocument();
    CHAPTERS.forEach((c) => {
      const block = document.getElementById(c.id)!;
      expect(block).toHaveAttribute('data-chapter', String(c.index));
      expect(within(block).getByRole('heading', { level: 3, name: c.heading })).toBeInTheDocument();
      expect(within(block).getAllByTestId('stage')).toHaveLength(1);
    });
    expect(screen.queryByRole('group', { name: /story chapters/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /demonstration/i })).not.toBeInTheDocument();
  });

  it('renders no pinned copy, so nothing on the page moves', () => {
    mockMatchMedia(false);
    render(<Story />);
    expect(document.querySelectorAll('.al-stage--live')).toHaveLength(0);
  });
});

describe('Story — pinned', () => {
  it('renders one live stage, the chapter list, and no inline states', () => {
    mockMatchMedia(true);
    installFakeIntersectionObserver();
    render(<Story />);
    expect(screen.getAllByTestId('stage')).toHaveLength(1);
    expect(screen.getByRole('region', { name: /demonstration/i })).toHaveClass('al-stage--live');
    const list = screen.getByRole('group', { name: /story chapters/i });
    const links = within(list).getAllByRole('link');
    expect(links).toHaveLength(8);
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['#story', ...CHAPTERS.map((c) => `#${c.id}`)]);
    expect(links[0]).toHaveAttribute('aria-current', 'step');
  });

  it('moves the stage and the current marker as chapters enter the band', () => {
    mockMatchMedia(true);
    const IO = installFakeIntersectionObserver();
    render(<Story />);
    const block = document.getElementById(CHAPTERS[2].id)!;
    act(() => IO.instances[0].fire([{ target: block, isIntersecting: true }]));
    expect(screen.getByTestId('stage')).toHaveAttribute('data-chapter', '3');
    const list = screen.getByRole('group', { name: /story chapters/i });
    expect(within(list).getAllByRole('link')[3]).toHaveAttribute('aria-current', 'step');
    expect(block).toHaveAttribute('data-active');
  });

  it('is a labelled section whose first heading after the h1 is the hidden h2', () => {
    mockMatchMedia(true);
    installFakeIntersectionObserver();
    render(<Story />);
    const section = screen.getByRole('region', { name: /how autolaw works/i });
    const headings = within(section).getAllByRole('heading');
    expect(headings[0].tagName).toBe('H1');
    expect(headings[1].tagName).toBe('H2');
  });
});
```

Update `src/sections/__tests__/Hero.test.tsx`: replace the H1 test's pattern with `/know where every fact came from/i`; change the `HOW_IT_WORKS_URL` assertion's expected href to the imported constant (unchanged code, new value); delete the test titled "gives the cockpit a single descriptive label rather than bare numbers" (it moved to `Story.test.tsx`).

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- Story Hero`
Expected: FAIL — `../Story` not found; Hero H1 mismatch.

- [ ] **Step 3: Change `HOW_IT_WORKS_URL` in `src/config.ts`**

```ts
/** The hero's secondary control. Points at chapter 1, not the section top — the hero is
 *  inside the story section, so "#story" would scroll nowhere. */
export const HOW_IT_WORKS_URL = '/#story-arrives';
```

- [ ] **Step 4: Rewrite `src/sections/Hero.tsx` as copy only**

```tsx
import { Button } from '../components/primitives/Button';
import { TRIAL_ENABLED, TRIAL_URL, SCHEDULE_URL, HOW_IT_WORKS_URL, WALKTHROUGH_URL } from '../config';
import '../components/primitives/Section.css';
import './Hero.css';

const TRUST = [
  'Source-linked evidence',
  'Attorney confirms every fact',
  'SOC 2 Type II',
  'BAA on request',
];

function Tick() {
  return (
    <svg className="al-hero__tick" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2 6.5l2.5 2.5L10 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Copy only. The stage beside it belongs to Story, which owns the grid so the same panel
 * can pin through the chapters below. One-sentence H1 so the stage is the second thing a
 * visitor sees rather than the fifth; the old headline lives on in <title> and og:title.
 */
export function Hero() {
  return (
    <div className="al-hero">
      <p className="al-sec__eyebrow">
        Case intelligence for personal injury &amp; workers&rsquo; compensation firms
      </p>
      <h1 className="al-hero__title">Know where every fact came from.</h1>
      <p className="al-hero__sub">
        Autolaw reads the medical records, expert reports, and case documents in a file and
        builds one connected case file. Every fact cites its document, page, and sentence.
        Where two records disagree, you see both.
      </p>
      <div className="al-hero__ctas">
        <Button href={SCHEDULE_URL} variant="primary" size="lg" withCaret>
          Schedule a call
        </Button>
        <Button href={HOW_IT_WORKS_URL} variant="secondary" size="lg">
          See how it works
        </Button>
        {TRIAL_ENABLED && (
          <Button href={TRIAL_URL} variant="secondary" size="lg">
            Analyze one report
          </Button>
        )}
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
  );
}
```

- [ ] **Step 5: Trim `src/sections/Hero.css`**

Delete the `.al-hero__grid` rule and its media query (the grid moves to `Story.css`). Keep everything from `.al-hero__title` down unchanged.

- [ ] **Step 6: Create `src/story/ChapterList.tsx`**

```tsx
import { CHAPTERS, type ChapterIndex } from './chapters';
import './Story.css';

/**
 * Progress and the keyboard path in one. Eight links — the hero plus seven chapters —
 * with hidden labels, so a screen reader hears "3. Both records stay visible" and a
 * sighted reader sees a dot. A group, not a <nav>: the page has one navigation landmark
 * and this is not it.
 */
export function ChapterList({ active }: { active: ChapterIndex }) {
  const items: Array<{ href: string; label: string; index: ChapterIndex }> = [
    { href: '#story', label: 'Start: the case as it is', index: 0 },
    ...CHAPTERS.map((c) => ({ href: `#${c.id}`, label: `${c.index}. ${c.heading}`, index: c.index })),
  ];
  return (
    <div className="al-chapters" role="group" aria-label="Story chapters">
      <ol>
        {items.map((it) => (
          <li key={it.href}>
            <a href={it.href} aria-current={active === it.index ? 'step' : undefined}>
              <span className="al-visually-hidden">{it.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
```

- [ ] **Step 7: Create `src/story/Story.tsx`**

```tsx
import { useRef } from 'react';
import { Hero } from '../sections/Hero';
import { CHAPTERS } from './chapters';
import { Stage, InlineState } from './Stage';
import { ChapterList } from './ChapterList';
import { useStoryMode } from './useStoryMode';
import { useActiveChapter } from './useActiveChapter';
import './Story.css';

/**
 * The top of the home page: hero copy, then seven chapters, beside one stage that pins
 * and changes as the chapters pass. One grid holds both columns so the stage can stay
 * put from the first paint to chapter 7.
 *
 * Stacked mode (narrow, or reduced motion, or no matchMedia): no sticky column, no
 * observer, no transitions. The same state components render inline under each chapter.
 */
export function Story() {
  const mode = useStoryMode();
  const grid = useRef<HTMLDivElement>(null);
  const active = useActiveChapter(grid, mode === 'pinned');
  const pinned = mode === 'pinned';

  return (
    <section
      id="story"
      className="al-section al-story"
      aria-labelledby="story-heading"
      data-mode={mode}
      tabIndex={-1}
    >
      <div className="al-container al-story__grid" ref={grid}>
        <div className="al-story__copy">
          <Hero />
          <h2 id="story-heading" className="al-visually-hidden">How Autolaw works, on one matter</h2>

          {!pinned && (
            <div className="al-story__inline"><Stage chapter={0} animate={false} /></div>
          )}

          <ol className="al-story__chapters">
            {CHAPTERS.map((c) => (
              <li
                key={c.id}
                id={c.id}
                data-chapter={c.index}
                data-active={pinned && active === c.index ? '' : undefined}
                className="al-chapter"
              >
                <p className="al-chapter__n">Chapter {c.index}</p>
                <h3 className="al-chapter__h">{c.heading}</h3>
                <p className="al-chapter__p">{c.body}</p>
                {!pinned && (
                  <div className="al-story__inline"><InlineState chapter={c.index} /></div>
                )}
              </li>
            ))}
          </ol>
        </div>

        {pinned && (
          <div className="al-story__stage">
            <ChapterList active={active} />
            <Stage chapter={active} />
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 8: Create `src/story/Story.css`**

```css
/* Focus lands here from "See how it works" and the skip-to-chapter links; the scroll is
   the feedback, a ring around the whole section is noise. */
#story:focus { outline: none; box-shadow: none; }

.al-story__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: var(--al-space-7);
  align-items: start;
}
.al-story[data-mode="stacked"] .al-story__grid { grid-template-columns: minmax(0, 1fr); }

/*
 * The pinned column. Sticky, not fixed: it scrolls with the page until it reaches the
 * offset, holds while its grid area is taller than it, and leaves with the grid. Nothing
 * intercepts the wheel. The 55% cap is the spec's: the stage never dominates the copy.
 */
.al-story__stage {
  position: sticky;
  top: calc(var(--al-nav-height) + var(--al-space-4));
  align-self: start;
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr);
  gap: var(--al-space-3);
  max-width: 55vw;
}

.al-story__copy > .al-hero { padding-bottom: var(--al-space-8); }

.al-story__chapters { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--al-space-8); }
.al-story[data-mode="stacked"] .al-story__chapters { gap: var(--al-space-6); }

.al-chapter { border-left: 2px solid var(--al-hairline); padding-left: var(--al-space-4); transition: border-color var(--al-duration-base) var(--al-ease); }
.al-chapter[data-active] { border-left-color: var(--al-teal-text); }
.al-chapter__n {
  margin: 0 0 var(--al-space-2);
  font-size: var(--al-text-xs); font-weight: var(--al-weight-bold);
  letter-spacing: var(--al-tracking-eyebrow); text-transform: uppercase; color: var(--al-teal-text);
}
.al-chapter__h {
  margin: 0 0 var(--al-space-2);
  font-size: var(--al-text-h2); font-weight: var(--al-weight-bold);
  line-height: var(--al-leading-snug); letter-spacing: var(--al-tracking-display);
  text-wrap: balance;
}
.al-chapter__p { margin: 0; font-size: var(--al-text-body-lg); color: var(--al-ink-muted); max-width: 48ch; }
/* Dim what is not current, so the eye lands where the stage is looking. Colour carries
   nothing the border and the chapter list do not also carry. */
.al-story[data-mode="pinned"] .al-chapter:not([data-active]) .al-chapter__h,
.al-story[data-mode="pinned"] .al-chapter:not([data-active]) .al-chapter__p { opacity: 0.55; transition: opacity var(--al-duration-base) var(--al-ease); }

.al-story__inline { margin-top: var(--al-space-4); }

/* ---- chapter list: eight dots ---- */
.al-chapters ol { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; align-content: start; padding-top: var(--al-space-2); }
.al-chapters a {
  display: block; width: 20px; height: 20px; border-radius: 50%; position: relative;
}
.al-chapters a::before {
  content: ""; position: absolute; inset: 6px; border-radius: 50%;
  background: var(--al-hairline-strong);
  transition: background-color var(--al-duration-fast) var(--al-ease), transform var(--al-duration-fast) var(--al-ease);
}
.al-chapters a[aria-current="step"]::before { background: var(--al-teal-text); transform: scale(1.35); }
.al-chapters a:hover::before { background: var(--al-ink); }
```

- [ ] **Step 9: Reduce `src/sections/ProductExperience.tsx` to the body explorer (interim, until plan 2 moves it into Solutions)**

```tsx
import { Section } from '../components/primitives/Section';
import { BodyExplorer } from './BodyExplorer';
import './ProductExperience.css';

export function ProductExperience() {
  return (
    <Section
      id="products"
      eyebrow="Body parts"
      heading="Accepted, disputed, and undocumented — from the record"
      intro="Select a region. Every row cites the page it came from, and a region with no records says so."
    >
      <div className="al-px">
        <BodyExplorer />
      </div>
    </Section>
  );
}
```

- [ ] **Step 10: Assemble `src/App.tsx`**

```tsx
import { PageShell } from './pages/PageShell';
import { Story } from './story/Story';
import { ProductExperience } from './sections/ProductExperience';
import { PracticeSolutions } from './sections/PracticeSolutions';
import { Trust } from './sections/Trust';
import { Conversion } from './sections/Conversion';

export default function App() {
  return (
    <PageShell>
      <Story />
      <ProductExperience />
      <PracticeSolutions />
      <Trust />
      <Conversion />
    </PageShell>
  );
}
```

- [ ] **Step 11: Delete the superseded files**

```bash
git rm src/sections/Transformation.tsx src/sections/Transformation.css src/sections/Chronology.tsx src/sections/Chronology.css src/sections/SignalCockpit.tsx src/sections/SignalCockpit.css src/sections/__tests__/Chronology.test.tsx
```

Then `grep -rn "Transformation\|SignalCockpit\|sections/Chronology" src` must return nothing.

- [ ] **Step 12: Run the whole suite; fix the a11y and claims expectations that the new page changes**

Run: `npm test`
Expected failures, all in `src/__tests__/a11y.test.tsx`, fixed as follows:

- `'exposes one labelled region per content section'`: `SECTIONS` becomes `['story', 'products', 'solutions', 'trust', 'contact']`.
- `'puts every control named in the manual pass on the tab sequence…'`:
  - the chronology events block stays as is (stacked mode renders one `ChronologyState`, five buttons);
  - `reachable(screen.getByRole('link', { name: /on your own matter/i }))` becomes `screen.getAllByRole('link', { name: /on your own matter/i }).forEach(reachable)` — the stacked layout renders the citation card three times (chapters 2, 3, 4 each inline a chronology state).
  - Wait: chapters 3 and 4 inline a full `ChronologyState` too, so the expanded-button count triples. Change the events assertion to `expect(events.length).toBe(CHRONOLOGY.length * 3)` with a comment: "one chronology per chapter 2–4 in the stacked layout the suite renders".
- `'has exactly one h1'` and landmark tests: unchanged and passing.

Then `npm test` again: all green.

- [ ] **Step 13: Build and look**

Run: `npm run build` — succeeds. Start the dev server (Browser pane, `autolaw-dev`) and check at 1280 px wide: the hero copy sits beside the navy stage; scrolling moves the stage through the chapters while it stays put; the chapter dots track. At 375 px: no sticky column, each chapter shows its panel beneath its heading. With the OS reduced-motion setting on (or the Browser pane's emulation): stacked layout at any width.

- [ ] **Step 14: Commit**

```bash
git add -A src
git commit -m "Build the pinned story: hero copy beside one stage that plays seven chapters

One grid holds the hero copy and the chapter blocks on the left and a sticky
stage on the right. An IntersectionObserver picks the chapter; the stage renders
one of eight states from the demo matter. Below 900px or under reduced motion
the same states render inline under each chapter, with nothing pinned and
nothing animated. Transformation, the standalone Chronology section, and the
signal cockpit are folded into the stage states and removed."
```

---

### Task 9: Nav and footer as flat links; claim guard additions

**Files:**
- Create: `src/navigation.ts`
- Modify: `src/components/SiteNav.tsx`, `src/components/SiteNav.css`, `src/components/SiteFooter.tsx`, `src/config.ts` (remove `RESOURCE_MENU`, `ABOUT_MENU`, `NavMenuItem`), `src/__tests__/claims.test.tsx`, `src/__tests__/a11y.test.tsx`
- Test: rewrite `src/components/__tests__/SiteNav.test.tsx`, modify `src/components/__tests__/SiteFooter.test.tsx`

**Interfaces:**
- Produces: `SITE_LINKS: ReadonlyArray<{ href: string; label: string }>` = Product `/#story`, Solutions `/#solutions`, Security `/security/`, About `/about/`.

- [ ] **Step 1: Write the failing tests**

Replace `src/components/__tests__/SiteNav.test.tsx` entirely:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SiteNav } from '../SiteNav';
import { LOGIN_URL, SCHEDULE_URL } from '../../config';
import { SITE_LINKS } from '../../navigation';

describe('SiteNav', () => {
  it('lists Product, Solutions, Security, About as plain links, in that order', () => {
    render(<SiteNav />);
    const nav = screen.getByRole('navigation', { name: /primary/i });
    const links = within(nav).getAllByRole('link');
    expect(links.map((a) => a.textContent?.trim())).toEqual(['Autolaw', 'Product', 'Solutions', 'Security', 'About', 'Schedule a call']);
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/', ...SITE_LINKS.map((l) => l.href), SCHEDULE_URL]);
    expect(within(nav).queryAllByRole('button', { expanded: false })).toEqual([]);
  });

  it('points Product at the story and Solutions at the practice section', () => {
    expect(SITE_LINKS.find((l) => l.label === 'Product')?.href).toBe('/#story');
    expect(SITE_LINKS.find((l) => l.label === 'Solutions')?.href).toBe('/#solutions');
  });

  it('renders no login link while LOGIN_URL is unset', () => {
    expect(LOGIN_URL).toBeNull();
    render(<SiteNav />);
    expect(screen.queryByRole('link', { name: /log in/i })).not.toBeInTheDocument();
  });

  it('makes Schedule a call the nav’s primary button', () => {
    render(<SiteNav />);
    const cta = within(screen.getByRole('navigation', { name: /primary/i })).getByRole('link', { name: /schedule a call/i });
    expect(cta).toHaveClass('al-btn--primary');
  });

  it('opens a drawer on the mobile toggle that carries the same links and the CTA', async () => {
    const user = userEvent.setup();
    render(<SiteNav />);
    const toggle = screen.getByRole('button', { name: /open menu/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(screen.getByRole('button', { name: /close menu/i })).toHaveAttribute('aria-expanded', 'true');
    const drawer = document.getElementById('nav-mobile')!;
    expect(within(drawer).getAllByRole('link').map((a) => a.textContent?.trim())).toEqual([...SITE_LINKS.map((l) => l.label), 'Schedule a call']);
  });
});
```

In `src/components/__tests__/SiteFooter.test.tsx`, change the import to `import { CONTACT_EMAIL, SCHEDULE_URL } from '../../config'; import { SITE_LINKS } from '../../navigation';` and the expected list to:

```tsx
    expect(hrefs).toEqual([
      ...SITE_LINKS.map((l) => l.href),
      SCHEDULE_URL,
      // No login link: LOGIN_URL is null until app.autolaw.ai resolves.
      `mailto:${CONTACT_EMAIL}`,
    ]);
```

In `src/__tests__/claims.test.tsx`, add to `RETIRED`:

```ts
  {
    pattern: /suggested\s+questions|streaming|generate\s+documents|compute\s+action/i,
    reason: 'Ask AL roadmap items, not shipped behaviour',
  },
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- SiteNav SiteFooter claims`
Expected: FAIL — `../../navigation` not found.

- [ ] **Step 3: Create `src/navigation.ts`**

```ts
import { SECURITY_URL, ABOUT_URL } from './config';

/**
 * The site's four destinations, in nav order. Root-relative so they work from the
 * standalone pages, where a bare "#story" would resolve to nothing. Nav and footer both
 * read this list, so a destination cannot be removed from one and linger in the other.
 */
export const SITE_LINKS: ReadonlyArray<{ href: string; label: string }> = [
  { href: '/#story', label: 'Product' },
  { href: '/#solutions', label: 'Solutions' },
  { href: SECURITY_URL, label: 'Security' },
  { href: ABOUT_URL, label: 'About' },
];
```

- [ ] **Step 4: Rewrite `src/components/SiteNav.tsx`**

```tsx
import { useState } from 'react';
import { Button } from './primitives/Button';
import { LOGIN_URL, SCHEDULE_URL } from '../config';
import { SITE_LINKS } from '../navigation';
import './SiteNav.css';

/**
 * Four links and one button. The dropdowns are gone: Resources held one item and About
 * held one item, and a menu that opens onto a single link is a menu nobody needed.
 */
export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="al-nav">
      <nav className="al-nav__nav" aria-label="Primary">
        <div className="al-container al-nav__inner">
          <a className="al-nav__brand" href="/">Autolaw</a>

          <ul className="al-nav__links">
            {SITE_LINKS.map((l) => (
              <li key={l.href}><a href={l.href}>{l.label}</a></li>
            ))}
          </ul>

          <div className="al-nav__actions">
            {LOGIN_URL && <a className="al-nav__login" href={LOGIN_URL}>Log in</a>}
            <Button href={SCHEDULE_URL} variant="primary" size="md" withCaret>Schedule a call</Button>
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
              {SITE_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
                </li>
              ))}
            </ul>
            {LOGIN_URL && (
              <ul>
                <li><a href={LOGIN_URL}>Log in</a></li>
              </ul>
            )}
            <Button href={SCHEDULE_URL} variant="primary" size="md" withCaret>Schedule a call</Button>
          </div>
        )}
      </nav>
    </header>
  );
}
```

Delete from `src/components/SiteNav.css` every rule under the `/* ---- dropdown ---- */` comment through the last `.al-nav__panel-desc` rule, and any `.al-nav__mobile-group` / `.al-nav__mobile-label` rules. Keep the bar, links, actions, toggle, and mobile drawer rules.

- [ ] **Step 5: Update `src/components/SiteFooter.tsx`**

Replace the import line and the list:

```tsx
import { CONTACT_EMAIL, LOGIN_URL, SCHEDULE_URL } from '../config';
import { SITE_LINKS } from '../navigation';
import './SiteFooter.css';
```

and in the `<ul className="al-footer__links">`:

```tsx
          {SITE_LINKS.map((l) => (
            <li key={l.href}><a href={l.href}>{l.label}</a></li>
          ))}
          <li><a href={SCHEDULE_URL}>Schedule a call</a></li>
          {LOGIN_URL && <li><a href={LOGIN_URL}>Log in</a></li>}
          <li><a href={`mailto:${CONTACT_EMAIL}`}>Contact</a></li>
```

Delete the `SECTION_LINKS` constant and its comment.

- [ ] **Step 6: Remove the menu config from `src/config.ts`**

Delete `NavMenuItem`, `RESOURCE_MENU`, `ABOUT_MENU` and their comment block. `SECURITY_URL` and `ABOUT_URL` stay.

- [ ] **Step 7: Update `src/__tests__/a11y.test.tsx` counts**

- Nav links comment and count: "brand, four site links, and the header CTA" → `expect(navLinks.length).toBe(6)`.
- Delete the `menuTriggers` block (there are no disclosure buttons in the bar now).
- Footer: "four site links, schedule a call, contact" → `expect(footerLinks.length).toBe(6)`.
- In `'resolves every in-page anchor…'` nothing changes; `/#story` and `/#solutions` resolve.

- [ ] **Step 8: Run the whole suite**

Run: `npm test`
Expected: all green. Then `npx tsc --noEmit -p tsconfig.json` and `npm run build`: clean.

- [ ] **Step 9: Commit**

```bash
git add -A src
git commit -m "Flatten the nav to four links and one button; footer reads the same list

The Resources and About dropdowns each held a single link. Product now points
at the story, Solutions at the practice section, and Security and About are
top-level. The claim guard gains the Ask AL roadmap phrases."
```

---

### Task 10: Verification pass and checkpoint review

**Files:** none new. This is the review gate before plan 2.

- [ ] **Step 1: Full verification**

```bash
npm test && npx tsc --noEmit -p tsconfig.json && npm run build && npm run ds
```

All green. `npm run ds` confirms no token pair was added without a contrast entry (the story adds none).

- [ ] **Step 2: Browser pass, recorded in the commit message of the fix-up if anything is found**

In the Browser pane on the dev server:

1. 1280 × 900. Scroll from top to below chapter 7. The stage pins at nav height plus 24 px, plays states 0→7, and unpins after chapter 7. No horizontal scroll. Chapter dots track. Clicking a dot lands on that chapter with the heading clear of the nav.
2. Keyboard: Tab from the hero's "See how it works" → Enter → focus lands in the story, next Tab reaches the chapter dots, arrow-free Tab through eight dots, Enter follows each.
3. 375 × 812 mobile preset: stacked; each chapter has its panel; nothing pinned; no overflow; every tap target ≥ 24 px.
4. `resize_window` with `colorScheme` unchanged but reduced motion emulated via the OS or DevTools rendering setting: stacked at 1280 wide.
5. Console: no errors, no React key warnings.

- [ ] **Step 3: Request the checkpoint review**

Use `superpowers:requesting-code-review` on the range from the correction-release head (`fcbeab5`) to `HEAD`, with the spec and this plan as requirements. Fix Critical and Important findings before plan 2 is written.

- [ ] **Step 4: Commit any fix-ups and mark the spec**

In `docs/superpowers/specs/2026-09-02-autolaw-site-refresh-design.md`, change the "Plan shape" item 1 line to note "implemented in `2026-09-02-autolaw-story-engine.md`" and commit.

---

## Self-review against the spec

**Spec coverage, plan 1 scope (hero + story + nav):**

| Spec item | Task |
|---|---|
| H1, eyebrow, sub-copy, CTAs, trust strip | 8 |
| Stage: one component, eight states, `src/story/states/` | 3–7 |
| State table rows 0–7 | 3 (0), 4 (1), 5 (2–4), 6 (5), 7 (6–7) |
| Sticky pinning, no hijacking | 8 (`Story.css`) |
| IntersectionObserver, upper-third band | 2 |
| Class-driven transitions, persistent spine DOM | 3 (`Stage.css`), 5 (shared `key`) |
| Chapter list: eight dots, keyboard path, progress | 8 |
| Fallbacks: <900 px and reduced motion → stacked | 2, 8 |
| Accessibility (deviation recorded) | 3, 8 |
| Nav change, Resources dropdown removed | 9 |
| Tests listed under "Story" in the spec | 2, 3, 8 |
| Claim guard roadmap phrases | 9 |
| 12 px floor | 3, 5 (sizes raised) |

Deferred to plan 2, as the spec's "Plan shape" says: Ask AL section, Solutions rebuild with the silhouette, lifted practice state and conversion, `/privacy/` and `/terms/`, security additions, call-page query, fonts, share card, ESLint, third-party-origin guard.

**Type consistency:** `ChapterIndex` (Task 1) is used by Tasks 2, 3, 8; `Phase`/`phaseFor`/`PHASE_EVENT` (Task 5) by Task 3's switch; `Stage`/`InlineState` (Task 3) by Task 8; `SITE_LINKS` (Task 9) by nav, footer, and both tests; `mockMatchMedia`/`installFakeIntersectionObserver` (Task 2) by Task 8's tests. `HOW_IT_WORKS_URL` changes value in Task 8 and the Hero test reads the constant, not a literal.

**Placeholder scan:** the only "placeholder" is Task 3's `Placeholder` component, which exists to keep the Stage test green between tasks and is deleted in Task 7.
