/*
 * The vocabulary a public trust page may not use until case-app's evidence record
 * verifies it, shared by the three /security/ pages.
 *
 * Lifted on 2026-10-03, in the commit that added verified copy for each:
 *   encryption specifics, TLS, AES, at rest, in transit — claims EN-1, EN-2
 *   named subprocessors — SP-table
 *   hosting provider and region — DF-2, SP-table
 *   MFA and SSO — AC-3, stated as not yet offered with a planned quarter
 *   incident response — stated only as a dated commitment
 * Re-add a line if its evidence row is ever withdrawn.
 */
export const STILL_UNVERIFIED: ReadonlyArray<[string, RegExp]> = [
  ['penetration testing', /\bpen(etration)?[\s-]?test/i],
  ['service levels', /\bSLA\b|\buptime\b|\b99\.\d/],
  ['other frameworks', /\bISO[\s-]?27001\b|\bGDPR\b|\bCCPA\b|\bPCI\b|\bFedRAMP\b/i],
  ['backup or recovery', /\bbackup|\bdisaster recovery\b/i],
  ['staffing controls', /\bbackground check|\bsecurity training\b/i],
  ['role-based access', /\brole[\s-]?based\b/i],
  ['marketing absolutes', /\bbank[\s-]?level\b|\bmilitary[\s-]?grade\b|\bunhackable\b|\b100% secure\b/i],
  ['illustration overclaims', /medically\s+validated|expert[- ]reviewed|court[- ]admissible|clinician[- ]approved|\b3D\b|surgical[- ]procedure|(?:illustration.{0,100}\b\d+(?:\.\d+)?%|\b\d+(?:\.\d+)?%.{0,100}illustration)/i],
];

/** Gap details that belong only in the NDA Trust Pack (case-app docs/trust/check.py). */
export const NDA_ONLY_PHRASES: ReadonlyArray<string> = [
  'file name', 'by hand', 'browser’s storage', "browser's storage", 'not yet revoked',
  'without an additional layer', 'direct access to the production', 'local copy',
  'older store', 'single zone', 'sign-in secrets',
];

export function guardHits(text: string): string[] {
  const vocabulary = STILL_UNVERIFIED.filter(([, re]) => re.test(text)).map(
    ([what, re]) => `${what} — matched ${re} in "${text.match(re)?.[0]}"`,
  );
  const lower = text.toLowerCase();
  const phrases = NDA_ONLY_PHRASES.filter((p) => lower.includes(p.toLowerCase())).map((p) => `NDA-only phrase "${p}"`);
  return [...vocabulary, ...phrases];
}
