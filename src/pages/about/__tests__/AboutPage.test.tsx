import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { AboutPage, STORY, TEAM, OPEN_ROLES } from '../AboutPage';
import { renderedText } from '../../__tests__/renderedText';

describe('AboutPage — what it says', () => {
  it('says what Autolaw is before it says anything about itself', () => {
    render(<AboutPage />);
    const h1 = within(screen.getByRole('main')).getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent(/what autolaw is/i);
    expect(
      within(screen.getByRole('main')).getByText(/every fact cites the document, page, and sentence/i)
    ).toBeInTheDocument();
  });

  it('explains why the two practices are separate products, not one with the labels swapped', () => {
    render(<AboutPage />);
    const practices = within(screen.getByRole('region', { name: /two practices, two products/i }));
    expect(practices.getByRole('heading', { name: /personal injury/i })).toBeInTheDocument();
    expect(practices.getByRole('heading', { name: /workers’ compensation/i })).toBeInTheDocument();
    expect(practices.getByText(/not one product with the labels swapped/i)).toBeInTheDocument();
  });

  it('states the human-confirmation principle and its legal reason', () => {
    render(<AboutPage />);
    const principle = within(
      screen.getByRole('region', { name: /extraction proposes\. an attorney confirms\./i })
    );
    expect(principle.getByText(/never writes case truth on its own/i)).toBeInTheDocument();
    expect(principle.getByText(/statute-of-limitations and jurisdictional consequences/i)).toBeInTheDocument();
  });
});

/*
 * The reason this page exists as a scaffold rather than as finished copy.
 *
 * A founding story, a team, and an open role are the three things a contractor cannot
 * invent, because the people they describe will eventually be in the room. So each is an
 * empty exported slot, and each section renders nothing at all while its slot is empty —
 * the same discipline as CUSTOMER_LOGOS in src/config.ts, where the absence of a
 * permissioned asset shows as absence rather than as a placeholder.
 *
 * Filling a slot is the whole edit. These tests are what stop the reverse: a section
 * shipping with invented content, or an empty section shipping as "Team — coming soon",
 * which reads to a buyer exactly like a company with no team.
 */
describe('AboutPage — the owner slots', () => {
  it('leaves the story, team, and careers slots empty', () => {
    expect(STORY).toHaveLength(0);
    expect(TEAM).toHaveLength(0);
    expect(OPEN_ROLES).toHaveLength(0);
  });

  it('renders no section at all for a slot that is empty', () => {
    const { container } = render(<AboutPage />);
    ['story', 'team', 'careers'].forEach((id) => {
      expect(container.querySelector(`section[id="${id}"]`)).toBeNull();
    });
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /our story|who builds autolaw|open roles/i })).not.toBeInTheDocument();
  });

  it('invents no person, no photograph, and no headcount', () => {
    const { container } = render(<AboutPage />);
    expect(container.querySelectorAll('img')).toHaveLength(0);

    /*
     * renderedText, not textContent. textContent returns "<b>A Person</b><span>Founder
     * </span>" as "A PersonFounder", so \bfounder\b finds no word boundary and this guard
     * passes with a fabricated team on the page — which is exactly what it did before this
     * line changed. See renderedText.ts.
     */
    const text = renderedText(screen.getByRole('main'));
    expect(text.length).toBeGreaterThan(1000); // non-vacuity: an empty page passes everything below

    const invented: Array<[string, RegExp]> = [
      ['a founding date', /\bfounded in\b|\bsince \d{4}\b|\bin \d{4}, we\b/i],
      ['a headcount', /\bteam of \d+|\b\d+ (people|employees|engineers|attorneys)\b/i],
      ['funding', /\bseries [a-d]\b|\braised \$|\bbacked by\b|\bventure\b/i],
      ['a customer count', /\b\d+\+? (firms|customers|clients|law firms)\b/i],
      ['a founder or title', /\bfounder\b|\bco-founder\b|\bCEO\b|\bCTO\b/i],
    ];
    const hits = invented
      .filter(([, re]) => re.test(text))
      .map(([what, re]) => `${what} — matched "${text.match(re)?.[0]}"`);
    expect(hits).toEqual([]);
  });
});
