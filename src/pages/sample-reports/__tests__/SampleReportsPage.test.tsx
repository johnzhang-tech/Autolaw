import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen, within } from '@testing-library/react';
import { SampleReportsPage } from '../SampleReportsPage';
import {
  FICTIONAL_NOTICE,
  REPORT_SAMPLES,
  SAMPLE_FILES,
  sampleHref,
  samplePriceLine,
} from '../../../data/sampleReports';
import { REPORT_PRICES_USD, SAMPLE_REPORTS_URL } from '../../../config';
import { FEATURE_BY_ID, ORDERABLE_REPORTS } from '../../../data/product';
import { renderedText } from '../../__tests__/renderedText';
import { track } from '../../../measure';

vi.mock('../../../measure', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../measure')>();
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

const PUBLIC = join(process.cwd(), 'public');
const publicFile = (href: string) => join(PUBLIC, href.replace(/^\//, ''));
const pdfPageCount = (href: string) =>
  (readFileSync(publicFile(href)).toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length;
/* A PNG's IHDR chunk carries its width and height, big-endian, at bytes 16-23. */
const pngSize = (src: string) => {
  const bytes = readFileSync(publicFile(src));
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
};

describe('sample report data', () => {
  it('names a live product page for every report sample', () => {
    REPORT_SAMPLES.forEach((report) => expect(FEATURE_BY_ID.get(report.featureId)).toBeDefined());
  });

  it('describes every PDF by its real page count', () => {
    Object.values(SAMPLE_FILES).forEach((file) => {
      expect(existsSync(publicFile(file.href))).toBe(true);
      expect(pdfPageCount(file.href)).toBe(file.pages);
    });
  });

  /*
   * The page reserves each image's box from the width and height it declares, so a
   * re-export at another size would distort every preview until someone noticed.
   */
  it('ships every preview image it names, at the size it declares', () => {
    REPORT_SAMPLES.flatMap((report) => report.previews).forEach((preview) => {
      expect(existsSync(publicFile(preview.src))).toBe(true);
      expect(preview.alt.length).toBeGreaterThan(40);
      expect(pngSize(preview.src), preview.src).toEqual({ width: preview.width, height: preview.height });
    });
  });

  it('says every second report is ordered with a chronology', () => {
    REPORT_SAMPLES.filter((report) => report.id !== 'chronology').forEach((report) =>
      expect(report.howBought).toMatch(/with a medical chronology/i),
    );
  });

  it('prices a second report as the order total once prices exist', () => {
    const prices = { chronology: 30, howell: 30, qme_ame_memo: 30 };
    expect(samplePriceLine('chronology', prices)).toBe('$30 per report');
    expect(samplePriceLine('howell', prices)).toBe('+$30 with a chronology · $60 per order');
    expect(samplePriceLine('qme_ame_memo', { ...prices, chronology: null })).toBe('Priced on a call');
  });

  /* "$29.5" is a malformed price; the pricing page's packPriceLabel follows the same rule. */
  it('shows cents only when a figure has them, and then both digits', () => {
    const prices = { chronology: 30, howell: 29.5, qme_ame_memo: null };
    expect(samplePriceLine('howell', prices)).toBe('+$29.50 with a chronology · $59.50 per order');
    expect(samplePriceLine('chronology', prices)).toBe('$30 per report');
  });

  it('deep-links each report to its own section', () => {
    expect(sampleHref('qme-ame')).toBe(`${SAMPLE_REPORTS_URL}#qme`);
    expect(sampleHref('no-such-report')).toBe(SAMPLE_REPORTS_URL);
  });
});

describe('SampleReportsPage', () => {
  it('says the cases are fictional before showing any of them', () => {
    const { container } = render(<SampleReportsPage />);
    const main = screen.getByRole('main');
    const notice = within(main).getByTestId('fictional-notice');
    expect(notice).toHaveTextContent(FICTIONAL_NOTICE.heading);
    const firstCard = within(main).getAllByRole('article')[0];
    expect(notice.compareDocumentPosition(firstCard) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(renderedText(container)).toMatch(/no client file|no real (medical )?record/i);
  });

  it('shows one card per report, each linking its own section', () => {
    render(<SampleReportsPage />);
    const cards = within(screen.getByRole('main')).getAllByRole('article');
    expect(cards).toHaveLength(REPORT_SAMPLES.length);
    REPORT_SAMPLES.forEach((report, i) => {
      expect(within(cards[i]).getByRole('heading', { name: report.title })).toBeInTheDocument();
      expect(within(cards[i]).getByRole('link', { name: /see the sample/i })).toHaveAttribute('href', `#${report.anchor}`);
      expect(document.getElementById(report.anchor)).not.toBeNull();
    });
  });

  it('offers every sample PDF for download from each report that uses it', () => {
    render(<SampleReportsPage />);
    REPORT_SAMPLES.forEach((report) => {
      const section = document.getElementById(report.anchor)!;
      report.samples.forEach((file) => {
        const link = within(section).getByRole('link', { name: new RegExp(`PDF, ${file.pages} pages`) });
        expect(link).toHaveAttribute('href', file.href);
      });
    });
  });

  /*
   * An implication, not a precondition, as in PricingPage.test.tsx: asserting "every price
   * is null" first would turn this red the day a live price is entered, which is the
   * transition it exists to protect. The priced state is asserted at the end of this file.
   */
  it('prints no dollar figure while every price is unset', () => {
    const { container } = render(<SampleReportsPage />);
    const text = renderedText(container);
    if (Object.values(REPORT_PRICES_USD).every((price) => price === null)) {
      expect(text).not.toMatch(/\$\s?\d/);
      expect(text).toMatch(/Priced on a call/);
    } else {
      REPORT_SAMPLES.forEach((report) => expect(text).toContain(samplePriceLine(report.id)));
    }
  });

  /*
   * Keyed by the FEATURES id, as report_card_selected is, so a download can be joined to
   * the card a visitor chose on the home page. The price id ('qme_ame_memo') joins nothing.
   */
  it('records which report and practice each sample download came from', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    render(<SampleReportsPage />);
    const orderable = ORDERABLE_REPORTS.map((report) => report.featureId);

    for (const report of REPORT_SAMPLES) {
      const section = document.getElementById(report.anchor)!;
      for (const file of report.samples) {
        vi.mocked(track).mockClear();
        await user.click(within(section).getByRole('link', { name: new RegExp(`PDF, ${file.pages} pages`) }));
        expect(track).toHaveBeenCalledWith('sample_downloaded', { report: report.featureId, practice: file.practice });
        expect(orderable).toContain(report.featureId);
      }
    }
    expect(REPORT_SAMPLES.find((report) => report.anchor === 'qme')?.featureId).toBe('qme-ame');
  });

  it('says how the samples were made, and claims no real customer', () => {
    const { container } = render(<SampleReportsPage />);
    expect(renderedText(container)).toMatch(/extraction was not run/i);
    expect(renderedText(container)).not.toMatch(/case study|our client|testimonial/i);
  });

  it('offers a call as the next step', () => {
    render(<SampleReportsPage />);
    expect(
      within(screen.getByRole('main'))
        .getAllByRole('link')
        .some((link) => /schedule a call/i.test(link.textContent ?? '')),
    ).toBe(true);
  });
});

/*
 * The other state of the price switch. Everything above runs with REPORT_PRICES_USD as
 * shipped, which is all null, so without this the day a live price is entered would be the
 * first time the priced card lines ever rendered. Same pattern as PricingPage.test.tsx.
 */
describe('SampleReportsPage once the prices are known', () => {
  const priced = vi.hoisted(() => ({
    prices: { chronology: 30, howell: 30, qme_ame_memo: 30 },
  }));

  beforeEach(() => {
    vi.resetModules();
  });

  it('prints each card’s price, and a second report as the order total', async () => {
    vi.doMock('../../../config', async (importOriginal) => ({
      ...(await importOriginal<typeof import('../../../config')>()),
      REPORT_PRICES_USD: priced.prices,
    }));
    const { SampleReportsPage: Priced } = await import('../SampleReportsPage');
    const { container } = render(<Priced />);
    const text = renderedText(container);

    expect(text).toContain('$30 per report');
    expect(text).toContain('+$30 with a chronology · $60 per order');
    expect(text).not.toContain('Priced on a call');
  });
});

describe('arriving on a deep link', () => {
  const original = Element.prototype.scrollIntoView;
  let scrollIntoView: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView as unknown as typeof original;
  });

  afterEach(() => {
    Element.prototype.scrollIntoView = original;
    window.history.replaceState(null, '', '/');
  });

  /* The page renders in the browser, so the browser looks for #qme before it exists. */
  it('scrolls to the section named in the hash', () => {
    window.history.replaceState(null, '', '/sample-reports/#qme');
    render(<SampleReportsPage />);

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    const target = scrollIntoView.mock.contexts[0] as Element;
    expect(target.id).toBe('qme');
  });

  it('does not scroll when there is no hash', () => {
    window.history.replaceState(null, '', '/sample-reports/');
    render(<SampleReportsPage />);

    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
