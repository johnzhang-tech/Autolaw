/**
 * Every outbound URL and gated asset in one place.
 *
 * APP_ORIGIN is the canonical app host. Whether anything may link to it is APP_HOST_LIVE's
 * business, not that constant's. See the launch dependencies in
 * docs/superpowers/specs/2026-08-05-autolaw-site-redesign-design.md.
 */
export const APP_ORIGIN = 'https://app.autolaw.ai';

/**
 * The one raw Cloud Run host the site may show a visitor, and only while APP_HOST_LIVE is
 * false. The credibility guard rejects every other raw service URL, and permits this one
 * only in this file.
 *
 * It is a brand leak accepted because the alternative is no login link at all: someone
 * clicking "Log in" watches the address bar turn into the case-app service's own Cloud Run
 * hostname. That is the same defect as the apex redirect — the product answering to a
 * Google hostname instead of its own — on a different door, and APP_HOST_LIVE is what
 * closes it. (The host is not spelled out in this comment on purpose: the credibility
 * guard greps for it, and a second copy here would be a second place to miss.)
 */
export const APPROVED_CLOUD_RUN_LOGIN = 'https://case-app-1055716306475.us-central1.run.app/login';

/**
 * Whether app.autolaw.ai resolves yet. It does not: no DNS record and no Cloud Run domain
 * mapping, verified 2026-10-19.
 *
 * This is the whole switch. While false, the login door stays on APPROVED_CLOUD_RUN_LOGIN
 * and no link into APP_ORIGIN may render. Flipping it to true moves the door to
 * `${APP_ORIGIN}/login`, and the guards invert with it: a link into APP_ORIGIN stops being
 * a dead end, and a raw Cloud Run host in any rendered link becomes the failure instead.
 * Both states are asserted, so neither is the untested one.
 *
 * Do not flip it before the DNS record and the domain mapping both exist, or every "Log in"
 * on the site points at a host that does not resolve. The record to create, the command,
 * and the case-app setting that has to match are in
 * docs/superpowers/specs/2026-10-18-apex-canonical-host-design.md, section 9.
 *
 * TRIAL_ENABLED is a separate switch and stays off regardless: the trial additionally needs
 * TRIAL_SIGNUP_ENABLED=true on the case-app service.
 */
export const APP_HOST_LIVE = false;

/** The login door, following APP_HOST_LIVE. */
export const LOGIN_URL = APP_HOST_LIVE ? `${APP_ORIGIN}/login` : APPROVED_CLOUD_RUN_LOGIN;

/**
 * Where the schedule-a-call form posts (case-app POST /api/leads). The case-app origin, derived rather than spelled:
 * the credibility guard permits the raw Cloud Run host only inside APPROVED_CLOUD_RUN_LOGIN, and the API follows
 * APP_HOST_LIVE exactly as the login door does. nginx.conf's connect-src must list this origin; csp.test.ts holds
 * them together, so flipping APP_HOST_LIVE fails `npm test` until nginx is updated in the same change.
 */
export const LEADS_API_ORIGIN = APP_HOST_LIVE ? APP_ORIGIN : new URL(APPROVED_CLOUD_RUN_LOGIN).origin;
export const LEADS_API_URL = `${LEADS_API_ORIGIN}/api/leads`;

/**
 * The self-serve trial, off. Two things have to be true before this flips: app.autolaw.ai
 * must resolve, and TRIAL_SIGNUP_ENABLED=true must be set on the case-app service, or
 * /trial returns 404. While false, no trial CTA renders anywhere — the claim guard asserts
 * it — and "Schedule a call" is the only primary action on the site.
 *
 * When it flips, the copy beside the button must describe the trial as it is: the visitor
 * uploads ONE QME, AME, IME, or narrative report and gets it chronologized with page cites.
 * It is not "upload a case file", and the guard fails the build on that phrase.
 */
export const TRIAL_ENABLED = false;

