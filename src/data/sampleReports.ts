/**
 * The public sample reports: one invented personal-injury matter and one invented
 * workers' compensation matter, written to demonstrate the shape of the work product.
 *
 * Everything here is fabricated. The patients, providers, insurers, dates, bills, and the
 * QME do not exist and are not modelled on anyone; the names were chosen not to match a
 * real practice, provider group, or reported decision. No client file, no record, and no
 * identifiable person may ever enter this module or public/ — a redacted real record is
 * still a real record, and redaction is not a thing to be reviewed in a marketing asset.
 *
 * Money is held in cents and totals are derived, never stored. An attorney reads a
 * reconciliation by adding the column up, and a printed total that disagrees with its own
 * rows ends the evaluation there — so the one number most likely to be edited by hand is
 * the one number this module refuses to let anybody type.
 *
 * Page numbers are per document and must fall inside that document's own page count
 * above — Northside is 168 pages, so a citation to its p. 412 is impossible, and the
 * reader this page is written for is the one profession that checks. chronologyPages in
 * SampleReportsPage.test.tsx enforces it.
 *
 * They are also unique across the chronology preview. That is not presentation: two
 * entries citing the same page read as one source quoted twice, which is the opposite of
 * what the page is demonstrating.
 *
 * Citations carry a document and a page and nothing finer, because that is all the
 * product has: every citation type in case-app — ChronologyCitation, GraphEventCitation,
 * CitedCitation, MedicalNarrativeCitation — is {document, page, snippet}, and
 * citationText() renders "(file, p. N)". An earlier draft of this file cited "sentence 3"
 * under a heading promising the entries are shown exactly as the report sets them out,
 * which would have sold a precision the Word export does not deliver.
 */

export interface Cite {
  document: string;
  page: number;
}

export interface ChronologyEntry {
  date: string;
  event: string;
  quote: string;
  cite: Cite;
}

export interface Conflict {
  summary: string;
  statements: ReadonlyArray<{ quote: string; cite: Cite }>;
}

export interface Gap {
  summary: string;
  /** The document to go and request, named. "Records are incomplete" helps nobody. */
  needed: string;
}

export interface SampleCard {
  /** A FEATURES id. Asserted live in SampleReportsPage.test.tsx. */
  featureId: string;
  caseName: string;
  practice: 'PI' | 'WC';
  builtFrom: string;
  produced: string;
  flags: string;
  /** Where the card goes: a fragment on this page, or a download once one exists. */
  href: string;
}

export const SAMPLE_CARDS: ReadonlyArray<SampleCard> = [
  {
    featureId: 'medical-chronologies',
    caseName: 'Rivera v. Cascade Haulage',
    practice: 'PI',
    builtFrom: '612 pages, four providers',
    produced: '84 entries, every one cited',
    flags: 'Two conflicts, three gaps',
    href: '#chronology',
  },
  {
    featureId: 'case-value',
    caseName: 'Rivera v. Cascade Haulage',
    practice: 'PI',
    builtFrom: '41 bills and two lien letters',
    produced: 'Billed, paid, adjusted, outstanding',
    flags: 'One possible duplicate charge',
    href: '#howell',
  },
  {
    featureId: 'qme-ame',
    caseName: 'Okonkwo v. Harbor Logistics',
    practice: 'WC',
    builtFrom: 'A 58-page panel QME',
    produced: 'Causation, impairment, apportionment',
    flags: 'Two unresolved questions',
    href: '#qme',
  },
];

export const CHRONOLOGY_SAMPLE = {
  caseName: 'Rivera v. Cascade Haulage',
  /**
   * `cites` is the exact string the citations use for this document, so the page-count
   * guard can resolve a citation to the document it names instead of guessing from a
   * prefix. A document nothing cites still carries one — it is the file's identity here,
   * not a display concern.
   */
  inputs: [
    { source: 'Mercy Valley Hospital — emergency and imaging', cites: 'Mercy Valley records', pages: 214 },
    { source: 'Northside Orthopedics — chart notes', cites: 'Northside Orthopedics', pages: 168 },
    { source: 'Bayfront Physical Therapy', cites: 'Bayfront Physical Therapy', pages: 142 },
    { source: 'Defence QME', cites: 'Defence QME', pages: 88 },
  ],
  sections: [
    'Treatment chronology',
    'Diagnoses and restrictions',
    'Conflicts between records',
    'Records not in the file',
    'Source index',
  ],
  entries: [
    {
      date: '11 February 2025',
      event: 'Emergency department — Mercy Valley Hospital',
      quote:
        'Patient presents following rear-end collision. Cervical and lumbar strain. Radiographs negative for acute fracture. Discharged with NSAIDs and instruction to follow up in one week.',
      cite: { document: 'Mercy Valley records', page: 17 },
    },
    {
      date: '14 March 2025',
      event: 'Orthopedic consult — Northside Orthopedics',
      quote:
        'Lumbar MRI demonstrates a 4 mm disc protrusion at L4–L5 with mild impingement of the left L5 nerve root. Recommend epidural steroid injection.',
      cite: { document: 'Northside Orthopedics', page: 46 },
    },
  ] as ReadonlyArray<ChronologyEntry>,
  conflicts: [
    {
      summary:
        'Work status on 30 April 2025 is recorded differently in two documents. Both are reproduced, and neither is preferred.',
      statements: [
        {
          quote: 'Patient released to modified duty, no lifting over 15 lb.',
          cite: { document: 'Northside Orthopedics', page: 97 },
        },
        {
          quote: 'No work restriction is medically supported as of this examination.',
          cite: { document: 'Defence QME', page: 22 },
        },
      ],
    },
  ] as ReadonlyArray<Conflict>,
  gaps: [
    {
      summary:
        'The 14 March consult refers the patient for an epidural steroid injection. No injection record, operative note, or pain-management chart appears anywhere in the 612 pages provided.',
      needed: 'Pain-management records, March to June 2025',
    },
  ] as ReadonlyArray<Gap>,
};

