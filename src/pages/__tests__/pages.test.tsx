import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import type { ReactElement } from 'react';
import { SecurityPage } from '../security/SecurityPage';
import { AboutPage } from '../about/AboutPage';
import { ScheduleCallPage } from '../schedule-call/ScheduleCallPage';
import { PrivacyPage } from '../privacy/PrivacyPage';
import { TermsPage } from '../terms/TermsPage';

/*
 * The structural invariants every standalone page shares, asserted once per page rather
 * than once per file. Adding a page means adding a line to PAGES — which is the point: a
 * page that forgets its <h1>, or that skips from <h2> to <h4>, fails here without anyone
 * having to remember to write the test again.
 *
 * These deliberately overlap with src/__tests__/a11y.test.tsx. That suite renders App and
 * only App, so before this file existed three of the site's four pages were unasserted.
 */
const PAGES: Array<[string, ReactElement]> = [
  ['/security/', <SecurityPage />],
  ['/about/', <AboutPage />],
  ['/schedule-call/', <ScheduleCallPage />],
  ['/privacy/', <PrivacyPage />],
  ['/terms/', <TermsPage />],
];

describe.each(PAGES)('%s', (path, element) => {
  it('renders one main landmark, one banner, and one footer', () => {
    render(element);
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getAllByRole('banner')).toHaveLength(1);
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1);
  });

  it('offers the skip link as its first focusable element', () => {
    const { container } = render(element);
    const focusable = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]'
    );
    const first = [...focusable].find((el) => (el.getAttribute('tabindex') ?? '0') !== '-1');
    expect(first).toBe(screen.getByRole('link', { name: /skip to content/i }));
    expect(first).toHaveAttribute('href', '#main');
  });

  it('has exactly one h1, and it is the first heading in main', () => {
    render(element);
    const main = screen.getByRole('main');
    expect(within(main).getAllByRole('heading', { level: 1 })).toHaveLength(1);
    const first = main.querySelector('h1, h2, h3, h4, h5, h6');
    expect(first?.tagName).toBe('H1');
  });

  /*
   * A skipped level is invisible on screen and destroys the only structure a screen-reader
   * user navigates by — jumping h2 → h4 tells them a section is missing that never existed.
   * Asserted as the list of offending transitions so a failure names the heading.
   */
  it('descends heading levels without skipping one', () => {
    render(element);
    const headings = [...screen.getByRole('main').querySelectorAll('h1, h2, h3, h4, h5, h6')];
    const skips: string[] = [];
    headings.forEach((h, i) => {
      if (i === 0) return;
      const prev = Number(headings[i - 1].tagName[1]);
      const level = Number(h.tagName[1]);
      if (level > prev + 1) skips.push(`h${prev} → h${level}: "${h.textContent?.trim()}"`);
    });
    expect(skips).toEqual([]);
  });

  it('gives every content section a landmark name', () => {
    render(element);
    /* A legal page whose owner slot is empty has no content sections at all, so the check
       is that every region present is named; zero regions is a legitimate result. */
    screen.queryAllByRole('region').forEach((r) => expect(r).toHaveAccessibleName());
  });

  it('uses no positive tabindex, so the tab order follows the document', () => {
    const { container } = render(element);
    const positive = [...container.querySelectorAll('[tabindex]')].filter(
      (el) => Number(el.getAttribute('tabindex')) > 0
    );
    expect(positive.map((el) => el.outerHTML.slice(0, 80))).toEqual([]);
  });

  it('emits no duplicate element ids', () => {
    const { container } = render(element);
    const ids = [...container.querySelectorAll('[id]')].map((el) => el.id);
    const seen = new Set<string>();
    const duplicates = ids.filter((id) => (seen.has(id) ? true : (seen.add(id), false)));
    /* The floor was a guard against a page that rendered nothing. A legal page whose
       owner slot is empty legitimately carries almost no ids (main from PageShell and
       skip link id) — "Did it render at all" is already proven for every page by the h1
       and landmark tests in this same file — so the floor is scoped to pages that are
       not those legal slots. */
    if (path !== '/privacy/' && path !== '/terms/') {
      expect(ids.length).toBeGreaterThan(3);
    }
    expect([...new Set(duplicates)]).toEqual([]);
  });

  /*
   * Same rule the App suite applies: a dangling aria-labelledby resolves to nothing, the
   * element ends up with an empty accessible name, and a landmark can stop being exposed
   * entirely. aria-controls is held to the weaker axe-core rule — a collapsed disclosure
   * may name a panel that is not mounted yet.
   */
  it('resolves every aria reference to an element that exists', () => {
    const { container } = render(element);
    const exempt = (el: Element) =>
      el.getAttribute('aria-expanded') === 'false' || el.getAttribute('aria-selected') === 'false';

    const dangling: string[] = [];
    for (const attr of ['aria-labelledby', 'aria-describedby', 'aria-controls']) {
      container.querySelectorAll(`[${attr}]`).forEach((el) => {
        if (attr === 'aria-controls' && exempt(el)) return;
        for (const id of (el.getAttribute(attr) ?? '').split(/\s+/).filter(Boolean)) {
          if (!container.querySelector(`#${CSS.escape(id)}`)) {
            dangling.push(`<${el.tagName.toLowerCase()}> ${attr}="${id}"`);
          }
        }
      });
    }
    expect(dangling).toEqual([]);
  });

  it('ships no image without alt text', () => {
    const { container } = render(element);
    container.querySelectorAll('img').forEach((img) => expect(img).toHaveAttribute('alt'));
  });
});

/*
 * The nav and footer render on every subpage, and their section links were bare fragments
 * ("#products"), which resolve to nothing anywhere except the home page — seven silently
 * dead links per page. Root-relative "/#products" fixes it. This asserts the property
 * rather than the spelling: no link on a subpage may point at a fragment that does not
 * exist on that page.
 */
describe('subpage link integrity', () => {
  const SUBPAGES: Array<[string, () => ReactElement]> = [
    ['security', () => <SecurityPage />],
    ['about', () => <AboutPage />],
    ['schedule-call', () => <ScheduleCallPage />],
    ['privacy', () => <PrivacyPage />],
    ['terms', () => <TermsPage />],
  ];

  it.each(SUBPAGES)('has no dead same-page fragment links on /%s/', (_name, Page) => {
    const { container } = render(<Page />);
    const dead = [...container.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')]
      .map((a) => a.getAttribute('href')!)
      .filter((href) => href !== '#')
      .filter((href) => !container.querySelector(`[id="${href.slice(1)}"]`));

    expect([...new Set(dead)]).toEqual([]);
  });
});
