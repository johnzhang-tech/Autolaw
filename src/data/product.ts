/**
 * Every feature the site names, in one place.
 *
 * `availability` is a claim, not a decoration. `live` renders no label, so the absence
 * of a label IS the assertion that a customer can reach the feature today. Nothing may
 * be moved to `live` without checking case-app: see the audit recorded in
 * docs/superpowers/specs/2026-09-15-autolaw-product-section-design.md. Task 6 of that
 * plan adds a guard to src/__tests__/claims.test.tsx that will fail the build if a
 * non-live feature loses its label — until that lands, this rule is convention only.
 */
export type Availability = 'live' | 'early-access' | 'coming-next';
export type Phase = 'pre-lit' | 'litigation';

/**
 * Deliberately NOT named `Practice`. PracticeContext already exports that name for the
 * visitor's chosen practice, which is 'PI' | 'WC' with no 'both' — two same-named types
 * with different members is how a file ends up importing the wrong one and still compiling.
 */
export type FeaturePractice = 'PI' | 'WC' | 'both';

export interface Feature {
  id: string;
  name: string;
  line: string;
  /** Practice-specific replacement for `line`. Only the Damages Ledger needs one today. */
  wcLine?: string;
  practice: FeaturePractice;
  phases: ReadonlyArray<Phase>;
  availability: Availability;
  detail: ReadonlyArray<string>;
  output: string;
}

export const AVAILABILITY_LABEL: Record<Exclude<Availability, 'live'>, string> = {
  'early-access': 'Early access',
  'coming-next': 'Coming next',
};

export const PHASES: Record<Phase, { heading: string; line: string }> = {
  'pre-lit': {
    heading: 'Pre-Litigation',
    line: 'Build the file. Prove the damages. Send the demand.',
  },
  litigation: {
    heading: 'Litigation',
    line: 'The same file, ready for the fight.',
  },
};

