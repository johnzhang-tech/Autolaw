import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { SampleReportsPage } from '../SampleReportsPage';
import {
  CHRONOLOGY_SAMPLE,
  HOWELL_SAMPLE,
  QME_SAMPLE,
  SAMPLE_CARDS,
  howellTotals,
} from '../../../data/sampleReports';
import { FEATURE_BY_ID } from '../../../data/product';
import { renderedText } from '../../__tests__/renderedText';

/*
 * The sample page is the only place on the site that shows output rather than describing
 * it, which makes it the most persuasive page and the most dangerous one.
 *
 * Two failures would be unrecoverable. The first is a visitor mistaking invented material
 * for a real client's file, so the fictional notice is asserted here rather than trusted
 * to survive a copy edit. The second is arithmetic: an attorney reads a reconciliation
 * table by adding the column up, and a total that disagrees with its own rows ends the
 * evaluation on the spot. Totals are therefore derived from the rows and never stored,
 * and this file checks the derivation rather than the printed figure.
 */

describe('sample report data', () => {
  it('names a live, orderable report for every sample', () => {
    expect(SAMPLE_CARDS.length).toBeGreaterThan(0);
    SAMPLE_CARDS.forEach((card) => {
      const feature = FEATURE_BY_ID.get(card.featureId);
      expect(feature, `${card.featureId} is not a feature`).toBeDefined();
      expect(feature?.availability).toBe('live');
    });
  });

  it('cites a document and a page on every chronology entry', () => {
    expect(CHRONOLOGY_SAMPLE.entries.length).toBeGreaterThanOrEqual(2);
    CHRONOLOGY_SAMPLE.entries.forEach((entry) => {
      expect(entry.cite.document.length).toBeGreaterThan(0);
      expect(entry.cite.page).toBeGreaterThan(0);
    });
  });

  /*
   * A conflict with one side quoted is not a conflict, it is a finding. Both statements
   * carry their own citation because the whole claim being demonstrated is that Autolaw
   * reproduces the disagreement instead of silently resolving it.
   */
  it('quotes both sides of every conflict, each with its own citation', () => {
    expect(CHRONOLOGY_SAMPLE.conflicts.length).toBeGreaterThanOrEqual(1);
    CHRONOLOGY_SAMPLE.conflicts.forEach((conflict) => {
      expect(conflict.statements.length).toBeGreaterThanOrEqual(2);
      conflict.statements.forEach((statement) => {
        expect(statement.quote.length).toBeGreaterThan(10);
        expect(statement.cite.page).toBeGreaterThan(0);
      });
    });
  });

  it('names the document each gap needs rather than describing it vaguely', () => {
    expect(CHRONOLOGY_SAMPLE.gaps.length).toBeGreaterThanOrEqual(1);
    CHRONOLOGY_SAMPLE.gaps.forEach((gap) => {
      expect(gap.needed.length).toBeGreaterThan(10);
    });
  });

  /*
   * The citation a reader checks first is the one with a surprising page number, and an
   * invented file cannot survive that check by accident: an earlier draft cited
   * Northside Orthopedics at p. 412 while printing, four inches to the left, that
   * Northside is 168 pages. On the one page whose entire pitch is "follow a citation",
   * read by the one profession that adds columns up for a living.
   */
  it('cites no page beyond the length of the document it names', () => {
    const lengths = new Map(CHRONOLOGY_SAMPLE.inputs.map((input) => [input.cites, input.pages]));
    const cites = [
      ...CHRONOLOGY_SAMPLE.entries.map((entry) => entry.cite),
      ...CHRONOLOGY_SAMPLE.conflicts.flatMap((conflict) => conflict.statements.map((s) => s.cite)),
    ];
    expect(cites.length).toBeGreaterThan(2);
    cites.forEach((cite) => {
      const pages = lengths.get(cite.document);
      expect(pages, `${cite.document} is cited but is not in the input list`).toBeDefined();
      expect(cite.page, `${cite.document} p. ${cite.page} exceeds its ${pages} pages`).toBeLessThanOrEqual(pages!);
    });
  });

  it('cites no page beyond the length of the QME it names', () => {
    QME_SAMPLE.findings.forEach((finding) => {
      expect(finding.cite.document).toBe(QME_SAMPLE.document.cites);
      expect(finding.cite.page).toBeLessThanOrEqual(QME_SAMPLE.document.pages);
    });
  });

  it('cites each page once, so no source reads as two', () => {
    const pages = [
      ...CHRONOLOGY_SAMPLE.entries.map((entry) => entry.cite.page),
      ...CHRONOLOGY_SAMPLE.conflicts.flatMap((c) => c.statements.map((s) => s.cite.page)),
    ];
    expect(new Set(pages).size).toBe(pages.length);
  });

  it('derives every Howell total from its rows', () => {
    const totals = howellTotals(HOWELL_SAMPLE.rows);
    const sum = (key: 'billedCents' | 'paidCents' | 'adjustedCents' | 'outstandingCents') =>
      HOWELL_SAMPLE.rows.reduce((run, row) => run + row[key], 0);
    expect(totals.billedCents).toBe(sum('billedCents'));
    expect(totals.paidCents).toBe(sum('paidCents'));
    expect(totals.adjustedCents).toBe(sum('adjustedCents'));
    expect(totals.outstandingCents).toBe(sum('outstandingCents'));
  });

  /*
   * Per provider, billed is what was charged and paid + adjusted + outstanding is what
   * became of it. A row where those disagree is not a reconciliation, and a reader
   * checking one row by hand is exactly who this page is for.
   */
  it('reconciles every Howell row against what it says was billed', () => {
    HOWELL_SAMPLE.rows.forEach((row) => {
      expect(
        row.paidCents + row.adjustedCents + row.outstandingCents,
        `${row.provider} does not reconcile`,
      ).toBe(row.billedCents);
    });
  });
});

