import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import App from '../../App';
import { SiteFooter } from '../SiteFooter';
import { CONTACT_EMAIL, LOGIN_URL, SCHEDULE_URL, RESOURCE_MENU, ABOUT_MENU } from '../../config';

describe('SiteFooter', () => {
  it('carries every destination the nav offers, in one flat list', () => {
    render(<SiteFooter />);
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual([
      '#products',
      '#solutions',
      '#transformation',
      ...RESOURCE_MENU.map((i) => i.href),
      ...ABOUT_MENU.map((i) => i.href),
      SCHEDULE_URL,
      LOGIN_URL,
      `mailto:${CONTACT_EMAIL}`,
    ]);
  });

  /*
   * The closing CTA used to end on "Email us" beside the trial button. A mailto: is a
   * footer link — it opens a mail client, which is not a conversion path — and the
   * scheduling page is what took its place up there. This asserts the move actually
   * happened rather than leaving two ways to do the same thing.
   */
  it('is the only place on the page that opens a mail client', () => {
    const { container } = render(<App />);
    const mailtos = [...container.querySelectorAll<HTMLAnchorElement>('a[href^="mailto:"]')];
    expect(mailtos).toHaveLength(1);
    expect(within(screen.getByRole('contentinfo')).getByRole('link', { name: /contact/i }))
      .toBe(mailtos[0]);
  });
});
