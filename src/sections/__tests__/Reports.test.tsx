import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Reports } from '../Reports';
import { AVAILABILITY_LABEL, FEATURE_BY_ID, ORDERABLE_REPORTS } from '../../data/product';
import { PRICING_URL, SAMPLE_REPORTS_URL, TRIAL_ENABLED, TRIAL_URL } from '../../config';
import { renderedText } from '../../pages/__tests__/renderedText';
import { track } from '../../measure';

vi.mock('../../measure', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../measure')>();
  return { ...actual, track: vi.fn() };
});

/* jsdom logs a "Not implemented: navigation" error when an anchor's default action
   runs. Cancelling it changes nothing about the handlers under test. */
const swallowNavigation = (event: Event) => event.preventDefault();

beforeEach(() => {
  vi.mocked(track).mockClear();
  document.addEventListener('click', swallowNavigation);
});

afterEach(() => {
  document.removeEventListener('click', swallowNavigation);
});

/*
 * The band exists because the three reports a firm can buy were sitting in a grid of
 * fourteen features with exactly the same weight as Negotiation Tracking. A visitor who
 * does not already know what Autolaw sells had no way to find out.
 *
 * So the assertions here are mostly about separation: the catalog renders the orderable
 * three and nothing else, and the one early-access feature that looks ready — the
 * illustration pilot — appears as an aside that cannot be mistaken for something on sale.
 */

describe('Reports band', () => {
  it('anchors the nav destination the site links to', () => {
    const { container } = render(<Reports />);
    expect(container.querySelector('#reports')).not.toBeNull();
    expect(screen.getByRole('region', { name: /reports/i })).toBeInTheDocument();
  });

  it('shows one card per orderable report and no others', () => {
    render(<Reports />);
    const list = screen.getByTestId('report-cards');
    const cards = within(list).getAllByTestId('report-card');
    expect(cards).toHaveLength(ORDERABLE_REPORTS.length);
    cards.forEach((card, i) => {
      const report = ORDERABLE_REPORTS[i];
      expect(within(card).getByRole('heading', { level: 3 })).toHaveTextContent(report.feature.name);
    });
  });

  it('gives every card its buyer problem, three deliverables, and both destinations', () => {
    render(<Reports />);
    const list = screen.getByTestId('report-cards');
    within(list)
      .getAllByTestId('report-card')
      .forEach((card, i) => {
        const report = ORDERABLE_REPORTS[i];
        expect(card).toHaveTextContent(report.problem);
        expect(within(card).getAllByTestId('deliverable')).toHaveLength(3);
        expect(within(card).getByRole('link', { name: /what is in this report/i })).toHaveAttribute(
          'href',
          `/product/${report.feature.slug}/`,
        );
        expect(within(card).getByRole('link', { name: /sample/i })).toHaveAttribute(
          'href',
          SAMPLE_REPORTS_URL,
        );
      });
  });

  /*
   * The codebase's rule, asserted at the point it would be broken: `live` renders no
   * label, so the absence of one IS the claim that a firm can order it today. A card
   * wearing a reassuring "Available" badge would read identically and mean nothing.
   */
  it('puts no availability label on a live report', () => {
    render(<Reports />);
    const list = screen.getByTestId('report-cards');
    /* Asserted against the rendered words, not a testid. An earlier version queried
       data-testid="availability", which appears only on the pilot aside OUTSIDE this
       list — so it was asserting the absence of something structurally absent, and would
       have stayed green if every card had sprouted an "Early access" chip. */
    const text = renderedText(list);
    expect(text.length).toBeGreaterThan(50);
    Object.values(AVAILABILITY_LABEL).forEach((label) => expect(text).not.toContain(label));
  });

  it('keeps the illustration pilot out of the catalog and labelled', () => {
    render(<Reports />);
    const pilot = screen.getByTestId('pilot');
    expect(FEATURE_BY_ID.get('illustrations')?.availability).toBe('early-access');
    expect(pilot).toHaveTextContent(AVAILABILITY_LABEL['early-access']);
    expect(within(screen.getByTestId('report-cards')).queryByText(/illustration/i)).toBeNull();
  });

  it('sends a reader who wants the price to the pricing page', () => {
    render(<Reports />);
    expect(screen.getByRole('link', { name: /pricing/i })).toHaveAttribute('href', PRICING_URL);
  });

  it('offers nothing to buy while the trial switch is off', () => {
    expect(TRIAL_ENABLED).toBe(false);
    const { container } = render(<Reports />);
    const hrefs = [...container.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
    expect(hrefs).not.toContain(TRIAL_URL);
    expect(renderedText(container)).not.toMatch(/buy now|add to cart|start free trial/i);
  });

  /*
   * Which report a visitor chose is the first real signal of intent the site can
   * collect, and the one that says whether the band is doing its job. Emitted beside the
   * delegated cta_clicked rather than instead of it: that one records every link on the
   * page, this one records the choice.
   */
  it('reports which card a visitor chose', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    render(<Reports />);
    const card = within(screen.getByTestId('report-cards')).getAllByTestId('report-card')[1];

    await user.click(within(card).getByRole('link', { name: /what is in this report/i }));

    expect(track).toHaveBeenCalledWith('report_card_selected', {
      report: ORDERABLE_REPORTS[1].featureId,
      destination: 'feature',
    });
  });

  it('distinguishes a visitor who went to the sample instead', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    render(<Reports />);
    const card = within(screen.getByTestId('report-cards')).getAllByTestId('report-card')[0];

    await user.click(within(card).getByRole('link', { name: /sample/i }));

    expect(track).toHaveBeenCalledWith('report_card_selected', {
      report: ORDERABLE_REPORTS[0].featureId,
      destination: 'sample',
    });
  });
});
