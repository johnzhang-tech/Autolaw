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
  meta: "Workers' compensation · 214 documents · 1,880 pages",
};

export const SIGNALS: Signal[] = [
  { count: 3, label: 'Missing records', tone: 'conflict' },
  { count: 2, label: 'Conflicting facts', tone: 'conflict' },
  { count: 1, label: 'Treatment gap', tone: 'conflict' },
  { count: 41, label: 'Verified facts', tone: 'verified' },
  { count: 6, label: 'Work restrictions', tone: 'verified' },
  { count: 4, label: 'Next actions', tone: 'neutral' },
];

export interface ChronologyEvent {
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
    date: '2025-01-18',
    title: 'Date of injury — lifting incident',
    provider: 'Employer incident report',
    tone: 'verified',
    source: 'Employer incident report',
    page: 'page 1',
    quote: [
      'Employee states he felt a sharp pull in the low back while ',
      'lifting a container estimated at 60 pounds from floor level',
      '.',
    ],
    meta: [['Reported', '2025-01-18'], ['Body part', 'Lumbar spine'], ['Witness', 'Named on p.2']],
    confidence: 97,
    action: 'Open page 1',
  },
  {
    date: '2025-01-22',
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
    meta: [['Provider', 'L. Okafor, DO'], ['Diagnosis', 'Lumbar strain, radiculopathy'], ['Date of service', '2025-01-22']],
    confidence: 92,
    action: 'Open page 2',
  },
  {
    date: '2025-03-14',
    title: 'MRI lumbar spine',
    provider: 'Valley Imaging',
    tone: 'conflict',
    flag: 'Referenced but not produced',
    source: 'Not in the record',
    page: '—',
    meta: [['Referenced by', 'QME p.14, PTP p.5'], ['Facility', 'Valley Imaging'], ['Status', 'Not produced']],
    confidence: null,
    warning: {
      title: 'Referenced but never produced.',
      body: 'Two documents cite an MRI dated 03/14. No imaging report exists in the file. Autolaw flags the gap and drafts the records request rather than inferring the findings.',
    },
    action: 'Draft records request',
  },
  {
    date: '2025-04-02',
    title: 'Released to modified duty',
    provider: 'PTP report',
    tone: 'neutral',
    flag: 'Conflicts with QME',
    source: 'PTP report — Dr. L. Okafor',
    page: 'page 3',
    quote: ['Patient ', 'may return to modified duty with no lifting over 15 pounds', ' effective 04/02.'],
    meta: [['Work status', 'Modified duty'], ['Restriction', 'No lifting > 15 lb'], ['Date of service', '2025-04-02']],
    confidence: null,
    warning: {
      title: 'Unresolved conflict.',
      body: 'The QME dated 04/18 states the claimant remains temporarily totally disabled. Both sources stay visible with their dates. Autolaw does not pick a winner — an attorney resolves it.',
    },
    action: 'Compare sources',
  },
  {
    date: '2025-04-18',
    title: 'QME evaluation',
    provider: 'Dr. A. Reyes · orthopedic surgery',
    tone: 'verified',
    source: 'QME report — Dr. A. Reyes',
    page: 'page 14',
    quote: [
      'Claimant reports persistent low back pain radiating into the left lower extremity. ',
      'MRI dated 03/14 demonstrates a 4mm disc protrusion at L4–L5 with mild foraminal narrowing',
      '.',
    ],
    meta: [['Provider', 'A. Reyes, MD'], ['Finding', 'Disc protrusion, L4–L5'], ['Date of service', '2025-04-18']],
    confidence: 94,
    action: 'Open page 14',
  },
];

export interface BodyRegion {
  key: string;
  label: string;
  claimed: boolean;
  plain: string;
  rows: Array<{ label: string; value: string; cite: string; warn: boolean }>;
}

export const BODY_REGIONS: BodyRegion[] = [
  {
    key: 'lumbar',
    label: 'Lumbar spine',
    claimed: true,
    plain: 'A disc in the low back is pressing on a nerve, which is why pain travels down the left leg.',
    rows: [
      { label: 'Symptoms', value: 'Low back pain radiating into the left lower extremity', cite: 'PTP report p.2', warn: false },
      { label: 'Imaging', value: '4mm disc protrusion at L4–L5, mild foraminal narrowing', cite: 'QME report p.14', warn: false },
      { label: 'Treatment', value: 'Conservative care, 12 physical therapy visits, epidural injection 05/2025', cite: 'Billing summary p.7', warn: false },
      { label: 'Restrictions', value: 'No lifting over 15 lb — disputed by QME', cite: 'PTP p.3 / QME p.22', warn: true },
      { label: 'Missing', value: 'MRI report referenced by two documents, never produced', cite: 'Records request drafted', warn: true },
    ],
  },
  {
    key: 'shoulder',
    label: 'Left shoulder',
    claimed: true,
    plain: 'The rotator cuff is partially torn. Surgery has been recommended but not yet authorized.',
    rows: [
      { label: 'Symptoms', value: 'Pain with overhead reach, night pain, weakness', cite: 'PTP report p.4', warn: false },
      { label: 'Imaging', value: 'Partial-thickness supraspinatus tear', cite: 'MRI report p.1', warn: false },
      { label: 'Treatment', value: 'Injection 06/2025; arthroscopic repair recommended', cite: 'QME report p.18', warn: false },
      { label: 'Authorization', value: 'Utilization review denial 07/2025, IMR appeal pending', cite: 'UR letter p.1', warn: true },
    ],
  },
  {
    key: 'cervical',
    label: 'Cervical spine',
    claimed: false,
    plain: 'Not part of the claim. Autolaw found records referencing it, so the region stays visible rather than hidden.',
    rows: [
      { label: 'Claim status', value: 'Not an accepted body part', cite: 'Claims administrator notice p.2', warn: true },
      { label: 'Prior history', value: 'Treatment in 2019, predates the injury', cite: 'Prior claim records p.11', warn: true },
    ],
  },
  {
    key: 'knee',
    label: 'Right knee',
    claimed: false,
    plain: 'Not part of the claim and no records mention it.',
    rows: [
      { label: 'Claim status', value: 'Not an accepted body part', cite: 'Claims administrator notice p.2', warn: true },
      { label: 'Records', value: 'No documents reference this region', cite: '—', warn: true },
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
      { title: 'Demand narrative', detail: 'Source-linked, firm-formatted' },
    ],
  },
  WC: {
    heading: 'Built for the claim',
    intro: 'A separate product surface, not PI copy with the words swapped — PI and WC are isolated at the route, navigation, and data layer.',
    items: [
      { title: 'QME/AME vs PTP', detail: 'Where the opinions diverge' },
      { title: 'Work status & restrictions', detail: 'Current and historical' },
      { title: 'MMI / P&S', detail: 'Date and supporting opinion' },
      { title: 'Apportionment', detail: 'Per body part, per source' },
      { title: 'UR / IMR history', detail: 'Denials and appeals' },
      { title: 'Unresolved conflicts', detail: 'Surfaced, never auto-resolved' },
    ],
  },
} as const;

export type PracticeArea = keyof typeof PRACTICE_OUTPUTS;
