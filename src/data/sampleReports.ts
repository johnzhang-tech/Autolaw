/**
 * The public sample orders: one invented personal-injury order and one invented workers'
 * compensation order, each EXACTLY as Autolaw's report builders produce it. The PDFs and page
 * images in public/sample-reports/ are generated, never hand-edited.
 *
 * Where they come from, said plainly because only part of it is in a repository:
 *   - WC: the Word reports come from case-app apps/server/scripts/generate-sample-reports.ts,
 *     rendering the order in sampleOrders/wcBrightwaterOrder.ts with the production builders.
 *   - PI: the packet is run through real ledger promotion and the same builders by the
 *     scripts in pi-sample-scripts/ (below).
 *   - Page assembly, the citation check, printing and the export into this repository live
 *     ON DISK ONLY, in case-app's git-ignored docs/samples/wc-sample-scripts/ and
 *     docs/samples/pi-sample-scripts/. Today they are not in any repository.
 * Rebuild both whenever a report builder changes. A sample that no longer matches what an
 * order delivers is the one thing this page exists to avoid.
 *
 * Everything in them is fabricated: patients, the applicant, employers, providers, insurers,
 * dates, bills and the QME do not exist. No client file, no record, and no identifiable person
 * may ever enter this module or public/ — a redacted real record is still a real record.
 *
 * Naming rule: a provider, employer or insurer name in a sample must not match a real
 * practice, provider group or reported decision, and must be checked against public listings
 * before the sample is published.
 *
 * Page counts are the PDFs' real counts; SampleReportsPage.test.tsx reads the files and
 * fails if a number here drifts from the file it describes.
 */
import { REPORT_PRICES_USD, SAMPLE_REPORTS_URL, type ReportPriceId } from '../config';

export type Practice = 'PI' | 'WC';

export interface SampleFile {
  /** Served path; the file lives at public/<href>. */
  href: string;
  practice: Practice;
  caseName: string;
  /** Pages in the PDF, cover and appendix included. */
  pages: number;
}

export interface PreviewImage {
  src: string;
  /** What the page shows, specifically enough to stand in for the image. */
  alt: string;
  /** The PNG's own pixel size; the page test reads it from the file. */
  width: number;
  height: number;
}

export interface ReportSample {
  id: ReportPriceId;
  /** A FEATURES id, asserted live in the page test. */
  featureId: string;
  /** The title printed on the Word report a buyer receives. */
  title: string;
  /** The section on this page. */
  anchor: 'chronology' | 'howell' | 'qme';
  practices: ReadonlyArray<Practice>;
  /** How it is bought. Every order includes the chronology. */
  howBought: string;
  /** What the report contains. */
  contains: ReadonlyArray<string>;
  previews: ReadonlyArray<PreviewImage>;
  samples: ReadonlyArray<SampleFile>;
}

export const SAMPLE_FILES = {
  pi: {
    href: '/sample-reports/autolaw-sample-pi-order.pdf',
    practice: 'PI',
    caseName: 'Renata K. Halvorsen v. Pellman Courier Co.',
    pages: 24,
  },
  wc: {
    href: '/sample-reports/autolaw-sample-wc-order.pdf',
    practice: 'WC',
    caseName: 'Leona Brightwater v. Calder Row Supply Co.',
    pages: 18,
  },
} as const satisfies Record<string, SampleFile>;

