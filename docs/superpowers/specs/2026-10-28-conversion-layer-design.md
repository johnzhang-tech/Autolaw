# Autolaw — the call-first conversion layer

Date: 2026-10-28
Status: design, awaiting review

## 1. The problem this solves

Autolaw sells three reports today. A stranger cannot find out that they exist.

`case-app` has a complete pay-per-report motion: `REPORT_TYPES` in
`packages/shared/src/reports-tier.ts` launches `chronology` and `howell` for personal
injury and `chronology` and `qme_ame_memo` for workers' compensation; orders run through
`apps/server/src/routes/reportsOrders.ts` with a 2,000-page limit and a 30-day free
refresh; money moves through `routes/reportCheckout.ts` and `routes/stripeWebhook.ts`
against Stripe packs of 1, 5, and 10 credits; and firms sign themselves up at `/trial`
with email verification and one entitlement per firm.

The marketing site mentions none of it. It has fourteen feature pages, a Trust Center, a
blog, and exactly one call to action: schedule a call. The funnel has an engine and no
door.

Two switches keep that engine unreachable from outside: `app.autolaw.ai` has no DNS
record (`APP_HOST_LIVE = false` in `src/config.ts`), and `TRIAL_SIGNUP_ENABLED=false` on
the case-app service. Neither is this phase's business to flip.

So this phase builds the half that is missing — the pages that explain and price the
reports — and keeps every call to action pointing at a call, because that is the only
handoff that works today. When the switches flip, the destinations change and the pages
do not.

## 2. What the audit found

### Already done, do not rebuild

- Multi-page Vite build, 23 pages, directory entries in `vite.config.ts`, no router.
- Fourteen feature pages at `/product/<slug>/`, each with unique meta, an outcome
  promise, three workflow steps, and an explicit list of refusals.
- `Availability = 'live' | 'early-access' | 'coming-next'` in `src/data/product.ts`, with
  `AVAILABILITY_LABEL` for the two non-live states. `live` renders no label, so the
  absence of a label is itself the claim.
- Trust Center at `/security/`, `/security/subprocessors/`, `/security/ai/`, with SOC 2
  and BAA stated as planned rather than held.
- Three guard suites: `claims.test.tsx` (13 retired phrases, each with the reason it was
  untrue), `credibility.test.tsx` (fabricated assets and raw hosts), `a11y.test.tsx`.
- Switch-and-slot config pattern in `src/config.ts`: `CUSTOMER_LOGOS`, `WALKTHROUGH_URL`,
  `BOOKING_URL`, `CONTACT_ENDPOINT`, `PRIVACY_TEXT` all render nothing until real content
  arrives. New work follows this pattern rather than inventing another.

### P0 — wrong or missing, fix first

1. **`public/sitemap.xml` has an invalid namespace.** It reads
   `xmlns="http://www.sitemap.org/schemas/sitemap/0.9"`. The correct host is
   `www.sitemaps.org`, with an `s`. A validator rejects the document, which can cost the
   whole file.
2. **The aspirational headline survives where search engines read it.** The `<h1>` is
   `Know where every fact came from.`, which is concrete and good. But `<title>` and
   `og:title` in `index.html` still say `Turn case complexity into legal advantage` —
   the line that appears in results and link previews.
3. **No `/pricing`, no `/sample-reports`, no buyer-facing report catalog.** The three
   sellable reports sit among fourteen feature cards with equal weight, so nothing tells
   a visitor which ones they can actually buy.
4. **No analytics of any kind.** Not a provider, not an event, not a page view.

### P1

5. **Lead capture is a `mailto:` composer.** `CONTACT_ENDPOINT` is `null`, so
   `/schedule-call/` validates natively and then hands the visitor a pre-composed mail
   message. Nothing is persisted, no attribution is captured, and no UTM survives into
   the app.
6. **No structured data anywhere.** No JSON-LD on any page.

### P2

7. `/privacy/` and `/terms/` render empty by design; the footer hides them while
   `PRIVACY_TEXT` and `TERMS_TEXT` are empty. Correct behaviour, but a firm running
   vendor diligence will look for them.
8. Uncommitted work in progress on `nginx.conf`, `src/__tests__/canonical-host.test.ts`,
   and the apex spec. Land or stash before starting.

## 3. Decisions taken

| Question | Decision |
| --- | --- |
| Commercial motion | Call-first. Publish honest prices; every CTA is "Schedule a call". No checkout button on the public site while `app.autolaw.ai` does not resolve. |
| Prices | Real per-report amounts, read from live Stripe prices by the owner and pasted into one config constant. Until that constant is filled, the amount renders as a placeholder and the page still ships. |
| Sample reports | Synthetic. A fictional case, labelled as fictional above the fold and on every download. No client file in `public/`. |
| Report catalog | Derived from the existing `FEATURES` array, not a parallel data source. |
| Availability display | Follow the codebase: `live` gets no chip. Only `early-access` and `coming-next` are labelled. |

