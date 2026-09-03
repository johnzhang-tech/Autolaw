/**
 * Fictional demonstration data. Contains no real client information.
 * Never replace with content derived from an actual matter.
 */

export type SignalTone = 'verified' | 'conflict' | 'neutral';

export interface Signal {
  count: number;
  label: string;
  tone: SignalTone;
}

export const CASE_SUMMARY = {
  title: 'Demo case — lumbar & left shoulder',
  meta: 'Workers’ compensation · 214 documents · 1,880 pages',
};

export const SIGNALS: Signal[] = [
  { count: 3, label: 'Missing records', tone: 'conflict' },
  { count: 2, label: 'Conflicting facts', tone: 'conflict' },
  { count: 1, label: 'Treatment gap', tone: 'conflict' },
  { count: 41, label: 'Confirmed facts', tone: 'verified' },
  { count: 6, label: 'Work restrictions', tone: 'verified' },
  { count: 4, label: 'Next actions', tone: 'neutral' },
];

export interface ChronologyEvent {
  /**
   * MM/DD/YYYY, the convention legal documents use. Every date on this page — spine,
   * prose, quoted excerpts, treatment rows — is written the same way on purpose: the
   * buyer reads dates for a living, and three competing formats on one screen reads
   * as carelessness. Do not reintroduce ISO or bare MM/YYYY.
   */
  date: string;
  title: string;
  provider: string;
  tone: SignalTone;
  flag?: string;
  source: string;
  page: string;
  /** [before, highlighted, after] — the highlighted span is the cited sentence. */
  quote?: [string, string, string];
  meta: Array<[string, string]>;
  /** null when the fact is unresolved or the document is absent. */
  confidence: number | null;
  warning?: { title: string; body: string };
  action: string;
}

export const CHRONOLOGY: ChronologyEvent[] = [
  {
    date: '01/18/2025',
    title: 'Date of injury — lifting incident',
    provider: 'DWC-1 claim form',
    tone: 'verified',
    source: 'DWC-1 claim form',
    page: 'page 1',
    quote: [
      'I felt a sharp pull in the low back while ',
      'lifting a container estimated at 60 pounds from floor level',
      '.',
    ],
    meta: [['Reported', '01/18/2025'], ['Body part', 'Lumbar spine'], ['Employer received', '01/20/2025']],
    confidence: 97,
    action: 'Open page 1',
  },
  {
    date: '01/22/2025',
    title: 'Initial evaluation — PTP',
    provider: 'Dr. L. Okafor · occupational medicine',
    tone: 'verified',
    source: 'PTP report — Dr. L. Okafor',
    page: 'page 2',
    quote: [
      'Examination reveals paraspinal tenderness and reduced lumbar flexion. ',
      'Assessment: lumbar strain with radicular symptoms into the left lower extremity',
      '.',
    ],
    // The extracted value repeats the source sentence and does not upgrade it. "Radicular
    // symptoms" is what the PTP wrote four days post-injury; "radiculopathy" would be a
    // diagnosis he did not make, and a sceptical reader checks exactly this.
    meta: [['Provider', 'L. Okafor, DO'], ['Diagnosis', 'Lumbar strain with radicular symptoms'], ['Date of service', '01/22/2025']],
    confidence: 92,
    action: 'Open page 2',
  },
  {
    date: '03/14/2025',
    title: 'MRI lumbar spine',
    provider: 'Valley Imaging',
    tone: 'conflict',
    flag: 'Referenced but not produced',
    source: 'Not in the record',
    page: 'not in the file',
    meta: [['Referenced by', 'QME p.14, PTP p.5'], ['Facility', 'Valley Imaging'], ['Status', 'Not produced']],
    confidence: null,
    warning: {
      title: 'Referenced but never produced.',
      body: 'Two documents cite an MRI dated 03/14/2025. No imaging report exists in the file. Autolaw flags the gap and lists the imaging report as needed rather than inferring the findings.',
    },
    action: 'Needed: imaging report',
  },
  {
    date: '04/02/2025',
    title: 'Released to modified duty',
    provider: 'PTP report',
    tone: 'neutral',
    flag: 'Conflicts with QME',
    source: 'PTP report — Dr. L. Okafor',
    page: 'page 3',
    quote: ['Patient ', 'may return to modified duty with no lifting over 15 pounds', ' effective 04/02/2025.'],
    meta: [['Work status', 'Modified duty'], ['Restriction', 'No lifting > 15 lb'], ['Date of service', '04/02/2025']],
    confidence: null,
    warning: {
      title: 'Unresolved conflict.',
      body: 'The QME dated 04/18/2025 opines the injured worker was temporarily totally disabled from the date of injury through that evaluation — a period that overlaps this release to modified duty. Both opinions stay visible with their dates and sources. Autolaw does not pick a winner — an attorney resolves it.',
    },
    action: 'Compare sources',
  },
  {
    date: '04/18/2025',
    title: 'QME evaluation',
    provider: 'Dr. A. Reyes · orthopedic surgery',
    tone: 'verified',
    source: 'QME report — Dr. A. Reyes',
    page: 'page 14',
    quote: [
      'Claimant reports persistent low back pain radiating into the left lower extremity. ',
      'MRI dated 03/14/2025 demonstrates a 4mm disc protrusion at L4–L5 with mild foraminal narrowing',
      '.',
    ],
    // Work status is carried here so the conflict flagged on 04/02/2025 shows both sides
    // with a page cite. p.22 is the same citation the body explorer's Restrictions row uses.
    meta: [
      ['Provider', 'A. Reyes, MD'],
      ['Finding', 'Disc protrusion, L4–L5'],
      ['Work status', 'Temporarily totally disabled — p.22'],
      ['Date of service', '04/18/2025'],
    ],
    confidence: 94,
    action: 'Open page 14',
  },
];