export interface HowellRow {
  provider: string;
  billedCents: number;
  paidCents: number;
  adjustedCents: number;
  outstandingCents: number;
  source: string;
}

export const HOWELL_SAMPLE = {
  caseName: 'Rivera v. Cascade Haulage',
  rows: [
    {
      provider: 'Mercy Valley Hospital',
      billedCents: 1_842_000,
      paidCents: 418_560,
      adjustedCents: 1_423_440,
      outstandingCents: 0,
      source: 'Bill 1, p. 3',
    },
    {
      provider: 'Northside Orthopedics',
      billedCents: 1_176_000,
      paidCents: 294_000,
      adjustedCents: 682_000,
      outstandingCents: 200_000,
      source: 'Bills 4–9, pp. 11–26',
    },
    {
      provider: 'Bayfront Physical Therapy',
      billedCents: 735_000,
      paidCents: 0,
      adjustedCents: 0,
      outstandingCents: 735_000,
      source: 'Lien letter, p. 2',
    },
  ] as ReadonlyArray<HowellRow>,
  flag: {
    heading: 'Possible duplicate',
    body:
      'CPT 72148 appears on Bill 4 (p. 11) and again on Bill 7 (p. 19), both dated 14 March 2025 and both for the same amount. Both are counted in the billed column above and flagged for review rather than removed.',
  },
  boundary:
    'The report extracts and reconciles what the bills say. It does not opine on what is recoverable under Howell v. Hamilton Meats; that judgement is the attorney’s.',
};

export interface HowellTotals {
  billedCents: number;
  paidCents: number;
  adjustedCents: number;
  outstandingCents: number;
}

/** Derived on every render. Nothing in this module stores a total. */
export function howellTotals(rows: ReadonlyArray<HowellRow>): HowellTotals {
  return rows.reduce<HowellTotals>(
    (run, row) => ({
      billedCents: run.billedCents + row.billedCents,
      paidCents: run.paidCents + row.paidCents,
      adjustedCents: run.adjustedCents + row.adjustedCents,
      outstandingCents: run.outstandingCents + row.outstandingCents,
    }),
    { billedCents: 0, paidCents: 0, adjustedCents: 0, outstandingCents: 0 },
  );
}

const USD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const usd = (cents: number) => USD.format(cents / 100);

/** Rendered above every sample, and asserted by the page's test rather than trusted. */
export const FICTIONAL_NOTICE = {
  heading: 'Every sample here is a fictional case.',
  body: 'The patient, providers, dates, bills, and the QME are invented for demonstration. No client file, no real medical record, and no identifiable person appears on this page or in anything downloaded from it.',
};

export interface QmeFinding {
  label: string;
  quote: string;
  cite: Cite;
}

/**
 * The workers' compensation sample. Invented on the same terms as the Rivera matter:
 * no real evaluator, employer, or claim.
 *
 * The open questions are the point of the report rather than a caveat on it. A QME that
 * apportions without naming the records it relied on is the ordinary case, and the thing
 * an applicant's attorney has to notice before the deposition rather than after.
 */
export const QME_SAMPLE = {
  caseName: 'Okonkwo v. Harbor Logistics',
  /** The one document, and its length. Every citation below must fall inside it. */
  document: { cites: 'Panel QME', pages: 58 },
  findings: [
    {
      label: 'Causation',
      quote:
        'The lumbar condition is industrial in origin, arising from the cumulative lifting duties described by the applicant over an eleven-year period.',
      cite: { document: 'Panel QME', page: 31 },
    },
    {
      label: 'Whole person impairment',
      quote:
        'Applying the AMA Guides, 5th Edition, the applicant falls within DRE Lumbar Category II, yielding 8% whole person impairment.',
      cite: { document: 'Panel QME', page: 44 },
    },
    {
      label: 'Apportionment',
      quote:
        'Thirty percent of the current disability is apportioned to a pre-existing degenerative condition.',
      cite: { document: 'Panel QME', page: 47 },
    },
    {
      label: 'Work restrictions',
      quote:
        'Precluded from repetitive bending and from lifting in excess of 25 pounds on a sustained basis.',
      cite: { document: 'Panel QME', page: 49 },
    },
  ] as ReadonlyArray<QmeFinding>,
  openQuestions: [
    'The thirty percent apportionment at p. 47 names no records as its basis, and no prior imaging or treatment history appears anywhere else in the report.',
    'Future medical care is called “likely to be required” at p. 52 without naming a modality, a frequency, or a duration, so nothing in the report supports a figure.',
  ],
};