## 4. The plan, step by step

Each step is independently shippable and leaves the build green.

### Step 1 — Clear the P0 bugs

- Correct the sitemap namespace to `http://www.sitemaps.org/schemas/sitemap/0.9`.
- Change `<title>` and `og:title` in `index.html` to match the positioning the `<h1>`
  already carries: `Autolaw — evidence-linked reports for PI and workers' comp firms`.
  Keep the existing `<meta name="description">`, which is already concrete.
- Add a test to `canonical-host.test.ts` (or a new `sitemap.test.ts`) that parses
  `public/sitemap.xml`, asserts the namespace, and asserts that every entry in
  `vite.config.ts`'s `rollupOptions.input` has a matching `<loc>` except the pages
  deliberately withheld. This is the step that stops the next page from being forgotten.

### Step 2 — Derive the report catalog

Add to `src/data/product.ts`:

```ts
/**
 * The reports a firm can order per case, as distinct from the fourteen features that
 * make up the platform. Each entry names a feature id, so the catalog cannot describe a
 * report whose feature page does not exist, and availability is read from that feature
 * rather than restated here.
 */
export interface ReportProduct {
  featureId: string;
  practiceAreas: ReadonlyArray<'PI' | 'WC'>;
  /** The buyer's problem, in their words, not ours. */
  problem: string;
  /** Exactly three. More is a feature list; fewer is a slogan. */
  deliverables: readonly [string, string, string];
  /** The boundary, where one is needed to keep the claim honest. */
  boundary?: string;
  sampleSlug?: string;
}

export const REPORT_PRODUCTS: ReadonlyArray<ReportProduct> = [ /* ... */ ];
```

Three entries: `medical-chronologies` (PI + WC), `case-value` (PI, the Howell analysis),
`qme-ame` (WC). Export a resolver that joins each to its `Feature` and throws on an
unknown id, so a typo fails the build rather than rendering an empty card.

Add a guard to `claims.test.tsx`: every `REPORT_PRODUCTS` entry resolves, and any entry
whose feature is not `live` renders its `AVAILABILITY_LABEL`.

The illustrations card is **not** a `ReportProduct`. It is `early-access` in
`product.ts`, so it renders from `FEATURES` as a labelled aside with no order path.

### Step 3 — Build `/pricing`

New directory entry `pricing/index.html`, page component at
`src/pages/pricing/PricingPage.tsx`. Sections, in order: pack cards; what one credit
covers; which reports each practice area can order; the platform alternative; the FAQ;
the call CTA.

Prices come from a new constant in `src/config.ts`, following the `CUSTOMER_LOGOS`
pattern:

```ts
/**
 * Report packs, mirroring case-app `apps/server/src/billing/reportPacks.ts`. Amounts
 * live in Stripe, so `priceUsd` is the one place a human copies them in after reading
 * the live prices for `case_app_reports_1 / _5 / _10`.
 *
 * null is not a placeholder to be guessed at: while null, the card shows the pack
 * structure and routes the visitor to a call for the amount. Never publish a price that
 * has not been read off the live Stripe price.
 */
export const REPORT_PACKS: ReadonlyArray<{ packId: string; reports: number; priceUsd: number | null }> = [
  { packId: 'reports_1', reports: 1, priceUsd: null },
  { packId: 'reports_5', reports: 5, priceUsd: null },
  { packId: 'reports_10', reports: 10, priceUsd: null },
];
```

The numbers already safe to publish are the entitlement facts, because they are in code
rather than in Stripe: the 2,000-page order limit, the 30-day and 500-page free refresh,
and the Word export. These come from `reports-tier.ts` and need no approval.

Guard: a test asserting that no rendered price appears unless its `priceUsd` is non-null.

### Step 4 — Build `/sample-reports`

New directory entry, page at `src/pages/sample-reports/SampleReportsPage.tsx`, content in
a new `src/data/sampleReports.ts`.

- A fictional-case notice above the fold, and the same notice in any download.
- Three sample cards, each stating what went in, what came out, and how many flags.
- Two inline previews, because an attorney will not download a PDF to decide whether to
  take a call: a chronology extract, and a Howell reconciliation table.
- The chronology extract shows all four things a reviewer checks: a cited entry, a second
  cited entry, a flagged disagreement between two records reproducing both, and a named
  missing-records gap written in the product's own `Needed: {document type}` form.
- The Howell table shows billed, paid, adjusted, and outstanding per provider with a
  source column, a total row, and a flagged possible duplicate charge.

