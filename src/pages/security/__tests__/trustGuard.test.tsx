import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { pageGuardHits } from './trustGuard';

/*
 * Hand-built fixtures for the page guard, so a regression in the guard itself is caught:
 * only MFA, SSO and incident wording may sit inside a "Planned" list; every other rule and
 * every NDA-only phrase still applies there.
 */
const hits = (ui: ReactElement) => {
  const { container } = render(<main>{ui}</main>);
  return pageGuardHits(container.querySelector('main')!);
};

describe('pageGuardHits', () => {
  it('allows multi-factor authentication inside a planned list', () => {
    expect(hits(<ul data-planned=""><li>Multi-factor authentication.</li></ul>)).toEqual([]);
  });

  it('catches MFA outside a planned list', () => {
    expect(hits(<p>We support MFA today.</p>).some((h) => h.startsWith('authentication features'))).toBe(true);
  });

  it('catches single sign-on split across elements', () => {
    expect(hits(<p>Single <b>sign-on</b> today.</p>).some((h) => h.startsWith('authentication features'))).toBe(true);
  });

  it('still applies every other rule inside a planned list', () => {
    expect(hits(<ul data-planned=""><li>An annual penetration test.</li></ul>).some((h) => h.startsWith('penetration testing'))).toBe(true);
  });

  it('still applies the NDA-only phrases inside a planned list', () => {
    expect(hits(<ul data-planned=""><li>Deleted by hand.</li></ul>).some((h) => h.includes('by hand'))).toBe(true);
  });
});
