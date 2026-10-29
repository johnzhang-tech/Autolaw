# Selling the platform, not only the reports

Date: 2026-10-29
Status: approved, implementing

## 1. The defect

`/pricing` is titled "Pay for the reports you order" and sells exactly that. The platform
gets one navy band, one sentence, and a button pointing at the same generic
"Schedule a call" as every other CTA on the site — so a firm that wants the whole product
learns nothing about what it includes or how to buy it, and the enquiry arrives with no
indication of what they were after.

## 2. What the product actually offers, which constrains the copy

- **`reports_tier` is a restriction, not an add-on.**
  `packages/shared/src/reports-tier-routes.ts` is an allowlist enforced in
  `isAuthenticated`: a Reports-tier firm may order reports, buy packs, list cases and use
  a scoped Ask AL, and every other route returns 403. A firm *without* that entitlement
  row has the whole product. Reports are the cut-down tier, not an upsell under it.
- **There is no subscription billing.** Stripe sells report packs and nothing else
  (`apps/server/src/billing/reportPacks.ts`). Every platform tenant is provisioned by
  hand. "Contact sales" is therefore the literal mechanism, not a euphemism for one.
- **The product already routes this intent.**
  `/api/trial/medical-legal/upgrade-interest` takes sources including `more_reports` and
  `locked_surface`. In the app, "I want more than reports" already reaches a human. The
  website is the only place it does not.

## 3. Decisions

| Question | Decision |
| --- | --- |
| How the platform is priced, on the page | **Say nothing about structure.** No per-firm, per-seat or annual claim — none is verifiable, and every tenant is hand-provisioned. The page says there is no published price and asks about the practice. |
| Scope | Two plans side by side on `/pricing`, **plus** a `/platform` page for depth. |
| Contact sales | `/schedule-call/?interest=platform`, mirroring the existing `?practice=pi` pattern. No second contact system. |

The retired claim: "Priced per firm rather than per report." It goes, and it does not come
back — nothing in case-app prices anything per firm.

## 4. What the platform adds, derived rather than written

A hand-written inclusion list drifts from the product the first time a feature moves. So
the comparison is computed from the data already in `src/data/product.ts`:

```
REPORTS_TIER_FEATURE_IDS  the three orderable reports, plus ask-al
PLATFORM_ADDS             every live feature that is not one of those
```

`ask-al` sits in both deliberately: reports-tier firms get it scoped to read-and-cite
(the ai-zone route is on the allowlist), platform firms get it whole. The page says so
rather than implying Ask AL is platform-only.

Guards: every `PLATFORM_ADDS` entry is `live` and routed; the two sets do not overlap;
together they account for every live feature, so a new one cannot land in neither.

## 5. Pages

**`/pricing`** — the hero stops being about reports. A new plans section sits above the
pack cards:

- *Reports* — per report, ordered by your team, no subscription. Price renders from
  `REPORT_PACKS` exactly as now; while null it reads "Priced on a call". Links down to
  the pack detail already on the page.
- *Platform* — everything in the product, priced for the firm, no published figure.
  Links to `/platform` and to contact sales.

The navy band is replaced by a link into `/platform`; the pack, coverage, availability
and FAQ sections are unchanged.

**`/platform`** — new route. What the platform is, what it adds over reports (derived),
the cross-phase strip from `PLATFORM`, a trust link, and contact sales. **No price, and
no structure claim.** Standard page scaffolding: directory entry in `vite.config.ts`,
`main.tsx`, sitemap entry, and registration in the credibility, claims, pages and
link-integrity suites.

**`/schedule-call/`** — gains an `interest` parameter read the same way `practice` is,
and carries it into the composed message so an enquiry says which half of the business it
is about.

## 6. Out of scope

Subscription billing, seat management, any self-serve platform purchase, and the in-app
upgrade-interest flow. All case-app, none of it this repository's business.
