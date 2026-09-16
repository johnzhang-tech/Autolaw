# Autolaw site — Product section, navigation, Security and About

**Date:** 2026-09-15
**Branch:** `site-redesign`
**Supersedes, in part:** `2026-09-02-autolaw-site-refresh-design.md` (the story engine it specifies is replaced below)

---

## 1. Why this change

The home page currently explains the product as a seven-chapter scroll story: "214 documents, out of order", "Both records stay visible", "Referenced, never produced". The owner's verdict on 2026-09-15: **lawyers will not understand those. They are too technical.**

The story describes *mechanisms*. A buyer scans for *named things they already buy*: medical chronologies, demand packages, case value. Both reference sites the owner named — evenuplaw.com and anytimeai.ai — present a feature list in the vocabulary of the practice, split by case phase. Neither one makes a visitor read a narrative to find out what the software does.

So: the story is replaced by a Product section that names features in business language, split into Pre-Litigation and Litigation.

**The constraint that shapes everything below.** The 2026-09-02 correction release exists because the previous site claimed things case-app does not do. A claim guard (`src/__tests__/claims.test.tsx`) now fails the build on retired phrases. Every feature named in this spec was verified against case-app and media-engine on 2026-09-15. Features that do not exist are labelled, not hidden and not implied.

---

## 2. Decisions

All made by the owner on 2026-09-15 unless noted.

1. **The pinned scroll story is replaced** by the phase grid. Its stage visuals are reused; its chapter narrative is deleted.
2. **One section, expandable cards.** No per-feature pages, no per-phase pages.
3. **The assistant stays "Ask AL"** — the name the application itself uses, so the site and a demo agree.
4. **Solutions stays**, below Product. Product answers "what do I get"; Solutions proves "here is the screen for my practice".
5. **Unbuilt features are labelled, never implied.** Two labels: `Early access` for built-but-not-enabled, and a `Coming next` row for not-built.
6. **Dropped:** Draft (vague), Research (dropped by the owner), Exhibit Index and Expert Tracking (see §3.4).
7. **Names:** "Damages Ledger" and "Case Value & Howell Analysis"; "Discovery Responses" plural.
8. **Navigation stays flat**, four links, with Security given visual weight.
9. **About's story and team** are written from an owner interview (§8).

---

## 3. Research that decided the contested items

### 3.1 Naming

"Damages Ledger" — every PI case management system keeps two distinct ledgers, and the wrong word is actively misleading: "Case Expenses", "Costs" and "Disbursements" all name the firm's own outlay, not the client's bills and liens. Supio ships a card called Case Ledger and Litify's Damages Assistant "reconciles into a ledger", so *ledger* is where vendors are converging without being any one brand's property. "Specials" is attorney-only vocabulary; "boardable damages" is regionally skewed.

"Discovery Responses", plural — firms say "we have responses due". The plural also names the direction of the work: answering requests, not propounding them.

### 3.2 Illustrations — real, but not reachable

media-engine is substantial: ~19k lines of source, ~33k of tests, 1,563 tests, active through 2026-09-08. It renders collision reconstruction, injury mechanism, treatment and limitation scenes from a structured case brief.

Its accuracy machinery is the differentiator, and it is real: a sufficiency gate that refuses to start (and refuses to charge) when the record is too thin; a scene contract where "not stated" means "must not be depicted"; three vision judges that re-inspect each render for reversed collision direction, over-claimed spinal level and laterality; auto-regeneration or parking for attorney review; a lock that requires human approval; hash-verifiable locked exhibits; and an attestation that deliberately refuses to count a prompt-level constraint as verified.

But it is not reachable by a customer: `MEDIA_ENGINE_ENABLED` defaults off, case-app's Media screen is behind the work-in-progress toggle, and the attestation never reaches the attorney UI. Hence `Early access`.

### 3.3 Deposition Review — strong market, absent product

A full-day deposition runs 200–250 pages; manual summarising runs 6–8 hours; outsourced services charge roughly $3–8 per page. It is a headline category for Steno, Filevine, DISCO, CaseMark and SmartDepo.

The workers' compensation angle is the one nobody is selling: in California the applicant's deposition is the most important in the case, and under Labor Code 5710 the carrier pays applicant's counsel an hourly fee for preparing and attending it, with proposed DWC guidelines around $450–500/hour. For a WC firm, deposition prep is **billable revenue, not overhead**. CompFox, the leading CA WC AI tool, buries depositions in a generic bullet.

In case-app the lane is wired (promotion added 2026-09-04) but has never written a row in any environment and exports nothing. So: `Coming next`, not a live card.

### 3.4 Exhibit Index and Expert Tracking — cut

Exhibit indexing is not a headline for any credible vendor; the tools that do lead with it are $40/month PDF stampers, and 95–97% of PI cases settle, so a trial artifact addresses a sliver of the caseload. Exhibits matter to PI firms as *demand attachments*, which is where they stay. In case-app the screen is WIP-gated by the team's own toggle.

