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

**Revised 2026-09-16.** The first build put every feature in an expandable card on the home page. Seeing it, the owner rejected it: each feature should have **its own page**, reached from a **Product dropdown** split into the two phases — the pattern anytimeai.ai uses. Cards that expand in place are gone.

Three surfaces, one data source:

```
Product dropdown (nav)     Pre-Litigation column │ Litigation column
                           each entry a link to that feature's page

Home § Product             the same two columns, as linked cards
                           name + sales line, no expansion

/product/<slug>/           one page per feature — 14 of them
```

A feature may appear in both phase columns (Ask AL, Medical Chronologies, QME/AME). One page each regardless; the phase columns are navigation, not ownership.

**Owner update, 2026-09-16:** Intake is a `live` Pre-Litigation feature and appears first in that phase. It covers the review workflow for a new client conversation and uploaded documents; it does not claim automated case acceptance or outbound carrier calling.

**Phase positioning, approved 2026-09-16:** Pre-Litigation — “Build stronger cases—with insight and speed.” Litigation — “Win with deeper preparation and faster response.” The same lines appear in the Product dropdown and the home Product section because both read from `PHASES`.

**Which features get a page:** the 13 `live` features plus Accident & Injury Illustrations — 14. `Discovery Responses` and `Deposition Review` appear in the dropdown and on the home page in a Coming next block, and link nowhere. A page whose only message is "not yet" wastes the click.

### 4.2 Data model

One source of truth, `src/data/product.ts`. No feature copy lives in JSX.

```ts
export type Availability = 'live' | 'early-access' | 'coming-next';
export type Phase = 'pre-lit' | 'litigation';

export interface Feature {
  id: string;
  name: string;
  icon: ProductIconName;        // shared across menu, home card, and feature hero
  line: string;                 // the sales line, one sentence
  wcLine?: string;              // practice-specific override
  practice: 'PI' | 'WC' | 'both';
  phases: ReadonlyArray<Phase>; // may be both
  availability: Availability;
  detail: ReadonlyArray<string>;// the "what it does" bullets on the page
  output: string;               // "Word export" | "On screen" | ...
  slug?: string;                // /product/<slug>/ — absent means no page
  page?: FeaturePage;           // the page's own content, below
}

export interface FeaturePage {
  /** The <h1> promise. Longer than `line`, still one sentence. */
  promise: string;
  /** 2–3 paragraphs: what the work is, and what it replaces. */
  body: ReadonlyArray<string>;
  /** Three steps, each a short imperative clause. */
  steps: ReadonlyArray<{ heading: string; body: string }>;
  /** What it will NOT do. The most persuasive block on the page — see §4.4. */
  limits: ReadonlyArray<string>;
  /** Ids of 2–3 related features, rendered as links at the foot. */
  related: ReadonlyArray<string>;
}
```

`availability` drives the label. `live` renders no label — the absence of a label is the claim, so nothing may be `live` that a customer cannot reach.

### 4.3 Cards

| Card | Sales line | Practice | Phases | State |
|---|---|---|---|---|
| Intake | Turn the first client conversation and documents into a review-ready new matter. | both | pre-lit | live |
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

### 4.4 The feature page

One component, `FeaturePage`, rendered by 14 thin routes. Writing a page means writing data, never JSX. Every page runs in this order:

1. **Hero** — eyebrow naming the phase(s) and practice, `<h1>` carrying `promise`, the sales line beneath, and "Schedule a call".
2. **What it does** — the `detail` bullets, with `body` paragraphs around them.
3. **The visual** — this feature's demo panel, where it has one (§5).
4. **How it works** — the three `steps`.
5. **What it will not do** — the `limits`. Every competitor page is a list of promises; a short list of refusals is the one block an attorney will believe, and we have real ones: it does not pick a winner between conflicting records, it does not draft the records request, it does not export a figure nobody approved.
6. **What you get** — the `output` line, stated plainly.
7. **Related** — links to the `related` features, keeping a reader inside Product.
8. **Close** — "Schedule a call", and the practice the visitor chose carried with them.

An `early-access` page says what a visitor gets today — it runs on your case with our team, during a pilot — in the hero, not buried at the foot.

**Narrow screens.** The two columns stack, Pre-Litigation first, each keeping its phase heading; the Coming next block follows. The dropdown collapses into the existing mobile menu as a nested list.

**The Ask AL kill switch.** `ASK_AL_ENABLED` already hides the standalone Ask AL section. It now also drops the Ask AL cards from both columns and the link to that section, so one switch removes the feature everywhere rather than leaving a card pointing at a section that no longer renders.

### 4.5 Routing and build

Each page is a directory entry, exactly like `/security/` — no router, nothing client-side that can disagree with what is deployed. For each of the 14:

- `product/<slug>/index.html` — its own `<title>`, description, canonical, and og tags. These are what a search result and a forwarded link show, so they are written per feature, not templated from the name.
- `product/<slug>/main.tsx` — five lines, rendering `<FeaturePage id="…" />`.
- an entry in `vite.config.ts` `rollupOptions.input`.
- a line in `public/sitemap.xml`.
- a row in the `PAGES` list in `src/pages/__tests__/pages.test.tsx`, which asserts the structural invariants every page shares.