describe('SampleReportsPage', () => {
  it('says the cases are fictional before showing any of them', () => {
    const { container } = render(<SampleReportsPage />);
    const main = screen.getByRole('main');
    const notice = within(main).getByTestId('fictional-notice');
    expect(notice).toHaveTextContent(/fictional/i);

    /* Before, not merely present: a disclaimer under the sample is a disclaimer the
       reader meets after they have already believed it. */
    const firstSample = within(main).getAllByRole('article')[0];
    expect(notice.compareDocumentPosition(firstSample) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(renderedText(container)).toMatch(/no client file|no real (medical )?record/i);
  });

  it('renders every sample as its own article', () => {
    render(<SampleReportsPage />);
    expect(within(screen.getByRole('main')).getAllByRole('article')).toHaveLength(
      SAMPLE_CARDS.length,
    );
  });

  it('prints a page citation beside every quoted chronology entry', () => {
    render(<SampleReportsPage />);
    const preview = screen.getByRole('region', { name: /inside the chronology/i });
    CHRONOLOGY_SAMPLE.entries.forEach((entry) => {
      expect(within(preview).getByText(new RegExp(`p\\.\\s*${entry.cite.page}\\b`))).toBeInTheDocument();
    });
  });

  it('prints the derived Howell totals, not a stored figure', () => {
    render(<SampleReportsPage />);
    const table = screen.getByRole('table', { name: /medical specials/i });
    const totals = howellTotals(HOWELL_SAMPLE.rows);
    const row = within(table).getByRole('row', { name: /total/i });
    /* All four columns: asserting only `billed` would pass if the cells were reordered. */
    (['billedCents', 'paidCents', 'adjustedCents', 'outstandingCents'] as const).forEach((key) => {
      expect(row).toHaveTextContent(
        `$${(totals[key] / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      );
    });
  });

  it('offers a call as the next step, and claims no real customer', () => {
    const { container } = render(<SampleReportsPage />);
    const main = screen.getByRole('main');
    expect(
      within(main)
        .getAllByRole('link')
        .some((link) => /schedule a call/i.test(link.textContent ?? '')),
    ).toBe(true);
    expect(renderedText(container)).not.toMatch(/case study|our client|testimonial/i);
  });

  /*
   * The table is the one block that cannot stack, so it scrolls inside its own box — and
   * a box that scrolls only with a mouse hides its right-hand columns from a keyboard
   * user completely. Measured at 375px the content runs several hundred pixels past the
   * viewport, so this is real content, not an edge case. Same WCAG 2.1.1 pattern as the
   * comparison scroller in src/sections/Trust.tsx.
   */
  it('lets a keyboard user scroll the table', () => {
    render(<SampleReportsPage />);
    const scroller = screen.getByTestId('howell-table-scroller');
    expect(scroller).toHaveAttribute('tabindex', '0');
    expect(scroller).toHaveAttribute('role', 'region');
    expect(scroller).toHaveAccessibleName(/specials/i);
  });
});