export const FEATURES: ReadonlyArray<Feature> = [
  {
    id: 'ask-al',
    name: 'Ask AL',
    line: 'Ask anything about the case. Every answer cites document, page, and line.',
    practice: 'both',
    phases: ['pre-lit', 'litigation'],
    availability: 'live',
    detail: [
      'Answers come from this case file and nothing else.',
      'Every sentence carries a citation you can open.',
      'Ask for something the file cannot support and it says so.',
    ],
    output: 'On screen, in every case',
  },
  {
    id: 'medical-chronologies',
    name: 'Medical Chronologies',
    line: 'Thousands of pages become one dated treatment story, cited and exportable.',
    practice: 'both',
    phases: ['pre-lit', 'litigation'],
    availability: 'live',
    detail: [
      'Every visit, procedure, and opinion in date order.',
      'Each entry names the document, page, and sentence it came from.',
      'Split at the date of loss, so before and after read separately.',
    ],
    output: 'Word export',
  },
  {
    id: 'significance-brief',
    name: 'Medical Significance Brief',
    line: 'What actually matters in the records, pulled out and sourced.',
    practice: 'both',
    phases: ['pre-lit'],
    availability: 'live',
    detail: [
      'The findings that carry the case, separated from the routine ones.',
      'Injuries by body part, with the evidence behind each.',
    ],
    output: 'Word export',
  },
  {
    id: 'missing-records',
    name: 'Missing Records & Gaps',
    line: 'See what the records reference but nobody produced.',
    practice: 'both',
    phases: ['pre-lit'],
    availability: 'live',
    detail: [
      'Imaging and reports cited by other documents but absent from the file.',
      'Treatment gaps that a defense adjuster will find first if you do not.',
    ],
    output: 'On screen',
  },
  {
    id: 'qme-ame',
    name: 'QME/AME Deep Analysis',
    line: 'Every medical-legal opinion side by side, contradictions surfaced.',
    practice: 'WC',
    phases: ['pre-lit', 'litigation'],
    availability: 'live',
    detail: [
      'QME, AME, and treating-physician opinions on one page.',
      'Where the doctors disagree, both positions stay visible with their dates.',
      'Work status, restrictions, and disputed body parts, as each report states them.',
    ],
    output: 'On screen',
  },
  {
    id: 'damages-ledger',
    name: 'Damages Ledger',
    line: 'Every medical bill, lien, and benefit payment in one running total.',
    wcLine: 'Reconcile the benefit printout — every TTD, PD, and medical payment — against what is owed.',
    practice: 'both',
    phases: ['pre-lit'],
    availability: 'live',
    detail: [
      'Bills, liens, and benefits together, so the number is never assembled by hand.',
      'An explanation of benefits folds into the bill it belongs to.',
      'A lien with no stated amount says so rather than guessing.',
    ],
    output: 'On screen',
  },
  {
    id: 'demand-packages',
    name: 'Demand Packages',
    line: 'An evidence-backed demand, exported only after an attorney approves it.',
    practice: 'PI',
    phases: ['pre-lit'],
    availability: 'live',
    detail: [
      'Built from the chronology and the ledger, in your firm’s template.',
      'Section by section, each one approved before it counts.',
      'Export refuses figures nobody approved.',
    ],
    output: 'Word export',
  },
  {
    id: 'case-value',
    name: 'Case Value & Howell Analysis',
    line: 'Three scenarios, Howell and Pebley views, future care.',
    practice: 'PI',
    phases: ['pre-lit'],
    availability: 'live',
    detail: [
      'Conservative, base, and aggressive scenarios from the same evidence.',
      'Billed versus paid, the way California argues it.',
      'Future care carried into the total rather than bolted on.',
    ],
    output: 'On screen, with a Howell summary export',
  },
  {
    id: 'negotiation',
    name: 'Negotiation Tracking',
    line: 'Demand sent, offers, counters, best offer, on one timeline.',
    practice: 'PI',
    phases: ['pre-lit'],
    availability: 'live',
    detail: [
      'Every move in the negotiation against one matter.',
      'The adjuster and carrier on the record with it.',
    ],
    output: 'On screen',
  },
  {
    id: 'case-management-summary',
    name: 'Case Management Summary',
    line: 'Claim info, both chronologies, treatment, providers, damages — one document.',
    practice: 'both',
    phases: ['litigation'],
    availability: 'live',
    detail: [
      'Pre-litigation and litigation chronologies in a single summary.',
      'Providers, bills, wage loss, costs advanced, and experts alongside them.',
    ],
    output: 'Word export',
  },
  {
    id: 'conflicts',
    name: 'Conflicting Records & Opinions',
    line: 'Where the record disagrees with itself, both sources visible.',
    practice: 'both',
    phases: ['litigation'],
    availability: 'live',
    detail: [
      'Two records that cannot both be true are flagged, not reconciled.',
      'Each side keeps its own date, author, and page.',
      'Autolaw does not pick a winner. An attorney resolves it.',
    ],
    output: 'On screen',
  },
  {
    id: 'deadlines',
    name: 'Deadlines & Statute of Limitations',
    line: 'What is running, and what closes next.',
    practice: 'both',
    phases: ['litigation'],
    availability: 'live',
    detail: [
      'The limitations estimate from the date of loss and the jurisdiction.',
      'Said plainly when it cannot be determined, rather than guessed.',
    ],
    output: 'On screen',
  },
  {
    id: 'illustrations',
    name: 'Accident & Injury Illustrations',
    line: 'Illustrations built only from what the record supports.',
    practice: 'both',
    phases: ['litigation'],
    availability: 'early-access',
    detail: [
      'Collision reconstruction, injury mechanism, treatment, and daily limitations.',
      'What the record does not state is not drawn — every scene is bound to the evidence behind it.',
      'A second model re-inspects each finished image for reversed impact direction or an over-claimed spinal level, and an attorney approves it before it locks.',
      'Running today with our team on your case, during a pilot.',
    ],
    output: 'Stills, and short video on request',
  },
  {
    id: 'discovery-responses',
    name: 'Discovery Responses',
    line: 'Answer form and special interrogatories, production, and admissions from the file you already have.',
    practice: 'both',
    phases: ['litigation'],
    availability: 'coming-next',
    detail: [
      'The served set broken into numbered requests, each matched to facts already in the file.',
      'Your firm’s standing objections applied by request type.',
    ],
    output: 'Not yet available',
  },
  {
    id: 'deposition-review',
    name: 'Deposition Review',
    line: 'Every deposition read and cited before the transcript goes cold.',
    practice: 'both',
    phases: ['litigation'],
    availability: 'coming-next',
    detail: [
      'Testimony that contradicts the medical record, flagged by page and line.',
      'For workers’ compensation, the applicant and QME/AME depositions the case turns on.',
    ],
    output: 'Not yet available',
  },
];

/** Cross-phase. Not a column — these run under every feature above. */
export const PLATFORM: ReadonlyArray<{ id: string; name: string; line: string }> = [
  {
    id: 'case-files',
    name: 'Case Files',
    line: 'Upload or sync from Dropbox. Every page read, classified, and searchable.',
  },
  {
    id: 'review-queue',
    name: 'Attorney Review Queue',
    line: 'Autolaw proposes. Someone at your firm confirms before it counts as a fact.',
  },
  {
    id: 'firm-access',
    name: 'Firm Roles & Access',
    line: 'One firm, one boundary. Who opened which document is on the record.',
  },
];
