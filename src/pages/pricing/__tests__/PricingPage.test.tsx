import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { FAQ, PricingPage, packPriceLabel } from '../PricingPage';
import { REPORT_PACKS, REPORTS_ORDER_PAGE_LIMIT, REPORTS_FREE_REFRESH_DAYS } from '../../../config';
import { ORDERABLE_REPORTS } from '../../../data/product';
import { CONTACT_SALES_URL, PLATFORM_URL } from '../../../config';
import { renderedText } from '../../__tests__/renderedText';

/*
 * The pricing page makes two kinds of statement, and only one of them is safe today.
 *
 * What a credit *covers* is in code: the 2,000-page order limit and the 30-day free
 * refresh are constants in case-app's reports-tier.ts, so the page may state them
 * outright. What a credit *costs* is in Stripe, resolved at runtime from a lookup key,
 * and nobody in this repository can read it. `priceUsd` is therefore null until a human
 * reads the live price and writes it down, and null is not a placeholder to be guessed
 * at — it is the switch that decides whether the page shows an amount at all.
 *
 * The assertion that matters most is the negative one: while every price is null, no
 * dollar figure may appear anywhere on the page. A plausible-looking number on a pricing
 * page is the single most expensive thing this site could get wrong, because a firm will
 * quote it back to you.
 */

describe('PricingPage', () => {
  /*
   * Asserted as the whole list rather than one lookup per pack: a pack added to config
   * with no name of its own should fail here, and a per-pack search would pass by
   * matching some other pack's heading.
   */
  it('names every pack the billing catalogue sells', () => {
    render(<PricingPage />);
    const packs = screen.getByRole('region', { name: /report packs/i });
    const names = within(packs)
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent?.trim());
    expect(names).toEqual(['Single report', '5-report pack', '10-report pack']);
    expect(names).toHaveLength(REPORT_PACKS.length);
  });

  /*
   * Phrased as an implication rather than a precondition. Asserting "every price is
   * null" first would mean that the day the owner does the thing config.ts tells them to
   * do — paste a live Stripe price — this test goes red with a message that looks like a
   * regression. A guard that fails on the transition it exists to protect is a guard
   * people learn to edit rather than heed.
   */
  it('publishes a dollar figure only for a pack that has one', () => {
    const { container } = render(<PricingPage />);
    const text = renderedText(container);
    if (REPORT_PACKS.every((pack) => pack.priceUsd === null)) {
      expect(text).not.toMatch(/\$\s?\d/);
      expect(text).toContain('Priced on a call');
    } else {
      REPORT_PACKS.filter((pack) => pack.priceUsd !== null).forEach((pack) => {
        expect(text).toContain(packPriceLabel(pack));
      });
    }
  });

  it('formats a price only once one has been written down', () => {
    expect(packPriceLabel({ packId: 'reports_1', reports: 1, priceUsd: null })).toBeNull();
    expect(packPriceLabel({ packId: 'reports_5', reports: 5, priceUsd: 245 })).toBe('$245');
  });

  /*
   * The per-report figure is derived, never stored: storing both is how a pack ends up
   * advertising a unit price that its own total contradicts.
   */
  it('derives the per-report figure from the pack total', () => {
    expect(packPriceLabel({ packId: 'reports_5', reports: 5, priceUsd: 245 }, 'per-report')).toBe('$49');
    expect(packPriceLabel({ packId: 'reports_5', reports: 5, priceUsd: null }, 'per-report')).toBeNull();
  });

  /*
   * The division is where a malformed price comes from: $445 across ten reports is
   * $44.50, and a formatter with minimumFractionDigits: 0 renders it "$44.5". The round
   * case above passes either way, so it was not covering this.
   */
  it('prints cents when the division produces them', () => {
    expect(packPriceLabel({ packId: 'reports_10', reports: 10, priceUsd: 445 }, 'per-report')).toBe('$44.50');
    expect(packPriceLabel({ packId: 'reports_5', reports: 5, priceUsd: 299 }, 'per-report')).toBe('$59.80');
    expect(packPriceLabel({ packId: 'reports_1', reports: 1, priceUsd: 149 })).toBe('$149');
  });

  it('states the entitlement facts that are in code rather than in Stripe', () => {
    const { container } = render(<PricingPage />);
    const text = renderedText(container);
    expect(text).toContain(REPORTS_ORDER_PAGE_LIMIT.toLocaleString('en-US'));
    expect(text).toContain(`${REPORTS_FREE_REFRESH_DAYS} days`);
  });

  it('lists every orderable report with the practice areas that can order it', () => {
    render(<PricingPage />);
    const table = screen.getByRole('table', { name: /report/i });
    ORDERABLE_REPORTS.forEach((report) => {
      expect(within(table).getByRole('rowheader', { name: report.name ?? report.feature.name })).toBeInTheDocument();
    });
  });

  /*
   * The whole commercial posture of this release in one assertion. Checkout exists in
   * case-app and is unreachable from outside it, so the page may describe what a pack
   * costs and must not offer to sell one.
   */
  it('offers a call as the only way to buy, and no checkout', () => {
    const { container } = render(<PricingPage />);
    const main = screen.getByRole('main');
    const ctas = within(main)
      .getAllByRole('link')
      .map((link) => link.textContent?.trim() ?? '');
    expect(ctas.some((label) => /schedule a call/i.test(label))).toBe(true);
    expect(renderedText(container)).not.toMatch(/buy now|add to cart|check\s?out|start free trial/i);
  });

  /*
   * Content, not a count. structuredData.test.ts checks the FAQPage markup against this
   * same FAQ array, so if the section were removed from the page while the array stayed
   * exported, that guard would still pass and the markup would be claiming content the
   * page no longer shows — which is the exact thing Google penalises FAQ markup for.
   * This is the half of the pair that watches the page.
   */
  it('answers the questions a firm asks before it will book anything', () => {
    render(<PricingPage />);
    const faq = screen.getByRole('region', { name: /questions/i });
    expect(within(faq).getAllByRole('heading', { level: 3 })).toHaveLength(FAQ.length);
    expect(FAQ.length).toBeGreaterThanOrEqual(8);

    const text = renderedText(faq);
    FAQ.forEach((item) => {
      expect(text, `question missing from the page: ${item.q}`).toContain(item.q);
      expect(text, `answer missing from the page: ${item.q}`).toContain(item.a);
    });
  });
});