/** Requires TRIAL_SIGNUP_ENABLED=true on the case-app service, or this 404s. */
export const TRIAL_URL = `${APP_ORIGIN}/trial`;

export const CONTACT_EMAIL = 'hello@autolaw.ai';

/**
 * The sales-assisted half of the dual CTA. TRIAL_URL is the self-serve lane and this is
 * the other one; both are live, and every "Schedule a call" on the site points here.
 * Relative because the page is served by this site, not the app.
 */
export const SCHEDULE_URL = '/schedule-call/';

/** The hero's secondary control. The answer to "how does it work" is now the feature
 *  grid, which is its own section with its own landmark — so this points at the section
 *  top rather than at some block inside it. */
export const HOW_IT_WORKS_URL = '/#product';

/**
 * The other two standalone pages. Named here, and referenced everywhere else, because a
 * page URL that is spelled out at each use site drifts silently — one link keeps working
 * and the other 404s, and nothing fails until a visitor finds it.
 *
 * The trailing slash is load-bearing. Each page is a directory entry
 * (`security/index.html` → `build/security/index.html`) served under nginx's
 * `try_files $uri $uri/ /index.html`; without the slash every click costs a 301.
 */
export const SECURITY_URL = '/security/';
export const ABOUT_URL = '/about/';
/** The blog index. Each post is `${BLOG_URL}${post.slug}/`, built from src/data/blog.ts. */
export const BLOG_URL = '/blog/';
/** The two public trust pages under /security/. Trailing slash as above. */
export const SUBPROCESSORS_URL = '/security/subprocessors/';
export const AI_USE_URL = '/security/ai/';

/**
 * Site-wide announcement. null renders nothing — never ship an invented announcement.
 * Example when real: { text: 'The Autolaw subprocessor list has been updated', href: '/security/subprocessors/' }
 */
export const ANNOUNCEMENT: { text: string; href: string } | null = null;

/**
 * Assets that must not be faked. Each renders nothing until a real file exists.
 * Populate only with permissioned artwork.
 */
export const CUSTOMER_LOGOS: ReadonlyArray<{ name: string; src: string }> = [];

/**
 * `mark` is the short text inside the badge disc — never derive it by splitting `label`.
 *
 * Corrected on 2026-10-03. The 2026-08-05 note that a SOC 2 Type II attestation exists
 * was wrong: the owner confirmed that SOC 2 is in preparation, with no report yet. And a
 * BAA cannot be signed today, because Autolaw's AI processing runs on the Gemini
 * Developer API, which Google's HIPAA agreement does not cover. Both badges now state the
 * plan, dated, and claims.test.tsx retires the old wording. Evidence: case-app
 * docs/trust/evidence-annex.md, claims OV-1 and OV-2.
 * `claims` names the evidence ids, as in src/data/trust.ts; they are not rendered.
 */
export const CERTIFICATIONS: ReadonlyArray<{ mark: string; label: string; detail: string; claims: ReadonlyArray<string> }> = [
  { mark: 'SOC 2', label: 'SOC 2 in preparation', detail: 'Type I report planned for Q2 2027', claims: ['OV-2'] },
  { mark: 'HIPAA', label: 'Business associate agreement planned', detail: 'Q2 2027, with HIPAA-eligible AI processing', claims: ['OV-1'] },
];

/**
 * Set to a real URL to reveal the walkthrough CTA in the hero. The hero's secondary
 * position now belongs to "Schedule a call", so a real recording arrives beside the
 * pair rather than in place of it — decide then whether it earns the slot.
 */
export const WALKTHROUGH_URL: string | null = null;

/**
 * A kill switch, not a launch gate. Ask AL ships in every case today. If it is ever pulled
 * from the product, this hides the section and drops the Ask AL card from the feature grid
 * with it — one switch, so no card is left pointing at a section that no longer renders.
 */