Slugs are the feature's name, lowercased and hyphenated: `/product/medical-chronologies/`, `/product/ask-al/`, `/product/qme-ame-deep-analysis/`. They are permanent once published — a renamed slug is a dead link in someone's email.

`nginx.conf` needs no change: `try_files $uri $uri/ /index.html` already serves a directory entry at its clean URL. Verify this rather than assume it, in Docker, before the deploy.

### 4.6 Copy rules

Outcome first, mechanism second. No hours-saved or money-recovered claims: plaintiff firms work on contingency, and the research is clear that "hours saved" is defence-firm framing. No competitor comparisons by name. No number that is not measured — which for illustrations means **no accuracy percentage of any kind** (§7).

---

## 5. What is removed, reused and re-parented

**Deleted:** `src/story/Story.tsx`, `chapters.ts`, `ChapterList.tsx`, `Stage.tsx`, `useStoryMode.ts`, `useActiveChapter.ts`, `Story.css`, and their tests. The pinned-scroll mechanic and the "Chapter N" framing go with them.

**Reused:** the state visuals in `src/story/states/` move to `src/sections/visuals/`. They are already self-contained; only imports change. Each gets exactly one home, so none is orphaned and none appears twice:

| Visual | New home |
|---|---|
| `Signals` | beside the Hero, preserving the current above-the-fold composition |
| `ChronologyState` | the Medical Chronologies page |
| `AskPreview` | the Ask AL page |
| `Output` | the Case Management Summary page |
| `Arrival` | the Missing Records & Gaps page — it shows what arrived, against what was referenced |
| `Review` | the Conflicting Records & Opinions page — a conflict held for a person to resolve |

Feature pages are wide, so the panels run at roughly the width they were designed for. The container queries added while they lived in cards stay: they are correct at any width, and they are what lets the same panel sit in a narrower column later without being rebuilt.

Each visual keeps its "Sample data" mark. On a page that describes a real capability, an unmarked fabricated screen is the single most damaging thing we could ship.

**Re-parented:** `Hero` is copy-only and currently sits inside Story's grid. It becomes its own `<section>` above Product, keeping its own CSS. Its "See how it works" button points at `HOW_IT_WORKS_URL`, which changes from `/#story-arrives` to `/#product`.

**Home page order after the change:** Hero → Product → Ask AL → Solutions → Trust → Conversion.

The standalone `AskAl` section stays. It demonstrates grounded answering with citations and a refusal, which a one-line card cannot; the Product card links to it.

---

## 6. Navigation, Security, About

### 6.1 Navigation

`SITE_LINKS` keeps four entries: Product, Solutions (`/#solutions`), Security, About, plus Login and the "Schedule a call" button. Login uses the existing production Autolaw destination, `https://case-app-1055716306475.us-central1.run.app/login`, in desktop nav, mobile nav, and footer. This is the sole explicitly approved raw Cloud Run URL; `app.autolaw.ai` remains unused until its DNS record exists, and self-serve trial remains disabled.

**Product is now a dropdown**, not an anchor. It opens onto the two phase columns, each listing its features as links to `/product/<slug>/`, with the phase heading and its line above — the anytimeai.ai shape. Requirements: it opens on hover AND on click/Enter, closes on Escape and on focus leaving, is a real `<button aria-expanded>` controlling a labelled list, and every entry is reachable by keyboard in DOM order. On narrow screens it renders inside the existing mobile menu as a nested list, always expanded — a disclosure inside a disclosure is a trap on a phone. The Product label itself also links to the home Product section for anyone who clicks rather than opens.

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
4. **Every feature page is scanned**, not just the home page. 14 new pages are 14 new places for a claim to appear, and the guard's page list must grow with them — including their `<title>` and meta description, which the guard already scans raw for the existing pages.
5. **A page exists only for a feature that has one.** A test asserts that the set of `slug`s matches the set of built routes in `vite.config.ts` and the sitemap, so a page cannot be shipped that nothing links to, and a link cannot point at a page that was never built.

No rendered sample from media-engine ships on the site. The one real render inspected on 2026-09-15 has garbled label text ("Plaufinit" for "Plaintiff") — exactly what its own OCR drift check exists to catch.

---

## 8. Owner inputs still needed

1. **About interview** — six questions, to be asked in the implementation session: what you saw that made this worth building; who you built it with; what the first firm used it for; what you refuse to do that a competitor would; who is on the team and what each person does; whether you want roles listed.
2. **Privacy and terms text** — unchanged from the refresh spec; both routes render nothing until supplied.

---

## 9. Non-goals

A pricing page (an explicit non-goal in the 2026-08-05 design doc, and neither reference site publishes prices). Per-phase aggregate pages. Customer logos or testimonials until real ones exist with permission. Any link into `app.autolaw.ai` while its DNS record is absent.

---

## 10. Testing

- The claim guard covers the new rules in §7, and the non-vacuity floor rises to account for the new section.
- A product-data test asserts every `Feature` has a non-empty `line`, at least two `detail` bullets, a valid phase list, and that no `coming-next` feature claims an `output`.
- A11y: the expandable cards get a keyboard and `aria-expanded` test; the story-mode tests are deleted with the story.
- Existing suites (275 tests) stay green; story-specific tests are removed rather than adapted.