Hard rules: no real client file in `public/`; the fictional names must not resolve to a
real firm, provider, or reported case; and `claims.test.tsx` gains a guard asserting the
fictional-case notice renders on the page.

### Step 5 — Wire the homepage, nav, and footer

- `SITE_LINKS` in `src/navigation.ts` gains `Reports` and `Pricing`. `Solutions` moves
  into the product menu, keeping the nav at six items; the `/#solutions` anchor stays
  where it is, so no link breaks.
- A new `Reports` section between `HeroSection` and `Product` on the homepage, reading
  from `REPORT_PRODUCTS`. This is the change that matters most: it is what a stranger
  meets in the first screenful.
- A pricing strip before `Conversion`.
- The hero's secondary CTA becomes `View sample reports`, which is a real destination;
  `See how it works` stays as the in-page anchor it already is.
- Footer gains Pricing and Sample reports.

Hero copy itself does not change. It is already outcome-focused and the proposed
replacement is weaker.

### Step 6 — Measurement

New `src/analytics.ts` exporting one function:

```ts
export function track(event: AnalyticsEvent, props?: Record<string, string | number>): void
```

`AnalyticsEvent` is a string union, so an untracked event name fails to compile. A
`ANALYTICS_PROVIDER: string | null` switch in `config.ts` keeps it inert until a provider
is chosen; while null, `track` is a no-op in production and a `console.debug` in dev.
Recommend Plausible or similar: no cookies, no consent banner, no personal data.

Events this phase emits: `landing_viewed`, `report_card_selected`, `sample_viewed`,
`pricing_viewed`, `cta_clicked`, `schedule_started`, `login_clicked`.

UTM and referral parameters are read once on first load, kept in `sessionStorage`, and
written into hidden fields on `/schedule-call/` so attribution survives into whatever
`CONTACT_ENDPOINT` eventually receives. A guard asserts the event payload type permits
only scalars, so a case name or document cannot be passed by accident.

#### Provider: Umami Cloud (2026-11-17)

The owner chose Umami Cloud, free plan, in the account that already holds CIDSnap; each
site has its own website id. It sets no cookie, needs no consent banner and does not
identify visitors. `ANALYTICS_PROVIDER` is gone. The switch is now a website id read at
build time:

- **Build config.** `VITE_UMAMI_WEBSITE_ID` in `.env.production`, which `vite build` reads
  and dev and tests do not. The Dockerfile copies it in and the Cloud Build trigger builds
  that Dockerfile, so committing the id is the whole deploy step. Empty, or anything that
  is not exactly a UUID, ships the site exactly as before: no script, no request.
- **Tracker.** `startPageAnalytics` (every page entry) adds `https://cloud.umami.is/script.js`
  with `data-domains="www.autolaw.ai"`, `data-do-not-track`, `data-exclude-search` and
  `data-exclude-hash`. The tracker sends its own page view; error and performance
  reporting stay off. It normalises the referrer the same way as the page address, so
  neither carries a query string.
- **Events.** `deliver()` hands the event and its scalar props (attribution included) to
  `window.umami.track`, inside a try/catch with any rejected promise swallowed. Events
  emitted before the tracker loads, which is nearly always the page view, are held in a
  queue of at most ten, earliest kept, and released in order on load. If the script
  errors (content blocker, network, CSP), the queue is dropped and nothing more is held.
- **CSP.** `script-src` adds `https://cloud.umami.is`; `connect-src` adds
  `https://gateway.umami.is`. That endpoint was read from the live tracker (it posts
  to `${data-host-url || "https://gateway.umami.is"}/api/send`) and then watched in a
  browser under this CSP, with no redirect. `src/__tests__/csp.test.ts` ties the header to
  the constants in `src/config.ts`.
- **Trust Center.** The Umami row on `/security/subprocessors/`, and version 1.1 of the
  list, appear on exactly the builds that set the website id.