Expert tracking has no buyer pull — the vendor that owned the category (Courtroom Insight) abandoned the name. In case-app it is two hand-typed lists with no extraction and no export. Cut.

The adjacent job that *is* valuable — researching the opposing expert against their prior sworn testimony — is a deposition capability and belongs with §3.3, not on the site today.

---

## 4. The Product section

Replaces the story at `#product`. Section heading: **"What Autolaw does for your firm"**.

### 4.1 Structure

```
Product
├─ Pre-Litigation column  — Build the file. Prove the damages. Send the demand.
├─ Litigation column      — The same file, ready for the fight.
├─ Across every phase     — a strip, not a column
└─ Coming next            — a row, visually distinct from the columns
```

A feature may appear in both columns (Ask AL, Medical Chronologies). This follows the reference sites and reflects the product: most of case-app is phase-neutral.

### 4.2 Data model

One source of truth, `src/data/product.ts`. No feature copy lives in JSX.

```ts
export type Availability = 'live' | 'early-access' | 'coming-next';
export type Phase = 'pre-lit' | 'litigation';

export interface Feature {
  id: string;
  name: string;
  line: string;                 // the sales line, one sentence
  wcLine?: string;              // practice-specific override
  practice: 'PI' | 'WC' | 'both';
  phases: ReadonlyArray<Phase>; // may be both
  availability: Availability;
  detail: ReadonlyArray<string>;// shown when the card expands
  output: string;               // "Word export" | "On screen" | ...
}
```

`availability` drives the label. `live` renders no label — the absence of a label is the claim, so nothing may be `live` that a customer cannot reach.

### 4.3 Cards

| Card | Sales line | Practice | Phases | State |
|---|---|---|---|---|
| Ask AL | Ask anything about the case. Every answer cites document, page, and line. | both | both | live |
| Medical Chronologies | Thousands of pages become one dated treatment story, cited and exportable. | both | both | live |
| Medical Significance Brief | What actually matters in the records, pulled out and sourced. | both | pre-lit | live |
| Missing Records & Gaps | See what the records reference but nobody produced. | both | pre-lit | live |
| QME/AME Deep Analysis | Every medical-legal opinion side by side, contradictions surfaced. | WC | both | live |
| Damages Ledger | Every medical bill, lien, and benefit payment in one running total. | both | pre-lit | live |
| Demand Packages | An evidence-backed demand, exported only after an attorney approves it. | PI | pre-lit | live |
| Case Value & Howell Analysis | Three scenarios, Howell and Pebley views, future care. | PI | pre-lit | live |
| Negotiation Tracking | Demand sent, offers, counters, best offer, on one timeline. | PI | pre-lit | live |
| Case Management Summary | Claim info, both chronologies, treatment, providers, damages — one document. | both | litigation | live |
| Conflicting Records & Opinions | Where the record disagrees with itself, both sources visible. | both | litigation | live |
| Deadlines & Statute of Limitations | What is running, and what closes next. | both | litigation | live |
| Accident & Injury Illustrations | Illustrations built only from what the record supports. | both | litigation | early-access |
| Discovery Responses | Answer form and special interrogatories, production and admissions from the file you already have. | both | litigation | coming-next |
| Deposition Review | Every deposition read and cited before the transcript goes cold. | both | litigation | coming-next |

The Damages Ledger `wcLine`: *Reconcile the benefit printout — every TTD, PD, and medical payment — against what is owed.* Inside the product the WC row is labelled "Benefit printout", the term 8 CCR § 10635(b) creates.

**Across every phase** (strip): Case Files — upload, Dropbox sync, OCR, document classification · Attorney Review Queue · Firm roles and per-case access.

### 4.4 Expanded card

Click or keyboard-activate expands one card in place: two to four `detail` bullets, the `output` line ("Word export", "On screen"), and a practice badge where the feature is PI-only or WC-only. Expansion is a `<button>` toggling `aria-expanded` on a `<div role="region">`; one open at a time is not enforced.

`detail` for an `early-access` card must state what a visitor gets today: for illustrations, that it runs on your case with our team during a pilot.

**Narrow screens.** The two columns stack, Pre-Litigation first, each keeping its phase heading; the strip and the Coming next row follow. Cards stay collapsed by default at every width, so the section's own height does not depend on the viewport.

**The Ask AL kill switch.** `ASK_AL_ENABLED` already hides the standalone Ask AL section. It now also drops the Ask AL cards from both columns and the link to that section, so one switch removes the feature everywhere rather than leaving a card pointing at a section that no longer renders.

### 4.5 Copy rules

Outcome first, mechanism second. No hours-saved or money-recovered claims: plaintiff firms work on contingency, and the research is clear that "hours saved" is defence-firm framing. No competitor comparisons by name. No number that is not measured — which for illustrations means **no accuracy percentage of any kind** (§7).