/*
 * The other state of the switch.
 *
 * Everything above asserts that no figure reaches the page while `priceUsd` is null,
 * which is the state the site ships in — so it is also the only state that would ever be
 * exercised. That makes the day someone fills the prices in the day the rendering path
 * runs for the first time, in production, against real money.
 *
 * The repo's own rule, from the APP_HOST_LIVE comment in src/config.ts: both states are
 * asserted, so neither is the untested one.
 */
describe('PricingPage once the prices are known', () => {
  const priced = vi.hoisted(() => ({
    packs: [
      { packId: 'reports_1', reports: 1, priceUsd: 149 },
      { packId: 'reports_5', reports: 5, priceUsd: 625 },
      { packId: 'reports_10', reports: 10, priceUsd: 1090 },
    ],
  }));

  beforeEach(() => {
    vi.resetModules();
  });

  it('prints the pack total and the derived per-report figure', async () => {
    vi.doMock('../../../config', async (importOriginal) => ({
      ...(await importOriginal<typeof import('../../../config')>()),
      REPORT_PACKS: priced.packs,
    }));
    const { PricingPage: Priced } = await import('../PricingPage');
    const { container } = render(<Priced />);
    const text = renderedText(container);

    expect(text).toContain('$149');
    expect(text).toContain('$625');
    expect(text).toContain('$1,090');
    /* 625 / 5 and 1090 / 10, derived rather than stored. */
    expect(text).toContain('$125');
    expect(text).toContain('$109');
    expect(text).not.toContain('Priced on a call');
  });

  it('shows no per-report figure on a single-report pack, where it would be the same number twice', async () => {
    vi.doMock('../../../config', async (importOriginal) => ({
      ...(await importOriginal<typeof import('../../../config')>()),
      REPORT_PACKS: [priced.packs[0]],
    }));
    const { PricingPage: Priced } = await import('../PricingPage');
    render(<Priced />);
    expect(screen.getByText(/1 report credit/)).not.toHaveTextContent('each');
  });

  /*
   * The table is the one block that cannot stack, so it scrolls inside its own box — and
   * a box that scrolls only with a mouse hides its right-hand columns from a keyboard
   * user completely. Measured at 375px the content runs several hundred pixels past the
   * viewport, so this is real content, not an edge case. Same WCAG 2.1.1 pattern as the
   * comparison scroller in src/sections/Trust.tsx.
   */
  it('lets a keyboard user scroll the table', () => {
    render(<PricingPage />);
    const scroller = screen.getByTestId('pricing-table-scroller');
    expect(scroller).toHaveAttribute('tabindex', '0');
    expect(scroller).toHaveAttribute('role', 'region');
    expect(scroller).toHaveAccessibleName(/availability/i);
  });
});

/*
 * The page used to sell one thing.
 *
 * It was titled "Pay for the reports you order" and gave the platform one navy band, one
 * sentence and a button pointing at the same generic "Schedule a call" as everything
 * else — so a firm that wanted the whole product learned nothing, and the enquiry arrived
 * with no indication of what they were after. case-app's reports_tier is a RESTRICTION
 * (reports-tier-routes.ts is an allowlist; everything else 403s), so reports are the
 * cut-down tier and the page was selling the smaller half as though it were the offer.
 */
describe('PricingPage — both halves of the business', () => {
  it('presents two plans, not one', () => {
    render(<PricingPage />);
    const plans = screen.getByTestId('plans');
    expect(within(plans).getAllByTestId('plan')).toHaveLength(2);
    expect(within(plans).getByRole('heading', { name: /reports/i })).toBeInTheDocument();
    expect(within(plans).getByRole('heading', { name: /platform/i })).toBeInTheDocument();
  });

  it('sends a platform enquiry somewhere that knows what it is about', () => {
    render(<PricingPage />);
    const plans = screen.getByTestId('plans');
    expect(within(plans).getByRole('link', { name: /talk to sales/i })).toHaveAttribute(
      'href',
      CONTACT_SALES_URL,
    );
    expect(CONTACT_SALES_URL).toContain('interest=platform');
  });

  it('offers somewhere to read about the platform before talking to anyone', () => {
    render(<PricingPage />);
    expect(
      within(screen.getByTestId('plans')).getByRole('link', { name: /what the platform/i }),
    ).toHaveAttribute('href', PLATFORM_URL);
  });

  /*
   * The retired claim. "Priced per firm rather than per report" was on the page and is
   * not supported: Stripe sells report packs and nothing else, every platform tenant is
   * provisioned by hand, and no code anywhere prices anything per firm, per seat or per
   * year. Saying nothing about structure is the only honest option until that changes.
   */
  it('claims no pricing structure for the platform at all', () => {
    const { container } = render(<PricingPage />);
    /* Anchored on *priced*, not on "per firm" alone: the preview-reports paragraph
       correctly says those types are switched on per firm, which is how the
       reports_preview capability is granted and nothing to do with money. */
    expect(renderedText(container)).not.toMatch(
      /priced per|\bper seat\b|\bper user\b|\bper month\b|\bper year\b|annual (?:licen[cs]e|contract|subscription|minimum)/i,
    );
  });
});