Draft privacy-policy sentence, for `PRIVACY_TEXT` when the policy is published (wording
pending the owner's approval):

> We measure visits to autolaw.ai with Umami, a tool that sets no cookie and does not
> identify you. It records the page you opened without its query string, the site that
> sent you, your browser, device, language and country, and a few named actions such as a
> click on "Schedule a call". Nothing from the Autolaw application is sent to it.

### Step 7 — Structured data

JSON-LD on three page types only, where it is accurate: `Organization` on the homepage,
`FAQPage` on `/pricing` (the questions are real and answered on the page), and
`BreadcrumbList` on the product and sample pages. No `Product` markup with a price until
`priceUsd` is non-null — invented `offers` is exactly the kind of claim the guards exist
to stop.

### Step 8 — Verify

`npm run test` (lint plus vitest), `npm run build`, then walk every public CTA against
the built output. Capture desktop and mobile screenshots of the three changed or new
routes.

## 5. Availability and claims matrix

| Advertised | State | Evidence |
| --- | --- | --- |
| Medical Chronology | Live, orderable | `product.ts` `medical-chronologies` is `live`; `reports-tier.ts` launches `chronology` for both practice areas |
| Howell & Medical Specials | Live, orderable | `product.ts` `case-value` is `live`; `reports-tier.ts` launches `howell` for personal injury |
| QME / AME Analysis | Live, orderable | `product.ts` `qme-ame` is `live`; `reports-tier.ts` launches `qme_ame_memo` for workers' comp |
| Demand draft, lien exposure, lost earnings, benefits audit | Preview, per firm | `REPORT_PREVIEW_TYPES` gated behind the `reports_preview` capability row |
| Accident & Injury Illustrations | Early access, not orderable | `product.ts` `illustrations` is `early-access` |
| Discovery Responses, Deposition Review | Coming next | `product.ts`, both `coming-next` |
| Self-service signup | Built, unreachable | `/trial` exists in case-app; `TRIAL_SIGNUP_ENABLED=false` and `app.autolaw.ai` has no DNS record |
| Pay-per-report checkout | Built, unreachable | `reportCheckout.ts` and `stripeWebhook.ts` exist; reachable only inside the app |
| SOC 2 | In preparation | Type I planned Q2 2027; evidence annex claim OV-2 |
| BAA / HIPAA | Planned | Blocked on the Gemini Developer API not being HIPAA-covered; claim OV-1 |

## 6. Conversion architecture after this phase

```
Organic search / referral
  -> / or /medical-chronology-style product page
  -> Reports band: which report answers my problem
  -> /sample-reports: is the work product any good
  -> /pricing: what does it cost, what does a credit cover
  -> /schedule-call/  [the only handoff]
  -> mailto composer, attribution attached   <-- manual step remains here
  -> owner replies, call happens, firm workspace created in case-app by hand
  -> firm buys credits and orders reports self-service, inside the app
```

The manual step is deliberate and is the one to remove next. Everything downstream of
the call is already self-service; everything upstream is now self-service too. The call
is the join.

## 7. Measurement specification for the product phase

Not implemented here. These belong in case-app, emitted server-side where the facts are
known: `upload_started`, `upload_completed`, `validation_passed`, `validation_failed`,
`checkout_started`, `checkout_completed`, `report_generation_completed`,
`report_generation_failed`, `report_downloaded`, `repeat_purchase`. Each carries a tenant
id and a report type and nothing else — never a case name, a party, a provider, or a
page of a record.

## 8. Product backlog for the next phase

In rough dependency order.

1. Create the `app.autolaw.ai` DNS record and the Cloud Run domain mapping, then flip
   `APP_HOST_LIVE`. Section 9 of the apex spec has the record and the command.
2. Set `TRIAL_SIGNUP_ENABLED=true` and confirm `/trial` and `/trial/verify` end to end
   on the deployed service.
3. Read the live Stripe prices for `case_app_reports_1 / _5 / _10`, confirm they are
   active one-time prices in live mode, and fill `priceUsd`.
4. Decide whether a firm can reach checkout before a human has met them, which is a
   business question about fraud and page-limit abuse, not an engineering one.
5. Build the public order entry point: a report type and practice area chosen on the
   marketing site, carried into signup, so a visitor does not land in an empty app.
6. Replace the `mailto` lead path with a real endpoint, persisting before notifying, with
   rate limiting and bot protection. Then set `CONTACT_ENDPOINT`.
7. Trial quota and entitlement display, so a firm can see what it has left.
8. Failure handling a stranger can understand: a refused page limit, a file that will not
   parse, a generation that fails after payment.
9. Repeat purchase and credit top-up in the app's own UI.
10. Publish the privacy policy and terms, revised to cover model training, subprocessors,
    and the BAA position, then fill `PRIVACY_TEXT` and `TERMS_TEXT`.

## 9. Blockers

Actionable, with the owner named.

| Blocker | Owner | Blocks |
| --- | --- | --- |
| Live Stripe prices for the three packs have not been read | Owner | Real amounts on `/pricing`; the page ships without them |
| `app.autolaw.ai` DNS record and Cloud Run domain mapping | Owner | `APP_HOST_LIVE`, and every CTA that would point into the app |
| `TRIAL_SIGNUP_ENABLED` is false | Owner | Any self-service signup CTA |
| Umami website id for autolaw.ai not yet created (provider chosen 2026-11-17) | Owner | Step 6 ships inert until the id is in `.env.production` |
| Privacy policy and terms not drafted | Owner / legal | `/privacy/`, `/terms/`, and the footer links to them |

Nothing in steps 1 through 8 is blocked by any of the above.