export const ASK_AL_ENABLED = true;

/**
 * Where the schedule-a-call form submits: case-app's POST /api/leads (LEADS_API_URL),
 * live since 2026-11-19. Null is not a placeholder to be filled in with a guess — it is
 * the switch that decides how the form behaves.
 *
 * While null, /schedule-call/ validates natively and then composes the answers into a
 * mail message the visitor sends themselves, from their own address. It never appears to
 * submit. A form that POSTs into a URL nobody is listening on is worse than no form: the
 * visitor believes they have made contact, stops looking for another route, and the lead
 * is lost silently — which for a firm evaluating vendors is the last impression you get.
 *
 * When set, the form submits its answers with `fetch` as JSON (no cookies) and shows the
 * answer on the page. A failure of any kind — network, timeout, an error status — shows the
 * same composed mail message instead, so a request is never lost silently.
 *
 * Reverting the commit that set it restores the composed mail message alone. Spec:
 * case-app/docs/superpowers/specs/2026-11-18-autolaw-lead-capture-design.md.
 */
export const CONTACT_ENDPOINT: string | null = LEADS_API_URL;

/**
 * Google Calendar appointment schedule booking page.
 *
 * null renders the fallback below instead — never a broken or empty embed.
 *
 * To create it (free personal Google account is enough):
 *   Google Calendar → Create → Appointment schedule → set duration and availability →
 *   Booking form → "Add an item" → add a required question "Which do you practice?"
 *   with options Personal injury / Workers' compensation / Both → Save → Share →
 *   copy the booking page link.
 *
 * Paste the link here. For the embeddable version append ?gv=true.
 *
 * Known limits on the free tier, both fixable by upgrading:
 *   - no "Require email verification", so spam bookings are possible
 *   - no automatic reminder emails to the invitee
 */
export const BOOKING_URL: string | null = null;

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

/**
 * Report packs, mirroring case-app `apps/server/src/billing/reportPacks.ts`.
 *
 * `reports` is the credit count, which is in code in both repositories and safe to state.
 * `priceUsd` is not: amounts live in Stripe, resolved at runtime from the lookup keys
 * `case_app_reports_1 / _5 / _10`, so ops can reprice without a deploy and nothing in
 * this repository can read what a pack currently costs.
 *
 * null is therefore not a placeholder waiting to be filled in with something plausible —
 * it is the switch that decides whether the page shows an amount at all. While a pack is
 * null the card states the structure and routes the visitor to a call for the figure, and
 * PricingPage.test.tsx fails the build if any dollar figure reaches the page meanwhile.
 *
 * To fill one in: open the Stripe dashboard, confirm the lookup key resolves to an ACTIVE
 * one-time price in LIVE mode, and write that number here. A test-mode price is the wrong
 * number and looks exactly like the right one.
 */
export interface ReportPack {
  packId: string;
  reports: number;
  priceUsd: number | null;
}

export const REPORT_PACKS: ReadonlyArray<ReportPack> = [
  { packId: 'reports_1', reports: 1, priceUsd: null },
  { packId: 'reports_5', reports: 5, priceUsd: null },
  { packId: 'reports_10', reports: 10, priceUsd: null },
];

/**
 * Per-report prices, mirroring the three named-report packs in case-app
 * `apps/server/src/billing/reportPacks.ts` (`case_app_report_chronology`, `_howell`,
 * `_qme_ame_memo`). Same rule as REPORT_PACKS above: null is the switch, not a placeholder —
 * while null the samples page states how a report is bought and routes to a call. Fill a
 * number in only from an ACTIVE live-mode Stripe price.
 *
 * Every order includes the chronology, so a Howell or QME/AME order costs its own price plus
 * the chronology's. The samples page prints that order total and never the add-on alone.
 *
 * Not yet read by the pricing page: when these are filled in, wire PricingPage to them in the
 * same change, so the pricing page and the sample cards show prices together.
 */
