# Autolaw.ai site redesign — design

**Date:** 2026-08-05
**Status:** design, approved to build
**Repos:** `Autolaw` (this spec, the marketing site) · reads product truth from `case-app`

---

## Problem

`www.autolaw.ai` serves the Cloud Run build of this repo's `src/App.tsx`
(project `legal-intelligence`, region `us-west1`, last deployed 2026-04-26). It presents
strong underlying capability as a technology concept rather than a product a law firm can
trust and try.

Verified defects in source:

| Defect | Location |
|---|---|
| Six `Logoipsum` placeholders under "Trusted by:" | `src/App.tsx:203-210` |
| Hero is one 160px display line — no eyebrow, subhead, CTA, or trust signal | `src/App.tsx:181-183` |
| Sole conversion path is `mailto:test@autolaw.ai` | `src/App.tsx:14`, `:509` |
| Unsplash stock photo of paper files | `src/App.tsx:415` |
| Login exposes a raw Cloud Run hostname | `src/App.tsx:13` |
| Four dense product paragraphs in internal vocabulary ("ontology", "computable Case Memory", "agentic AI workers") | `src/App.tsx:235-276` |

The fake logos are the most damaging single element and are removed unconditionally.

## The deeper problem: the site hides the product's actual differentiators

Read from `case-app` design specs. Each of these is real, shipped or designed behavior, and
none of it appears on the site:

1. **Citations carry document, page, and the quoted excerpt**, with a deep-link to the
   source — not merely "evidence-linked."
   (`2026-07-28-evidence-review-lane-clarity-design.md`)
2. **Conflicting sources are surfaced as a conflict, never silently resolved.**
   (`2026-07-28-wc-case-vitals-promotion-design.md`)
3. **Extraction never writes case truth without a human.** Model findings arrive as
   citation-backed *suggestions* an attorney confirms; provenance is visible **before**
   commitment. Rationale in-product: establishing date of injury, employer, and claim status
   is a legal act with statute-of-limitations consequences.
4. **Facts with no citation are never grouped** — an evidence review lane exists specifically
   so "no citation" stays visible instead of blending into supported findings.
5. **PI and WC are architecturally isolated** — separate routes, nav visibility, and data
   surfaces (`PiOverviewPageClient`, `WcCaseVitalsStrip`, `practice-route-guard.ts`), with
   deliberate fail-open/fail-closed postures per layer.
   (`2026-08-01-practice-area-isolation-design.md`)

Item 5 is the commercial wedge. EvenUp, Supio, and Eve are PI-first; Eve lists Workers'
Comp as one tab under a PI product. Autolaw built genuine practice-area isolation and the
site blends both into one paragraph.

Item 3 answers the category's stated top objection. Supio's own 2026 research is titled
*"trust, not cost, is blocking AI adoption."*

## Competitive reading

| Company | Positioning | Mechanics worth taking |
|---|---|---|
| EvenUp | "Proactive AI for Personal Injury Firms" | Per-lifecycle-stage product video; SOC2 + HIPAA stated on the homepage; hard numbers |
| Supio | "Deep understanding. Every case. Across Your Firm." | ~25 named firm logos; FAQ block; original research as trust asset |
| Eve | "EveOS is the AI operating system for plaintiff law" | Named modules; practice-area tabs; G2 rating |
| Harvey | "Practice Made Perfect" | Restraint. Few claims, named customers with titles, heavy whitespace |

**Consequence for positioning:** Eve already owns "operating system for plaintiff law."
The current headline "Your AI Case Operating System" is therefore a me-too. Replaced with
**"Turn case complexity into legal advantage."**

## Goals

Trustworthy, appealing, clear, enterprise-ready. Concretely:

- Every capability claim on the page is backed by behavior that exists in `case-app`.
- No invented trust signal. Logo wall and certification badges ship empty until real assets
  are supplied, rather than filled with placeholders.