export const REPORT_SAMPLES: ReadonlyArray<ReportSample> = [
  {
    id: 'chronology',
    featureId: 'medical-chronologies',
    title: 'Medical Chronology',
    anchor: 'chronology',
    practices: ['PI', 'WC'],
    howBought: 'Part of every order. Can also be ordered on its own.',
    contains: [
      'Executive summary: visits, providers, diagnoses, and what needs follow-up, such as periods with no records or items flagged for review',
      'Records reviewed, with each file’s status, and what the report could not use',
      'Every visit in date order: complaints, findings, diagnoses, treatment and work status, each cited to its file and page, or quoted from the evaluator’s report',
      'Periods with no records, review flags and contradictions',
      'Next steps and an exhibit list',
    ],
    previews: [
      {
        src: '/sample-reports/chronology-p1.png',
        alt: 'First page of the personal-injury sample’s Medical Chronology: the case header, the executive summary, records reviewed with each file’s status, the providers with their first and last visits, and the first diagnostic highlights, each cited to its file and page.',
        width: 850,
        height: 1100,
      },
    ],
    samples: [SAMPLE_FILES.pi, SAMPLE_FILES.wc],
  },
  {
    id: 'howell',
    featureId: 'case-value',
    title: 'Howell Recoverable Specials',
    anchor: 'howell',
    practices: ['PI'],
    howBought: 'Ordered with a medical chronology: two reports per order.',
    contains: [
      'Executive summary and limitations',
      'Totals: billed, adjustments, paid, patient balance and recoverable',
      'Bills by provider, each row cited to the bill it was read from',
      'What the recoverable figure rests on, duplicates, and bills with no matching record',
    ],
    previews: [
      {
        src: '/sample-reports/howell-p1.png',
        alt: 'First page of the sample Howell Recoverable Specials: the executive summary, which states the patient’s share apart from the charges insurance has not yet adjudicated; limitations; the contradictions check; the totals; and the bills by provider, each cited to the statement and the EOBs it was read from.',
        width: 850,
        height: 1100,
      },
    ],
    samples: [SAMPLE_FILES.pi],
  },
  {
    id: 'qme_ame_memo',
    featureId: 'qme-ame',
    title: 'QME/AME Action Memo',
    anchor: 'qme',
    practices: ['WC'],
    howBought: 'Ordered with a medical chronology: two reports per order.',
    contains: [
      'Attorney next actions',
      'The evaluator’s findings as stated: diagnosis, causation, permanent and stationary status, impairment, apportionment, work restrictions and future medical care',
      'A PD rating cross-check computed from the evaluator’s own figures',
      'Records the evaluator did not have, the evidence index and coverage',
      'Treating-versus-QME conflicts, marked Not checked until an attorney approves findings on both sides',
    ],
    previews: [
      {
        src: '/sample-reports/qme-memo-p1.png',
        alt: 'First page of the sample QME/AME Action Memo: the summary, next actions, missing evidence and the first medical-legal findings.',
        width: 850,
        height: 1100,
      },
      {
        src: '/sample-reports/qme-memo-p2.png',
        alt: 'Second page of the sample QME/AME Action Memo: the remaining findings, the PD rating cross-check, conflicts marked Not checked, the evidence index and coverage.',
        width: 850,
        height: 1100,
      },
    ],
    samples: [SAMPLE_FILES.wc],
  },
];

/** Rendered above every sample, and asserted by the page's test rather than trusted. */
export const FICTIONAL_NOTICE = {
  heading: 'Every sample here is a fictional case.',
  body: 'The patient, the applicant, employers, providers, insurers, dates, bills and the QME are invented for demonstration. No client file, no real medical record, and no identifiable person appears on this page or in anything downloaded from it.',
};

/** How the samples were made, said plainly, so no one mistakes them for a reviewed production result. */
export const HOW_MADE =
  'Each PDF shows the Word reports Autolaw delivers for an order, rendered as pages. Autolaw’s report builders produced them from the invented records in the PDF’s appendix. The facts the builders read were entered in the form Autolaw’s extraction step stores them; extraction was not run, and no one reviewed the order, so the reports show what an unreviewed order prints.';

/**
 * The same rule as packPriceLabel in PricingPage.tsx, mirrored rather than imported so this
 * data module does not pull a page in: cents only when the amount has them, so 30 reads
 * "$30" and 29.5 reads "$29.50", never "$29.5".
 */
const dollars = (usd: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Number.isInteger(usd) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(usd);

/**
 * The price line on a report card. A Howell or QME/AME order always includes the chronology,
 * so its line leads with the add-on and states the order total; with any price unknown it
 * says what the pricing page says.
 */
export function samplePriceLine(id: ReportPriceId, prices: Readonly<Record<ReportPriceId, number | null>> = REPORT_PRICES_USD): string {
  const own = prices[id];
  if (id === 'chronology') return own === null ? 'Priced on a call' : `${dollars(own)} per report`;
  const chronology = prices.chronology;
  if (own === null || chronology === null) return 'Priced on a call';
  return `+${dollars(own)} with a chronology · ${dollars(own + chronology)} per order`;
}

/** Where a report's "Read a sample" link goes: straight to its section on this page. */
export function sampleHref(featureId: string): string {
  const anchor = REPORT_SAMPLES.find((report) => report.featureId === featureId)?.anchor;
  return anchor ? `${SAMPLE_REPORTS_URL}#${anchor}` : SAMPLE_REPORTS_URL;
}