export type ReportPriceId = 'chronology' | 'howell' | 'qme_ame_memo';
export const REPORT_PRICES_USD: Readonly<Record<ReportPriceId, number | null>> = {
  chronology: null,
  howell: null,
  qme_ame_memo: null,
};

/**
 * What one credit covers, from case-app `packages/shared/src/reports-tier.ts`.
 *
 * Unlike the prices, these are constants in code on both sides, so the site may state
 * them outright. They are restated here rather than guessed because a firm will plan
 * around them: a 1,800-page record either fits in one order or it does not.
 */
export const REPORTS_ORDER_PAGE_LIMIT = 2000;
export const REPORTS_FREE_REFRESH_DAYS = 30;
export const REPORTS_FREE_REFRESH_PAGE_LIMIT = 500;

/** The pricing page. Trailing slash, as with the others. */
export const PRICING_URL = '/pricing/';
/** The public sample reports. Trailing slash, as with the others. */
export const SAMPLE_REPORTS_URL = '/sample-reports/';

/**
 * Website analytics: Umami Cloud, switched on by one build-time value.
 *
 * The provider was chosen on 2026-11-17 because it works without cookies and without a
 * consent banner, which the site has neither of, and because it does not identify the
 * visitor. The same account counts CIDSnap, under a website id of its own.
 *
 * UMAMI_WEBSITE_ID is read from VITE_UMAMI_WEBSITE_ID when the site is built, and the
 * production build reads it from .env.production in the repo root. That file is the build
 * config: the Dockerfile copies it in, and the Cloud Build trigger builds that Dockerfile
 * on every push to main. Unset, or anything that is not exactly a UUID, means what it
 * meant before a provider was chosen: no script loads and src/measure.ts sends nothing.
 *
 * The same value adds the Umami row to /security/subprocessors/ (src/data/trust.ts), so
 * the Trust Center lists the tracker on exactly the builds that run it.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A website id, trimmed, or null for anything else: the value goes into a script attribute. */
export function umamiWebsiteId(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const id = raw.trim();
  return UUID.test(id) ? id : null;
}

export const UMAMI_WEBSITE_ID: string | null = umamiWebsiteId(import.meta.env.VITE_UMAMI_WEBSITE_ID);

/** Umami Cloud's tracker. Its host is the one third party in the CSP's script-src. */
export const UMAMI_SCRIPT_URL = 'https://cloud.umami.is/script.js';

/**
 * Where that tracker posts page views and events, which is the CSP's connect-src.
 *
 * Read from the tracker, not assumed: script.js builds its endpoint as
 * `${data-host-url || "https://gateway.umami.is"}/api/send`, and a page served under this
 * site's CSP was watched posting there on 2026-11-17. If Umami moves it, the symptom is a
 * CSP violation in the console and a dashboard that stops counting; re-check both here and
 * in nginx.conf, and src/__tests__/csp.test.ts holds them together.
 */
export const UMAMI_COLLECT_ORIGIN = 'https://gateway.umami.is';

/**
 * The host every page declares canonical, and the only one visits are counted on. A tagged
 * Cloud Run preview, the raw run.app URL and a local build all load the tracker and send
 * nothing, which is the tracker's data-domains check doing its job.
 */
export const CANONICAL_HOST = 'www.autolaw.ai';

/** The platform overview. Trailing slash, as with the others. */
export const PLATFORM_URL = '/platform/';

/**
 * Contact sales. The schedule-a-call page with the half of the business named, mirroring
 * the `?practice=pi` parameter it already reads.
 *
 * Not a second contact system: one form, one inbox, one set of validation rules. The
 * parameter only decides a line in the composed message, so an enquiry arrives saying
 * whether it is about reports or the whole platform instead of making whoever answers
 * open with "which were you after?".
 */
export const CONTACT_SALES_URL = `${SCHEDULE_URL}?interest=platform`;