- A visitor understands the buyer outcome above the fold, and can start a trial from there.
- WC buyers see a WC product, not PI copy with "WC" appended.
- WCAG 2.1 AA: contrast verified numerically, keyboard operable, `prefers-reduced-motion`
  honored, screen-reader labels on every interactive visualization.

## Non-goals

- Next.js migration. Vite/React/Cloud Run works and is already wired to the domain. No
  routing or SEO requirement this round justifies a new pipeline.
- CMS or blog.
- Pricing page. Value-based pricing is stated as a differentiator, not itemized.
- Replacing `case-app`'s own UI. The design system is authored so `case-app` *can* adopt it;
  that adoption is a separate decision.

---

## Design system

Authored once as tokens, consumed by the site, and published to Claude Design so the product
and the marketing site can converge.

### Color

Contrast ratios computed against `--canvas #F7F8F4` unless noted.

Values below are emitted by `node design-system/build.mjs`, which fails the build if any pair
misses its requirement. Preview files write `{{ratio:--al-fg|--al-bg}}` rather than a typed
number, so no document in the system can misstate its own palette.

| Token | Value | Ratio | Use |
|---|---|---|---|
| `--al-ink` | `#13222E` | 15.19:1 | Body and display text |
| `--al-ink-muted` | `#4A5A66` | 6.68:1 | Secondary text |
| `--al-navy` | `#0C2238` | — | Primary dark surface; white on it = 16.13:1 |
| `--al-navy-raised` | `#14304A` | — | Raised panel on navy; white on it = 13.54:1 |
| `--al-canvas` | `#F7F8F4` | — | Page background |
| `--al-surface` | `#FFFFFF` | — | Cards |
| `--al-teal` | `#18A999` | **2.74:1 — fails** | Graphics **on navy only**, where it is 5.51:1 |
| `--al-teal-text` | `#0E7C70` | 4.76:1 | Links, labels, interactive text on canvas |
| `--al-amber` | `#C76B3B` | 3.47:1 | Chip fills, borders, non-text indicators only |
| `--al-amber-text` | `#9A4E27` | 5.64:1 | Conflict and warning copy |
| `--al-hairline` | `#E4E6DF` | — | 1px borders |

The `--al-teal` / `--al-canvas` pair is asserted in the validator as a **`mustFail`** case: a
future edit that "fixes" it to pass would trip the build instead of quietly loosening the rule
that keeps teal on navy.

**The governing rule this produces:** teal is a dark-surface accent. It only reaches AA on
navy. Therefore every live product visualization sits on a navy panel — where teal reads as
signal — and the page around it stays warm off-white. The restrained look is arrived at from
contrast math, not taste.

### Typography

- **Manrope** — all UI, display, and body.
- **Source Serif 4** — reserved strictly for verbatim material: quoted document excerpts and
  case narrative. Serif becomes a *semantic* signal meaning "this is exactly what the record
  says," never decoration.

Display scale is fluid via `clamp()`, capped so the headline never dominates the product
visual — the specific failure of the current hero.

### Spacing, shape, motion

8px base scale. 1240px max width, 12-column grid. Radii 14px (cards) / 16px (panels) /
999px (pills). One-level shadow, minimal. Transitions 180–240ms `cubic-bezier(.2,.7,.3,1)`;
all motion disabled under `prefers-reduced-motion: reduce`.

### Explicitly avoided

Neon "AI" graphics, glowing brains, courtroom clichés, gavels, stock paper files, and
multi-stop gradients. The current `src/assets/9f17e02c…png` agent graphic and the Unsplash
file photo are both deleted.

---

## Site narrative — six sections

### 1. Hero

- **Eyebrow:** AI-native case intelligence for personal injury and workers' compensation firms
- **Headline:** Turn case complexity into legal advantage.
- **Support:** Autolaw transforms intake calls, medical records, expert reports, and case
  files into a living, source-linked Case Brain — helping your team understand the case,
  uncover missing evidence, and prepare stronger work product faster.
- **Primary CTA:** Analyze one case → `case-app` `/trial`
- **Secondary CTA:** Watch a 3-minute case walkthrough
- **Trust strip:** Source-linked evidence · Human review controls · Auditable access ·
  SOC 2 Type II · HIPAA · Dropbox integration
