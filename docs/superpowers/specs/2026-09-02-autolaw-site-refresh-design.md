# Autolaw.ai site refresh — design

**Date:** 2026-09-02
**Status:** implemented — plan 1 (story engine) and plan 2 (sections and polish) both complete on `site-redesign` as of 2026-09-03
**Builds on:** the correction release (`2026-09-02-autolaw-correction-release-design.md`),
which must be deployed first. This spec assumes that branch state as its baseline.
**Reads product truth from:** `case-app` at `/Users/zhongzhang/projects/case-app`, surveyed
2026-09-02. Every capability shown or stated below is traced to that survey in the
"Product truth" section at the end.

---

## What this is

The corrected site is honest but flat: click-to-reveal panels, a block mannequin, a headline
that fills the first screen, and no mention of the product's largest new surface. This
refresh rebuilds the home page as one continuous demonstration of one fictional matter,
adds an Ask AL section limited to what ships, raises the fidelity of every visualization,
and finishes the pieces the original spec promised but did not build.

Owner decisions that govern it, all made 2026-09-02:

1. "Schedule a call" is the single primary CTA; the trial stays behind `TRIAL_ENABLED`.
2. SOC 2 Type II, a BAA on request, and a written no-training commitment are real and may
   be stated. Wording stays precise: SOC 2 is an audited attestation; HIPAA has no
   certification.