export interface BodyRegion {
  key: string;
  label: string;
  /**
   * Accepted by the claims administrator — not merely pled by the applicant. The two
   * differ, and the gap between them is where comp cases are litigated, so every label
   * built from this flag must say "accepted", never "claimed".
   */
  claimed: boolean;
  plain: string;
  rows: Array<{ label: string; value: string; cite: string; warn: boolean }>;
}

export const BODY_REGIONS: BodyRegion[] = [
  {
    key: 'lumbar',
    label: 'Lumbar spine',
    claimed: true,
    plain: 'A disc at L4–L5 bulges into the opening the nerve root passes through. The records tie that to the left-leg pain; no imaging report in the file confirms nerve compression.',
    rows: [
      { label: 'Symptoms', value: 'Low back pain radiating into the left lower extremity', cite: 'PTP report p.2', warn: false },
      { label: 'Imaging', value: '4mm disc protrusion at L4–L5, mild foraminal narrowing — recited in the QME report; the MRI itself is not in the file', cite: 'QME report p.14', warn: true },
      { label: 'Treatment', value: 'Conservative care, 12 physical therapy visits, epidural injection 05/06/2025', cite: 'Billing summary p.7', warn: false },
      { label: 'Restrictions', value: 'No lifting over 15 lb — disputed by QME', cite: 'PTP p.3 / QME p.22', warn: true },
      { label: 'Missing', value: 'MRI report referenced by two documents, never produced', cite: 'Flagged as missing', warn: true },
    ],
  },
  {
    key: 'shoulder',
    label: 'Left shoulder',
    claimed: true,
    plain: 'The rotator cuff is partially torn. Surgery was recommended, denied at utilization review, and is now on appeal to IMR.',
    rows: [
      { label: 'Symptoms', value: 'Pain with overhead reach, night pain, weakness', cite: 'PTP report p.4', warn: false },
      // Cited to the shoulder MRI by name: an unqualified "MRI report" collides with the
      // lumbar MRI three rows above, which is the one that is missing from the file.
      { label: 'Imaging', value: 'Partial-thickness supraspinatus tear', cite: 'MRI left shoulder p.1', warn: false },
      { label: 'Treatment', value: 'Injection 06/11/2025; arthroscopic repair recommended', cite: 'QME report p.18', warn: false },
      { label: 'Authorization', value: 'Utilization review denial 07/09/2025, IMR appeal pending', cite: 'UR letter p.1', warn: true },
    ],
  },
  {
    key: 'cervical',
    label: 'Cervical spine',
    claimed: false,
    plain: 'Not an accepted body part. Records still reference it, so the region stays visible instead of being hidden.',
    rows: [
      { label: 'Claim status', value: 'Not an accepted body part', cite: 'Claims administrator notice p.2', warn: true },
      { label: 'Prior history', value: 'Treated 02/11/2019 through 07/30/2019, predates the injury', cite: 'Prior claim records p.11', warn: true },
    ],
  },
  {
    key: 'knee',
    label: 'Right knee',
    claimed: false,
    plain: 'Not an accepted body part, and no document in the file mentions it.',
    rows: [
      { label: 'Claim status', value: 'Not an accepted body part', cite: 'Claims administrator notice p.2', warn: true },
      { label: 'Records', value: 'No documents reference this region', cite: 'no source', warn: true },
    ],
  },
];

export const PRACTICE_OUTPUTS = {
  PI: {
    heading: 'Built for the demand',
    intro: 'Liability, causation, and damages assembled from the record — every figure traceable to a bill or a report.',
    items: [
      { title: 'Causation chain', detail: 'Mechanism to diagnosis, gaps flagged' },
      { title: 'Treatment gaps', detail: 'Breaks in care, with dates' },
      { title: 'Medical specials', detail: 'Billed vs. paid, reconciled' },
      { title: 'Prior injuries and claims', detail: 'What the defense will find, before they find it' },
      { title: 'Liens and subrogation', detail: 'Every lienholder, with the amount asserted' },
      { title: 'Demand narrative', detail: 'Source-linked, firm-formatted' },
    ],
  },
  WC: {
    heading: 'Built for the claim',
    intro: 'The claim turns on what the QME said, when the injured worker was temporarily disabled, and which body parts the claims administrator accepted. Autolaw pulls each of those out of the file with the page cite attached.',
    items: [
      { title: 'QME/AME vs PTP', detail: 'Where the opinions diverge' },
      { title: 'Work status & restrictions', detail: 'Current and historical' },
      { title: 'MMI / P&S', detail: 'Date and supporting opinion' },
      { title: 'Apportionment', detail: 'Industrial vs. non-industrial, per body part, per physician' },
      { title: 'UR / IMR history', detail: 'Denials and appeals' },
      { title: 'Unresolved conflicts', detail: 'Surfaced, never auto-resolved' },
    ],
  },
} as const;

export type PracticeArea = keyof typeof PRACTICE_OUTPUTS;
