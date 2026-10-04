import { renderedText } from '../../__tests__/renderedText';

/*
 * The vocabulary a public trust page may not use until case-app's evidence record
 * verifies it, shared by the three /security/ pages and by src/data/__tests__/trust.test.ts.
 *
 * Lifted on 2026-10-03, in the commits that added verified copy:
 *   encryption stated per connection and per store (EN-1, EN-2); the unscoped form stays banned
 *   named subprocessors (SP-table)
 *   hosting provider and region (DF-2, SP-table)
 * Still banned outside a planned item: MFA, SSO and incident-response commitments. They may
 * appear only inside a "Planned" list, which guardText removes before matching.
 * Re-add a line if its evidence row is ever withdrawn.
 */
export const STILL_UNVERIFIED: ReadonlyArray<[string, RegExp]> = [
  ['penetration testing', /\bpen(etration)?[\s-]?test/i],
  ['service levels', /\bSLA\b|\buptime\b|\b99\.\d/i],
  ['other frameworks', /\bISO[\s-]?27001\b|\bGDPR\b|\bCCPA\b|\bPCI\b|\bFedRAMP\b/i],
  ['backup or recovery', /\bbackup|\bdisaster recovery\b/i],
  ['staffing controls', /\bbackground check|\bsecurity training\b/i],
  ['role-based access', /\brole[\s-]?based\b/i],
  ['authentication features outside a planned item', /\bSSO\b|\bsingle sign[\s-]?on\b|\bMFA\b|\bmulti[\s-]?factor\b|\btwo[\s-]?factor\b/i],
  ['incident commitments outside a planned item', /\bincident[\s-]response\b|\bbreach notification\b|\b72 hours\b/i],
  ['unscoped encryption', /encrypt\w*\s+in\s+transit\s+and\s+at\s+rest|end[\s-]to[\s-]end|all\s+(?:data|traffic)\s+is\s+encrypted/i],
  ['marketing absolutes', /\bbank[\s-]?level\b|\bmilitary[\s-]?grade\b|\bunhackable\b|\b100% secure\b/i],
  ['illustration overclaims', /medically\s+validated|expert[- ]reviewed|court[- ]admissible|clinician[- ]approved|\b3D\b|surgical[- ]procedure|(?:illustration.{0,100}\b\d+(?:\.\d+)?%|\b\d+(?:\.\d+)?%.{0,100}illustration)/i],
];

/** Claims that may appear only in the NDA Trust Pack (case-app distribution memo, section 6). */
export const NDA_ONLY_CLAIMS: ReadonlyArray<string> = ['TI-7', 'TI-8', 'TI-9', 'TI-11', 'EN-6', 'IR-3', 'DL-2', 'BC-1', 'VM-1', 'LG-1', 'SD-1'];

/** Gap details that belong only in the NDA Trust Pack (case-app docs/trust/check.py). */
export const NDA_ONLY_PHRASES: ReadonlyArray<string> = [
  'file name', 'by hand', 'browser’s storage', "browser's storage", 'not yet revoked',
  'without an additional layer', 'direct access to the production', 'local copy',
  'older store', 'single zone', 'sign-in secrets',
];

/** The page's text with every "Planned" list removed, so dated plans do not trip the guard. */
export function guardText(root: HTMLElement): string {
  const clone = root.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('[data-planned]').forEach((el) => el.remove());
  return renderedText(clone);
}

export function guardHits(text: string): string[] {
  const vocabulary = STILL_UNVERIFIED.filter(([, re]) => re.test(text)).map(
    ([what, re]) => `${what} — matched ${re} in "${text.match(re)?.[0]}"`,
  );
  const lower = text.toLowerCase();
  const phrases = NDA_ONLY_PHRASES.filter((p) => lower.includes(p.toLowerCase())).map((p) => `NDA-only phrase "${p}"`);
  return [...vocabulary, ...phrases];
}