---

## 5. What is removed, reused and re-parented

**Deleted:** `src/story/Story.tsx`, `chapters.ts`, `ChapterList.tsx`, `Stage.tsx`, `useStoryMode.ts`, `useActiveChapter.ts`, `Story.css`, and their tests. The pinned-scroll mechanic and the "Chapter N" framing go with them.

**Reused:** the state visuals in `src/story/states/` move to `src/sections/visuals/`. They are already self-contained; only imports change. Each gets exactly one home, so none is orphaned and none appears twice:

| Visual | New home |
|---|---|
| `Signals` | beside the Hero, preserving the current above-the-fold composition |
| `ChronologyState` | Medical Chronologies, expanded |
| `AskPreview` | Ask AL, expanded |
| `Arrival` | Case Files, in the across-every-phase strip |
| `Review` | Attorney Review Queue, in the strip |
| `Output` | Case Management Summary, expanded |

**Re-parented:** `Hero` is copy-only and currently sits inside Story's grid. It becomes its own `<section>` above Product, keeping its own CSS. Its "See how it works" button points at `HOW_IT_WORKS_URL`, which changes from `/#story-arrives` to `/#product`.

**Home page order after the change:** Hero → Product → Ask AL → Solutions → Trust → Conversion.

The standalone `AskAl` section stays. It demonstrates grounded answering with citations and a refusal, which a one-line card cannot; the Product card links to it.

---

## 6. Navigation, Security, About

### 6.1 Navigation

`SITE_LINKS` keeps four entries: Product (`/#product`), Solutions (`/#solutions`), Security, About, plus the "Schedule a call" button.

Security is the first objection a firm handling PHI raises, and Anytime AI puts it first in their nav for that reason. Rather than reorder — which would put a trust page ahead of the product a visitor came to see — Security keeps its position and gains a small shield mark before its label, in both nav and footer. It stays a plain link at the same type size: the mark is a signal, not a badge, and nothing about it implies a certification.

### 6.2 Security

Every existing claim is backed and stays. Two changes:

1. **Reorder to the reader's questions.** The page currently opens as a controls checklist for a security reviewer. It should answer, in this order: does my client's medical data stay private, does my case train your model, what do I tell my client. The existing sections supply all three; they are re-sequenced and re-headed.
2. **Two additions.** A legal-ethics section — privilege, client disclosure, and whether AI costs may be billed back — framed as questions firms ask, pointing to California bar guidance rather than giving advice. And the illustration accuracy controls from §3.2, which no competitor can match.

The vocabulary guard in `src/pages/security/__tests__` extends to cover the new claims.

### 6.3 About

Principles and practice-area sections stay. The three owner slots are filled from an interview (§8). `STORY` and `TEAM` remain slot-shaped: absent data renders nothing, never a placeholder.

---

## 7. Honesty enforcement

The claim guard gains three rules:

1. **Availability is enforceable.** Any feature whose `availability` is not `live` must render inside a card carrying its label. A test asserts the label text is present for every non-live feature, so a later edit cannot quietly promote one.
2. **New retired phrases**, from the media-engine audit: any accuracy percentage applied to illustrations, plus `medically validated`, `expert[- ]reviewed`, `court[- ]admissible`, `clinician[- ]approved`, `3D`, and surgical-procedure claims. media-engine's own accuracy corpus is directional, every case is agent-proposed, and the test that would gate a measured number is named `test_gate_condition_is_not_yet_met`.
3. **Existing rules hold.** `certified` stays banned sitewide; `generate documents` is retired, so the Discovery Responses copy must not use it.

No rendered sample from media-engine ships on the site. The one real render inspected on 2026-09-15 has garbled label text ("Plaufinit" for "Plaintiff") — exactly what its own OCR drift check exists to catch.

---

## 8. Owner inputs still needed

1. **About interview** — six questions, to be asked in the implementation session: what you saw that made this worth building; who you built it with; what the first firm used it for; what you refuse to do that a competitor would; who is on the team and what each person does; whether you want roles listed.
2. **Privacy and terms text** — unchanged from the refresh spec; both routes render nothing until supplied.

---

## 9. Non-goals

A pricing page (an explicit non-goal in the 2026-08-05 design doc, and neither reference site publishes prices). Per-feature or per-phase pages. Customer logos or testimonials until real ones exist with permission. Any link into `app.autolaw.ai` while its DNS record is absent.

---

## 10. Testing

- The claim guard covers the new rules in §7, and the non-vacuity floor rises to account for the new section.
- A product-data test asserts every `Feature` has a non-empty `line`, at least two `detail` bullets, a valid phase list, and that no `coming-next` feature claims an `output`.
- A11y: the expandable cards get a keyboard and `aria-expanded` test; the story-mode tests are deleted with the story.
- Existing suites (275 tests) stay green; story-specific tests are removed rather than adapted.