- **Visual:** Case Signal Cockpit (below)

### 2. Transformation

From scattered evidence to case intelligence. A three-stage flow — **Documents → Case Brain
→ Work product** — animating on scroll. Document types are the real ones the pipeline
ingests: QME/AME reports, PTP reports, wage records, imaging, billing, intake calls,
subpoenaed records, prior-claim records.

### 3. Product experience

The interactive chronology and evidence lane. Shows what Autolaw *finds* (gaps, conflicts,
uncited facts) and what it *produces*, with citation provenance exposed on click.

### 4. PI / WC solutions

Practice toggle. Distinct outputs per practice, reflecting the real isolation boundary:

- **PI:** causation, treatment gaps, damages, medical bills, demand narrative
- **WC:** QME/AME versus PTP findings, work status, MMI/P&S, apportionment, disability,
  UR/IMR, unresolved conflicts

### 5. Trust and differentiation

"Why not simply upload the file to ChatGPT." A comparison grounded in the five verified
behaviors above — source verification, human confirmation before commitment, conflict
surfacing, uncited-fact visibility, tenant isolation and audit logs — plus an explicit
statement on whether customer data trains models.

### 6. Conversion

Practice-specific trial CTA. A PI visitor and a WC visitor get different proof and different
entry copy.

---

## The four visualizations

All four are live HTML/CSS/SVG on navy panels. No screenshots, no image assets, no PHI.
Demo data is obviously fictional. Each is keyboard operable with an ARIA live region, and
degrades to a static labelled state under reduced motion.

1. **Case signal cockpit** — case identity strip plus signal tiles carrying real product
   semantics: missing records, conflicting facts, treatment gaps, work restrictions, key
   diagnoses, next actions. Tile state maps to the token system — teal resolved, amber
   conflict or blocker, slate neutral.

2. **Interactive medical chronology** — dated events on a spine. Selecting one opens a
   citation card: document, page, the highlighted sentence set in Source Serif, provider,
   diagnosis, and confidence. This is the section that proves claim 1 rather than asserting
   it, and is the most load-bearing element on the page.

3. **Medical body explorer** — selectable regions (cervical spine, lumbar spine, shoulder,
   knee, hand/upper extremity). Selecting one reveals symptoms, imaging, treatment
   progression, restrictions, and linked evidence in plain English.

4. **Practice toggle** — a segmented control that swaps panel content wholesale between PI
   and WC outputs, so the difference is demonstrated rather than described.

---

## Launch dependencies

Blocking, and outside this repo:

1. **Trial signup is disabled.** `apps/case-ingestion/app/(auth)/trial/page.tsx` returns
   `notFound()` unless `TRIAL_SIGNUP_ENABLED === "true"`. The primary CTA 404s until that
   environment variable is set in the `case-app` Cloud Run service.
2. **`app.autolaw.ai` does not resolve.** Login must move off
   `case-app-1055716306475.us-central1.run.app`. Requires a DNS record and a Cloud Run domain
   mapping, and `NEXT_PUBLIC_APP_URL` / `CASE_APP_BASE_URL` updated together — they must name
   the same host or the Dropbox OAuth callback breaks (documented invariant in
   `CanonicalHostRedirect.tsx`).
3. **Real assets required from the business:** firm names plus logo files with display
   permission; SOC 2 Type II and HIPAA badge artwork; the 3-minute walkthrough recording.
   Until supplied, those slots render nothing. No placeholder is substituted.

Non-blocking: replace `test@autolaw.ai` with a monitored address.

## Verification

- Contrast: every foreground/background pair asserted numerically, not by eye.
- Keyboard: full traversal of all four visualizations, visible focus throughout.
- Reduced motion: every animation suppressed, no information lost.
- Responsive: 360 / 768 / 1024 / 1440 reflow, no horizontal page scroll.
- Claim audit: each capability statement traced to a `case-app` behavior before merge.