3. Ask AL gets its own section, live at launch, showing only behaviour that exists.
4. Product visuals stay code-built: HTML, CSS, and SVG. No screenshots, no image assets.
5. Home page layout: the pinned story, layout **A** (chapters scroll on the left, stage
   pinned on the right), **one stage** (the hero's panel is chapter 0 and pins), and the
   **front-view silhouette** figure with leader labels.
6. H1 is **"Know where every fact came from."**

## Three rules

- **Every claim traces to a behaviour in case-app today.** The credibility and claim
  guards from the correction release stay and grow. Anything on the roadmap is not on the
  site.
- **One matter runs through the whole page.** The demo case is a California workers'
  compensation claim: lumbar spine and left shoulder, 214 documents, 1,880 pages, a PTP
  versus QME conflict on work status, an MRI referenced by two reports and never produced.
  It appears in the hero tiles, every story chapter, the Ask AL answers, the practice panel,
  and the closing copy, and carries a visible "Sample data" mark wherever it is shown.
- **Motion shows where a thing came from; it never entertains.** Design-system rules as
  written: one easing curve, 240 ms ceiling, every animated state also carried in text and
  colour, and full parity under `prefers-reduced-motion: reduce`.

---

## Pages and navigation

| Path | Status | Change |
|---|---|---|
| `/` | exists | Rebuilt as described below |
| `/security/` | exists | Adds a Retention card and the citation-kind list; nothing else |
| `/about/` | exists | Nav and copy only |
| `/schedule-call/` | exists | Reads `?practice=` to preselect the first question |
| `/privacy/` | new | Owner slot. Renders nothing and is not linked until `PRIVACY_TEXT` is filled |
| `/terms/` | new | Same pattern, `TERMS_TEXT` |

Nav: **Product · Solutions · Security · About**, then the primary button "Schedule a call".
"Log in" appears only when `LOGIN_URL` is set. "How it works" is dropped: the story *is* how
it works, and two nav links to one anchor is a nav nobody tested. The Resources dropdown is
removed because it held one item; Security becomes a top-level link. Footer mirrors the nav
and adds Privacy and Terms only when their pages exist.

Section anchors on the home page, in order: `#story` (the section; chapter 1 is
`#story-arrives`), `#ask-al`, `#solutions`, `#trust`, `#contact`. "Product" links to
`#story-arrives`, "Solutions" to `#solutions`.

---

## Home page, part one: hero and the pinned story

### Hero

Two-column grid at ≥ 900 px: copy left, stage right, stage capped at 55 % of the row.

- **Eyebrow:** Case intelligence for personal injury and workers' compensation firms
- **H1:** Know where every fact came from.
- **Sub-copy:** Autolaw reads the medical records, expert reports, and case documents in a
  file and builds one connected case file. Every fact cites its document, page, and
  sentence. Where two records disagree, you see both.
- **Primary:** Schedule a call → `SCHEDULE_URL`
- **Secondary:** See how it works → `#story-arrives` (chapter 1; focus lands on the chapter
  block, and the next Tab reaches the chapter dots)
- **Trust strip:** Source-linked evidence · Attorney confirms every fact · SOC 2 Type II ·
  BAA on request
- `TRIAL_ENABLED` adds "Analyze one report" as a third, secondary button, with the
  one-report copy from the correction release. Nothing else changes.

The H1 is one sentence so the stage is the second thing seen, not the fifth. "Turn case
complexity into legal advantage" moves to the `<title>` and `og:title` only.

### The stage

One React component, `Stage`, rendered once in the hero and pinned with CSS
`position: sticky` for the length of the story. It renders one of eight states from a
`chapter` prop (0–7). Each state is its own component under `src/story/states/`, and all
read from `src/data/demoCase.ts`, which is extended rather than duplicated.

| # | Anchor id | Left column: heading and one paragraph | Stage state |
|---|---|---|---|
| 0 | hero | (the hero copy) | **Signals.** Case identity strip and the six signal tiles: 3 missing records, 2 conflicting facts, 1 treatment gap, 41 confirmed facts, 6 work restrictions, 4 next actions. |
| 1 | `story-arrives` | **214 documents, out of order.** Records arrive continuously and never in sequence. | **Arrival.** Document chips enter in arrival order, grouped by type as they land: QME report, PTP reports ×9, imaging order, wage records, billing, incident report, UR letter, correspondence ×40. Count ticks to 214. |
| 2 | `story-connected` | **One timeline, every fact cited.** Each event names the document, the page, and the sentence it came from. | **Chronology.** The five-event spine assembles in date order. Each event gains a citation line `document · p.N`. |
| 3 | `story-conflict` | **Both records stay visible.** The PTP released him to modified duty on 04/02. The QME on 04/18 says temporarily totally disabled. Autolaw does not pick a winner. | **Conflict.** Events 4 and 5 highlight amber. A citation card rises out of the PTP row onto a page facsimile with the cited sentence marked in Source Serif. Beneath it, the QME's opposing sentence with its own page. Chip: "Conflicts with QME". |
| 4 | `story-missing` | **Referenced, never produced.** Two reports cite an MRI. No imaging report is in the file. | **Missing.** Event 3 turns amber. Card: "Needed: imaging report", referenced by QME p.14 and PTP p.5, review state "Needs review". |
| 5 | `story-ask` | **Answers only from the file.** Ask a question and every sentence of the answer cites its source. Ask for what is not there and it says so. | **Ask AL preview.** The question "What are the current work restrictions?" types in; the answer appears with [1] [2] markers; two chips beneath: "1 · Workers' Comp fact · PTP report · pg. 3", "2 · Document excerpt · QME report · pg. 22". |
| 6 | `story-confirm` | **An attorney decides.** Autolaw proposes. It never writes case truth on its own. | **Review queue.** One fact, "Work restriction · No lifting over 15 lb · PTP p.3", state "Needs review", with Confirm and Dismiss, and "Extraction confidence 92 %" as a labelled bar. Pressing nothing; the state is static with the buttons rendered as labels, as in the corrected chronology. |
| 7 | `story-output` | **What leaves the system.** A chronology you can check, a list of what is missing, and a readiness score. | **Output.** Three rows: Source-linked chronology (5 events, 5 citations), Missing evidence (1 · Needed: diagnostic report), Claim readiness (developing). Export button rendered inert with the product's real tooltip: "A human-approved event is required before exporting." |

After chapter 7 the stage unpins and normal scrolling resumes.

### The scroll engine

- **Pinning** is `position: sticky; top: <nav height + gap>` on the stage's column. No
  scroll hijacking, no `scroll-snap`, no wheel interception. The page scrolls at the
  browser's own rate.
- **Chapter selection** is an `IntersectionObserver` on the seven chapter blocks with
  `rootMargin` set so a chapter becomes active when its heading crosses the upper third of
  the viewport. The active index is React state in `Story`; `Stage` receives it as a prop.
- **State transitions** are class-driven. Each state mounts with a CSS entry animation
  (opacity and a 12 px translate over `--al-duration-slow`, with a reduced-motion escape)
  applied only on the live stage. Two beats run in JavaScript rather than CSS and are
  deliberate exceptions to the 240 ms ceiling: the arrival count ticks over 240 ms, and
  the Ask AL question types over 900 ms, because text appearing is not the page moving.
  Both are static in the stacked layout. Elements that persist between states (the spine in 2→3→4) keep
  their DOM nodes so the citation card genuinely rises out of the row that produced it.
  No library.
- **Chapter list.** A vertical list of eight dots with visually hidden labels, rendered
  beside the stage as a `role="group"` named "Story chapters" (not a second navigation
  landmark), with links to each chapter anchor. It is the keyboard
  path: Tab reaches it, Enter follows the anchor, and the observer then selects the state.
  It also shows progress.
- **Fallbacks.** Below 900 px wide or 720 px tall, and whenever `prefers-reduced-motion: reduce`
  matches, the stage does not pin and does not receive a `chapter` prop; instead each chapter block
  renders its own state inline beneath its heading, static. This is the same eight
  components with no transitions. The hero keeps state 0. Nothing is hidden and nothing is
  conveyed by movement alone.
- **Accessibility.** The pinned stage is a labelled region (`role="region"`, "Demonstration
  of one matter") and is never `aria-hidden`: the chronology states hold real buttons, and
  hidden focusable content is an accessibility failure. It has no live region, so
  transitions are not announced; the chapter text beside it is the narrative in reading
  order. State 0 keeps its `role="img"` and descriptive label so the hero's summary is
  announced. In the stacked fallback each inline state is visible to assistive tech,
  labelled by its chapter heading, and static. (Decided during implementation, 2026-09-03;
  supersedes the earlier `aria-hidden` wording.)

---

## Home page, part two: the sections after the story

### Ask AL (`#ask-al`)

Canvas section. Heading: **Ask the file, not the model.** Intro: Ask AL answers from the
case file and nothing else. Every sentence cites a source you can open. Ask for something
the file cannot support and it tells you so.

A navy panel with three preset questions as buttons. Choosing one renders its answer.

| Question | Answer (demo, from the matter) | Chips |
|---|---|---|
| What are the current work restrictions? | No lifting over 15 lb per the PTP on 04/02/2025 [1]. The QME on 04/18/2025 finds the claimant temporarily totally disabled [2]. The two opinions conflict and are flagged for review. | 1 · Workers' Comp fact · PTP report · pg. 3 · 2 · Document excerpt · QME report · pg. 22 |
| What is missing from the file? | An MRI of the lumbar spine dated 03/14/2025 is cited by the QME [1] and the PTP [2] but no imaging report is in the file. It is listed as needed. | 1 · Document excerpt · QME report · pg. 14 · 2 · Document excerpt · PTP report · pg. 5 |
| What is the settlement value? | A settlement or demand value is not in my context. Open the Damages screen for that figure. | none |

Chip anatomy, from the product: index number, citation kind from the seven-kind vocabulary
(Timeline event, Document excerpt, Workers' Comp fact, Wage record, Computed figure, Medical
encounter, Clinical recommendation), document name, page. Selecting a chip opens a citation
card: kind, document, page, excerpt in Source Serif, and the product's own review-status
line. The third question's copy is the product's refusal, paraphrased from its money-lane
rule that it never states a figure not in its context and points to the Damages screen.

Closing line of the section, stated plainly: Ask AL is available in every case today. It
answers from the case file only, cites every sentence, and declines what it cannot ground.
Nothing about streaming, suggested prompts, actions, or documents it can generate.

### Solutions (`#solutions`)

Heading: **Two practices, two workflows.** Segmented control, Personal injury and
Workers' compensation, roving tabindex as today. The choice is lifted to `App` state and
persisted to `sessionStorage` under one key so it also drives the closing section.

- **PI panel:** the PI Overview's three real tabs as a tab strip: Medical, Liability &
  Incident, Damages & Demand. Under Medical, the evidence-tier chips in their real wording:
  Imaging-backed, Diagnosis only — no objective finding, Symptom-reported only. Under
  Damages, a wage-loss line in the product's shape: Combined average weekly wage, Claimed
  past wage loss with its derivation `rate/week × weeks`. Copy names what the workflow
  produces: a source-linked chronology, causation and treatment-gap findings, specials and
  liens, a demand package.
- **WC panel:** the WC Intelligence tabs as a strip: Summary, Injury & Work Status,
  Benefits & Wages, Medical-Legal & Disputes. Under Injury & Work Status, the **silhouette
  figure** drives the detail card. Under Medical-Legal, the "PTP vs QME/AME conflicts · 1
  open" readiness card and the missing-evidence card.

### The silhouette figure

Replaces the block mannequin. One front-view human outline as a single SVG path, one
stroke weight, no face, no musculature, filled `--al-navy-raised` with a 1.2 px
`rgba(255,255,255,.28)` stroke. Regions: cervical spine, left shoulder, right shoulder,
lumbar spine, left hand, right hand, left knee, right knee. Each region is a `<rect>` or
`<ellipse>` with `role="button"`, `tabIndex`, `aria-pressed`, and an accessible name that
carries its status in words: "Lumbar spine, accepted body part". Leader lines run to text
labels outside the figure so status is readable without colour. Fills: teal for accepted,
amber dashed for disputed or not accepted, slate for no records. Minimum hit target 24 px at
the figure's smallest rendered size. Arrow keys move top to bottom in the visual order.
Selecting a region shows the detail card: plain-English summary, then rows for Symptoms,
Imaging, Treatment, Restrictions, Missing, each with a citation.

### Trust (`#trust`)

Unchanged in structure. The comparison table keeps its corrected rows. The no-training
control card links to `/privacy/` once `PRIVACY_TEXT` is filled, and to nothing before.

### Conversion (`#contact`)

Practice-specific, from the lifted selection. Default is PI when nothing is chosen.

- **PI:** heading "Prove it on one of your matters." Copy names the PI outputs. Primary
  button "Schedule a call" → `/schedule-call/?practice=pi`.
- **WC:** heading "Prove it on one of your claims." Copy names the WC outputs. Primary
  button → `/schedule-call/?practice=wc`.
- A small toggle beneath the heading lets a visitor switch practice here without scrolling
  back up. `TRIAL_ENABLED` adds "Analyze one report" as before.

---

## Config

Added to `src/config.ts`, each documented beside its value:

- `PRIVACY_TEXT: ReadonlyArray<{ heading: string; paragraphs: string[] }> = []` — owner slot;
  `/privacy/` renders and is linked only when non-empty.
- `TERMS_TEXT`, same shape.
- `ASK_AL_ENABLED = true` — a kill switch, not a launch gate. It hides the Ask AL section
  only; story chapter 5 stays, because what that chapter demonstrates is grounded answering
  with citations, which is the behaviour that would survive the section being pulled.

Unchanged: `TRIAL_ENABLED`, `LOGIN_URL`, `BOOKING_URL`, `CONTACT_ENDPOINT`, `ANNOUNCEMENT`,
`CUSTOMER_LOGOS`, `CERTIFICATIONS`, `WALKTHROUGH_URL`.

## Subpages

- **Security** adds one card under "Your data": **Retention** — the in-app policy's
  statement that data is deleted within 90 days of account termination and on request.
  Nothing more specific, because nothing more specific is published. The "Model limits"
  section gains a short list of the seven citation kinds as the concrete form grounding
  takes.
- **Schedule a call** reads `?practice=pi|wc|both` and preselects the first question. The
  hint copy is unchanged.
- **About** picks up the nav change only.

## Polish

- **Fonts self-hosted.** Manrope 400–700 and Source Serif 4 (400, 600, 400 italic) as
  `woff2` under `public/fonts/`, fetched once by `scripts/fetch-fonts.mjs`, declared in
  `src/styles/fonts.css` with `font-display: swap`, and shipped with their OFL notice. The
  Google Fonts `<link>` and both preconnects are removed from all six pages, and the CSP
  drops `fonts.googleapis.com` and `fonts.gstatic.com`. Every page then loads from one
  origin.
- **Share card.** A 1200 × 630 `og-card.png` rendered from `design-system/og-card.html`,
  committed as a static asset. All six pages switch to `summary_large_image` with
  `og:image` and `og:image:alt`, and a credibility guard ties the three tags to the file so
  they can only ship together.
- **Type floor.** No text inside the stage or panels below 12 px.
- **ESLint** with `react-hooks` and `jsx-a11y`, run in `npm test` via a `lint` script. The
  scroll engine's effects are exactly where dependency mistakes hide.

## Testing

Existing suites stay green. Added, all behaviour-level with Testing Library:

- **Story:** the chapter-to-state mapping (each chapter index renders its state's test id);
  the chapter list has eight links in order and each is a focus stop; under a mocked
  `prefers-reduced-motion: reduce` the stage is not rendered and eight inline states are;
  below 900 px (mocked `matchMedia`) the same; the hero stage is `aria-hidden` only while
  pinned.
- **Ask AL:** each of the three questions renders its answer; the first two render chips
  whose text includes a kind from the seven-kind list; the third renders no chip and
  contains "not in my context"; selecting a chip opens a card naming document and page.
- **Solutions and conversion:** choosing Workers' compensation changes the closing heading
  to "claims" and the button href to `?practice=wc`; the choice survives a re-render via
  `sessionStorage`; with storage throwing, the page still renders.
- **Silhouette:** eight regions, each with `role="button"` and an accessible name containing
  "accepted" or "not an accepted"; arrow keys move focus in the declared order; every hit
  target is at least 24 px in the rendered SVG box.
- **Schedule a call:** `?practice=wc` preselects the second radio; a bad value preselects
  nothing.
- **Guards:** the claim guard gains the phrases "suggested questions", "streaming", "generate
  documents", and "Compute Action" as retired for the Ask AL section; a test asserts every
  page loads no stylesheet or font from a third-party origin; the OG test asserts
  `og:image` exists as a file before `summary_large_image` is set.
- **Contrast:** any new token pair is added to `design-system/build.mjs` and the design
  system rebuilt.

## Plan shape

One spec, two implementation sequences with a review checkpoint between them, because the
story engine is where the risk is and it should be reviewed before the rest is built on it:

1. **Story:** demo data extension, `Stage` and the eight states, the scroll engine, the
   chapter list, fallbacks, hero rebalance, nav change, tests. Implemented in
   `docs/superpowers/plans/2026-09-02-autolaw-story-engine.md` (2026-09-03). On the pinned
   stage the chronology card hides its secondary rows (meta, offers, page rules, warning
   body) so the stage fits under the fold; the stacked layout shows them all.
2. **Sections and polish:** Ask AL, Solutions with the silhouette, lifted practice state and
   conversion, `/privacy/` and `/terms/` slots, security additions, call-page query, fonts,
   share card, ESLint, guards. Implemented in
   `docs/superpowers/plans/2026-09-03-autolaw-sections-and-polish.md` (2026-09-03), with two
   deviations recorded there and repeated here: `ASK_AL_ENABLED` hides the Ask AL section
   only, leaving the story's chapter 5 in place, because grounded answering is what that
   chapter demonstrates and it is not what a withdrawal would remove; and the security
   page's Retention card required deleting two lines from that page's unverified-vocabulary
   guard, which is the guard's own documented procedure — the deletion is the record that
   someone checked the claim against the in-app privacy policy.

## Not in this work

Real product screenshots, a walkthrough video, customer logos, a blog or resources
section, pricing, ESLint beyond the two plugins, deleting `server/` and `shared/`, and
anything on the Ask AL roadmap.

## Launch dependencies, outside this repo

1. The correction release deployed over `www.autolaw.ai`, and the apex redirect fixed.
2. For the trial button: DNS for `app.autolaw.ai`, and `TRIAL_SIGNUP_ENABLED=true` on
   `case-app`.
3. For `/privacy/` and `/terms/`: the owner supplies the text. The in-app policy is dated
   2026-05-12 and does not mention model training, subprocessors, or a BAA; it should be
   revised before it is published here, so the site's no-training claim links to a document
   that says it.

---

## Product truth

What the survey of `case-app` on 2026-09-02 established, and where. This is what the
demos are allowed to show.

| Shown on the site | Where it is true |
|---|---|
| Ask AL name, drawer, ⌘K | `src/ui-kit/layout/AlSpineZone.tsx`, `AlSpineBand.tsx` |
| Answers only from case context; refuses what is not there | `apps/server/src/copilotService.ts` base prompt and money addendum |
| Seven citation kinds and their labels | `src/ui-kit/screens/copilot/citationDisplayTitle.ts`, `CitationDetail.tsx` |
| Chip anatomy: index, title, `pg. N`; card opens a page | `CopilotThread.tsx`, `CitationPanel.tsx`, `PageCiteLink.tsx` |
| Timeline event row with `document · p.N` | `TimelineEventCard.tsx`, `CitationLine.tsx` |
| Review queue: Needs review, Confirm, Dismiss; "Low confidence" pill | `ReviewQueueScreen.tsx` |
| Export blocked until a human-approved event exists | activity timeline DOCX export tooltip |
| PI Overview tabs and evidence-tier chips | `src/features/pi-overview/piOverviewModel.ts`, `PiMedicalCommandCenterTab.tsx` |
| Wage-loss figures and their derivation | `PiWageLossPanel.tsx` |
| WC Intelligence tabs, readiness cards, contradiction cards | `WcIntelligencePageClient.tsx`, `wcCockpitModel.ts`, `ContradictionMatrixSection.tsx` |
| Missing evidence with `Needed: {type}` | `MissingEvidenceSection.tsx` |
| Readiness bands: not ready, developing, review ready, ready for attorney review | `packages/shared/src/caseTemplates.ts` |
| Retention: deletion within 90 days of termination | `apps/case-ingestion/app/privacy-policy/page.tsx` §6 |

What is on the roadmap and therefore **not** shown: streaming answers, suggested questions,
actions or tool dispatch, embedded views, generated documents, a single settled name for the
assistant beyond "Ask AL", and playbooks.
