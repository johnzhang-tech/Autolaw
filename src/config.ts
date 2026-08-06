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
 * The sales-assisted half of the dual CTA. TRIAL_URL is the self-serve lane and this is
 * the other one; both are live, and every "Schedule a call" on the site points here.
 * Relative because the page is served by this site, not the app.
 */
export const SCHEDULE_URL = '/schedule-call/';

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

/**
 * Nav dropdown menus. An entry with no items does not render at all — no empty
 * dropdown, no dead link, no "coming soon". Add items as their pages ship.
 * Same discipline as CUSTOMER_LOGOS: the slot stays empty until it is real.
 */
export interface NavMenuItem { label: string; href: string; description?: string }

export const RESOURCE_MENU: ReadonlyArray<NavMenuItem> = [
  { label: 'Security', href: SECURITY_URL, description: 'Controls, data handling, and certifications' },
];

export const ABOUT_MENU: ReadonlyArray<NavMenuItem> = [
  { label: 'About Autolaw', href: ABOUT_URL, description: 'Why we built this for PI and workers’ comp' },
];

/**
 * Site-wide announcement. null renders nothing — never ship an invented announcement.
 * Example when real: { text: 'Autolaw is now SOC 2 Type II certified', href: '/security/' }
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
 * The owner confirmed on 2026-08-05 that the SOC 2 Type II attestation and HIPAA
 * compliance are both real and may be displayed. This is recorded so the next engineer
 * does not have to re-litigate whether these badges are allowed on the page.
 *
 * The wording is not interchangeable, though. SOC 2 Type II is an audited attestation by
 * a named firm, so it can be claimed as a certification. HIPAA has no certifying body —
 * "HIPAA certified" is a claim nobody can issue, and an attorney knows it. What a firm
 * can actually be given is safeguards plus a signed BAA, so that is what is offered.
 */
export const CERTIFICATIONS: ReadonlyArray<{ mark: string; label: string; detail: string }> = [
  { mark: 'SOC 2', label: 'SOC 2 Type II', detail: 'Report available under NDA' },
  { mark: 'HIPAA', label: 'HIPAA safeguards', detail: 'BAA signed on request' },
];

/**
 * Set to a real URL to reveal the walkthrough CTA in the hero. The hero's secondary
 * position now belongs to "Schedule a call", so a real recording arrives beside the
 * pair rather than in place of it — decide then whether it earns the slot.
 */
export const WALKTHROUGH_URL: string | null = null;

/**
 * Where the schedule-a-call form submits. There is no form backend yet, so this is null,
 * and null is not a placeholder to be filled in with a guess — it is the switch that
 * decides how the form behaves.
 *
 * While null, /schedule-call/ validates natively and then composes the answers into a
 * mail message the visitor sends themselves, from their own address. It never appears to
 * submit. A form that POSTs into a URL nobody is listening on is worse than no form: the
 * visitor believes they have made contact, stops looking for another route, and the lead
 * is lost silently — which for a firm evaluating vendors is the last impression you get.
 *
 * When a real endpoint exists, set it here. The form then POSTs to it natively
 * (method="post", no fetch), so whatever the endpoint returns is what the visitor sees —
 * which means the endpoint must respond with a confirmation page, not a bare 200.
 */
export const CONTACT_ENDPOINT: string | null = null;
