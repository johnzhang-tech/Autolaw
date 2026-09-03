# Autolaw.ai correction release — design

**Date:** 2026-09-02
**Status:** approved, in progress
**Scope:** the `site-redesign` branch as reviewed on 2026-09-02, corrected so it can replace
the live `www.autolaw.ai` build. The full refresh (pinned story, Ask AL, silhouette figure,
practice-specific conversion) is a separate spec that follows this release.

---

## Why a correction release first

The live site still ships fabricated customer logos and a raw Cloud Run login host. The
branch is categorically better, but a code review on 2026-09-02 found that some of its copy
asserts behaviour the product does not have, and that every primary CTA points at a host
with no DNS record. Shipping it as-is would replace one credibility problem with another.
This release fixes only what stands between the branch and production, and nothing that
belongs to the refresh.

## What changes

### 1. Claims that outran the product

Verified against `case-app` on 2026-09-02.

| Site said | Product does | Site now says |
|---|---|---|
| "flags the gap and drafts the records request" | Lists the gap with `Needed: {document type}`, Approve/Reject. Drafts nothing. | "flags the gap and lists the imaging report as needed" |
| action label "Draft records request", cite "Records request drafted" | same | "Needed: imaging report", "Flagged as missing" |
| "Detects referenced-but-absent records and drafts the request" | same | "…and lists what is needed" |
| "Two practices, two products" / "separate products" / "its own intake" | One engine, two template configurations (`PI Demand Readiness`, `WC Claim Readiness`); the internal spec forbids them becoming separate products | "Two practices, two workflows": one engine configured per practice, each with its own screens and outputs |
| "reads the intake calls" | Meeting/intake transcription code exists; Smart Intake is flag-disabled in production | "intake notes" |
| "every access logged" | Document access is logged | "every document opened is logged" |
| offers "Confirm · Flag" on a fact | Review actions are Confirm/Dismiss and Approve/Reject | "Confirm · Dismiss" |

A site-wide vocabulary guard (`src/__tests__/claims.test.tsx`) renders every page and fails
on any retired phrase, so none of these can return silently.

### 2. CTA policy

- **"Schedule a call" is the only primary CTA.** Hero, nav, chronology, and closing section.
- **The trial is behind `TRIAL_ENABLED` (false).** When true, "Analyze one report" appears as a
  secondary CTA, and its copy describes the real trial: upload one QME, AME, or IME report.
  It never says "case file". The guard asserts the trial link is absent while the switch is off.
- **`LOGIN_URL` is nullable and null.** `app.autolaw.ai` has no DNS record and the raw Cloud
  Run host may not appear on the site. Nav and footer render no login link while it is null.
- The hero's secondary control is "See how it works", an in-page link.

### 3. Serving

`nginx.conf`: unknown paths return a real 404 page instead of the home page with a 200;
hashed assets get a one-year immutable cache; HTML is `no-cache`; gzip is on; security
headers are sent (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`,
`Strict-Transport-Security`, and a Content-Security-Policy that allows only self, Google
Fonts, and the Google Calendar frame). `Dockerfile` uses `npm ci` from a committed lockfile.

### 4. Site basics

SVG favicon with a PNG fallback, `robots.txt`, `sitemap.xml` naming the four pages, and a
static `404.html`.

### 5. Repository hazards

`scripts/deploy-cloudrun.sh` injected a session secret, a database URL, and an OpenAI key
into the marketing site's Cloud Run service. It now builds the static image and deploys it
with no environment. The README's buildpack path, which would have run `vite preview` in
production, is removed. `env_names.txt` and the stale `LINKS.md` are deleted.

## Claim audit

Every capability statement that remains on the site, and where it is true in `case-app`.
Confirmed 2026-09-02 unless noted.

| Claim | Evidence |
|---|---|
| Every fact cites document, page, and sentence; one click opens it | `src/ui-kit/provenance/PageCiteLink.tsx`, `CitationPanel.tsx`, `CitationPopover.tsx`; timeline `CitationLine.tsx` |
| Conflicts surfaced with both sources, never auto-resolved | `workersCompMedicalLegalContradictionService.ts`; `ContradictionMatrixSection.tsx` with Approve/Reject |
| Uncited findings kept apart from cited ones | evidence-review lane, `2026-07-28-evidence-review-lane-clarity-design.md` |
| Referenced-but-absent records listed with the needed document type | `features/workers-comp/MissingEvidenceSection.tsx` (`Needed: …`) |
| Attorney confirms before a value becomes case truth | `packages/shared/src/schema.ts` review-status defaults; `ReviewQueueScreen.tsx` Confirm/Dismiss |
| One firm, one boundary, enforced on the server | `docs/superpowers/specs/tenant-isolation-contract.md`; CI lint on ungated queries |
| Document access is recorded and reviewable | `apps/server/src/audit/auditLogger.ts`, `auditPhiRead.ts`, `/admin/audit-logs` |
| Dropbox integration | firm-level OAuth and sync worker (131 files) |
| Separate PI and WC workflows, screens, and outputs | `packages/shared/src/caseTemplates.ts`; `pi-overview/`, `workers-comp/`; `practice-route-guard.ts` |
| QME/AME vs PTP, work status, MMI/P&S, apportionment, UR/IMR | WC Intelligence tabs and `wcCockpitModel.ts` readiness cards |
| PI causation, treatment gaps, specials, liens, prior injuries, demand narrative | PI Overview Medical tab cards; ledger/liens; demand package DOCX export |
| SOC 2 Type II report, BAA on request, case content never trains a model | Business documents held by the owner; reconfirmed 2026-09-02. Not evidenced in code. |
| No per-page or per-document fees | Pricing model stated by the owner 2026-08-05. |

## Not in this release

Practice-specific conversion, scroll animation, self-hosted fonts, Ask AL, the anatomical
figure, `/privacy/` and `/terms/`, ESLint, and deleting `server/` and `shared/`. All belong to
the refresh or its follow-ups.

## Launch dependencies, outside this repo

1. Cloud Run: build and deploy this image over the `autolaw` service in `us-west1`.
2. Apex `autolaw.ai` must redirect to `https://www.autolaw.ai`, not to the raw service URL
   (Cloud Run domain mapping for the apex, or a redirect at the DNS provider).
3. For the refresh, not this release: DNS for `app.autolaw.ai`, and `TRIAL_SIGNUP_ENABLED`
   on `case-app`.
