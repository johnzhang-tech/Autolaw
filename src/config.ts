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
 * Assets that must not be faked. Each renders nothing until a real file exists.
 * Populate only with permissioned artwork.
 */
export const CUSTOMER_LOGOS: ReadonlyArray<{ name: string; src: string }> = [];

/** `mark` is the short text inside the badge disc — never derive it by splitting `label`. */
export const CERTIFICATIONS: ReadonlyArray<{ mark: string; label: string; detail: string }> = [
  { mark: 'SOC 2', label: 'SOC 2 Type II', detail: 'Report available under NDA' },
  { mark: 'HIPAA', label: 'HIPAA attested', detail: 'BAA available' },
];

/** Set to a real URL to reveal the secondary hero CTA. */
export const WALKTHROUGH_URL: string | null = null;
