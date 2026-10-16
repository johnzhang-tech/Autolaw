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
export type ProductIconName =
  | 'intake'
  | 'assistant'
  | 'chronology'
  | 'significance'
  | 'missing-records'
  | 'qme'
  | 'damages'
  | 'demand'
  | 'case-value'
  | 'negotiation'
  | 'case-summary'
  | 'conflicts'
  | 'deadlines'
  | 'illustrations'
  | 'discovery'
  | 'deposition';

/**
 * Deliberately NOT named `Practice`. PracticeContext already exports that name for the
 * visitor's chosen practice, which is 'PI' | 'WC' with no 'both' — two same-named types
 * with different members is how a file ends up importing the wrong one and still compiling.
 */
export type FeaturePractice = 'PI' | 'WC' | 'both';

export interface FeatureMeta {
  title: string;
  description: string;
}

export interface FeaturePage {
  /** The page's one-sentence outcome promise. */
  promise: string;
  /** The work this replaces and the evidence it preserves. */
  body: ReadonlyArray<string>;
  /** The three visible stages of the feature's workflow. */
  steps: ReadonlyArray<{ heading: string; body: string }>;
  /** Explicit boundaries: persuasive precisely because they are refusals. */
  limits: ReadonlyArray<string>;
  /** Feature ids, resolved into routed links by FeaturePage. */
  related: ReadonlyArray<string>;
  /** Unique copy for search results and forwarded links. */
  meta: FeatureMeta;
}

export interface Feature {
  id: string;
  name: string;
  icon: ProductIconName;
  line: string;
  /** Practice-specific replacement for `line`. Only the Damages Ledger needs one today. */
  wcLine?: string;
  practice: FeaturePractice;
  phases: ReadonlyArray<Phase>;
  availability: Availability;
  detail: ReadonlyArray<string>;
  output: string;
  /** Permanent directory slug. Absent means this feature is not a destination. */
  slug?: string;
  /** Page copy is absent whenever slug is absent. */
  page?: FeaturePage;
}

export const AVAILABILITY_LABEL: Record<Exclude<Availability, 'live'>, string> = {
  'early-access': 'Early access',
  'coming-next': 'Coming next',
};

export const PHASES: Record<Phase, { heading: string; line: string }> = {
  'pre-lit': {
    heading: 'Pre-Litigation',
    line: 'Build stronger cases—with insight and speed.',
  },
  litigation: {
    heading: 'Litigation',
    line: 'Win with deeper preparation and faster response.',
  },
};

/**
 * The one feature id the ASK_AL_ENABLED kill switch (src/config.ts) has to name. Exported
 * so the switch's consumer imports this instead of retyping the string — a rename here
 * would otherwise silently defeat the switch instead of failing to compile.
 */
export const ASK_AL_FEATURE_ID = 'ask-al';

export const FEATURES: ReadonlyArray<Feature> = [
  {
    id: 'intake',
    name: 'Intake',
    icon: 'intake',
    line: 'Turn the first client conversation and documents into a review-ready new matter.',
    practice: 'both',
    phases: ['pre-lit'],
    availability: 'live',
    detail: [
      'Record in the browser or upload existing audio and documents into a pre-case workspace.',
      'Review the transcript, summary, candidate facts, and follow-up questions together.',
      'Attach the approved intake to the case when the team is ready.',
    ],
    output: 'Review-ready intake workspace',
    slug: 'intake',
    page: {
      promise: 'Know the new matter before the file ever reaches an attorney.',
      body: [
        'Intake gives the team one pre-case workspace for recording or uploading the first client conversation and gathering the documents that arrive with it.',
        'The transcript, summary, candidate facts, follow-up questions, and document classifications stay together for human review before anything is attached to the matter.',
      ],
      steps: [
        { heading: 'Capture the matter', body: 'Record in the browser or upload existing audio and intake documents.' },
        { heading: 'Build the review', body: 'Bring the transcript, summary, candidate facts, and unanswered questions into one workspace.' },
        { heading: 'Approve and attach', body: 'Review the proposed information, correct it, and attach the approved intake to the case.' },
      ],
      limits: [
        'It will not decide whether the firm should accept the matter.',
        'It will not turn a client-reported statement into a verified case fact without review.',
        'It will not attach proposed information to a case before the team approves it.',
      ],
      related: ['ask-al', 'missing-records', 'case-management-summary'],
      meta: {
        title: 'Legal Intake Review Workspace for New Matters | Autolaw',
        description: 'Capture a new client conversation and documents, then review the transcript, summary, candidate facts, and follow-up questions in one intake workspace.',
      },
    },
  },
  {
    id: ASK_AL_FEATURE_ID,
    name: 'Ask AL',
    icon: 'assistant',
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
    slug: 'ask-al',
    page: {
      promise: 'Put the whole case on call, with every answer traceable to the record.',
      body: [
        'Ask AL gives the team one place to question the case file in plain language instead of reopening the same stack of records for every new issue.',
        'Its answer stays attached to the evidence: each supported statement names the document, page, and sentence, so the attorney can move from answer to source without taking the software on faith.',
      ],
      steps: [
        { heading: 'Ask the case', body: 'Type the question the way you would ask another attorney on the matter.' },
        { heading: 'Open the source', body: 'Follow the citation from each supported statement back to the exact record passage.' },
        { heading: 'Keep the boundary', body: 'When the file cannot support an answer, keep that absence visible instead of filling it with a guess.' },
      ],
      limits: [
        'It will not answer from material outside this case file.',
        'It will not turn an uncited assertion into a case fact.',
        'It will not replace the attorney’s judgment about what the record means for strategy.',
      ],
      related: ['medical-chronologies', 'conflicts', 'missing-records'],
      meta: {
        title: 'Ask AL — Cited Answers From the Case File | Autolaw',
        description: 'Ask questions across the case file and open the document, page, and sentence behind every supported answer with Ask AL.',
      },
    },
  },
  {
    id: 'medical-chronologies',
    name: 'Medical Chronologies',
    icon: 'chronology',
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
    slug: 'medical-chronologies',
    page: {
      promise: 'See the treatment story before thousands of pages bury it.',
      body: [
        'Medical Chronologies turn scattered records into one date-ordered treatment story, from the first documented event through the latest care in the file.',
        'Every entry keeps its source and the timeline separates pre-loss history from what follows, so the team can read the sequence without losing the record beneath it.',
      ],
      steps: [
        { heading: 'Read every page', body: 'Classify the records and extract the dated visits, procedures, findings, and opinions.' },
        { heading: 'Order the story', body: 'Place the supported events in sequence and separate the history before and after the loss.' },
        { heading: 'Open or export', body: 'Review any citation in context, then export the chronology to Word when the team is ready.' },
      ],
      limits: [
        'It will not add a medical event that the records do not support.',
        'It will not hide the source behind a summary.',
        'It will not turn a chronology into a medical opinion.',
      ],
      related: ['significance-brief', 'missing-records', 'case-management-summary'],
      meta: {
        title: 'Medical Chronologies With Page-Level Citations | Autolaw',
        description: 'Turn a large medical record into a dated treatment story with document, page, and sentence citations and a Word export.',
      },
    },
  },
  {
    id: 'significance-brief',
    name: 'Medical Significance Brief',
    icon: 'significance',
    line: 'What actually matters in the records, pulled out and sourced.',
    practice: 'both',
    phases: ['pre-lit'],
    availability: 'live',
    detail: [
      'The findings that carry the case, separated from the routine ones.',
      'Injuries by body part, with the evidence behind each.',
    ],
    output: 'Word export',
    slug: 'medical-significance-brief',
    page: {
      promise: 'Find the medical facts that carry the case, and the record behind every one.',
      body: [
        'The Medical Significance Brief separates the findings that change how the file reads from the routine language surrounding them.',
        'The brief organizes supported injuries by body part and keeps the source beside each point, giving the attorney a focused starting place without pretending the rest of the record disappeared.',
      ],
      steps: [
        { heading: 'Find the signal', body: 'Identify the diagnoses, imaging, procedures, restrictions, and opinions that materially shape the file.' },
        { heading: 'Group the evidence', body: 'Organize supported findings by body part while preserving their dates and citations.' },
        { heading: 'Review the brief', body: 'Open each source in context, then export the attorney-reviewed brief to Word.' },
      ],
      limits: [
        'It will not treat a routine mention as a significant finding without support.',
        'It will not convert a provider’s statement into Autolaw’s own medical opinion.',
      ],
      related: ['medical-chronologies', 'conflicts', 'demand-packages'],
      meta: {
        title: 'Medical Significance Briefs Grounded in the Record | Autolaw',
        description: 'Pull the medical findings that matter out of the record, organize them by body part, and keep every point tied to its source.',
      },
    },
  },
  {
    id: 'missing-records',
    name: 'Missing Records & Gaps',
    icon: 'missing-records',
    line: 'See what the records reference but nobody produced.',
    practice: 'both',
    phases: ['pre-lit'],
    availability: 'live',
    detail: [
      'Imaging and reports cited by other documents but absent from the file.',
      'Treatment gaps that a defense adjuster will find first if you do not.',
    ],
    output: 'On screen',
    slug: 'missing-records-and-gaps',
    page: {
      promise: 'Find the missing page before opposing counsel builds a story around it.',
      body: [
        'Missing Records & Gaps compares what the file contains with what its own documents say should exist: an imaging study, an outside report, a follow-up visit, or another referenced record.',
        'It also makes breaks in the treatment sequence visible early, while the firm can still decide what the gap means and what to do next.',
      ],
      steps: [
        { heading: 'Map what arrived', body: 'Classify the produced records by provider, date, and document type.' },
        { heading: 'Follow every reference', body: 'Compare cited reports, studies, and visits against what is actually in the file.' },
        { heading: 'Review the gap', body: 'Show the missing item or treatment break on screen for the team to resolve.' },
      ],
      limits: [
        'It identifies the gap; your firm decides what to request and from whom.',
        'It will not call an item missing when the record does not support that conclusion.',
      ],
      related: ['medical-chronologies', 'ask-al', 'deadlines'],
      meta: {
        title: 'Missing Medical Records and Treatment Gaps | Autolaw',
        description: 'See referenced reports that never arrived and treatment gaps that could change how the opposing side reads the case.',
      },
    },
  },
  {
    id: 'qme-ame',
    name: 'QME/AME Deep Analysis',
    icon: 'qme',
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
    slug: 'qme-ame-deep-analysis',
    page: {
      promise: 'Read every medical-legal opinion against the others without losing the source.',
      body: [
        'QME/AME Deep Analysis places the reports that drive a workers’ compensation matter into one comparable view instead of leaving each opinion trapped in a separate PDF.',
        'Work status, restrictions, body parts, and disputed conclusions stay attached to the report and date that stated them, with disagreements surfaced rather than flattened.',
      ],
      steps: [
        { heading: 'Read each evaluator', body: 'Extract the supported opinions from QME, AME, and treating-physician reports.' },
        { heading: 'Align the issues', body: 'Place work status, restrictions, body parts, and conclusions side by side.' },
        { heading: 'Hold the disagreement', body: 'Keep both cited positions visible for the attorney to evaluate.' },
      ],
      limits: [
        'It will not decide which physician is right.',
        'It will not turn a disputed opinion into an accepted case fact.',
      ],
      related: ['conflicts', 'medical-chronologies', 'case-management-summary'],
      meta: {
        title: 'QME and AME Report Analysis for Workers’ Comp | Autolaw',
        description: 'Compare QME, AME, and treating-physician opinions with work status, restrictions, body parts, dates, and sources intact.',
      },
    },
  },
  {
    id: 'damages-ledger',
    name: 'Damages Ledger',
    icon: 'damages',
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
    slug: 'damages-ledger',
    page: {
      promise: 'Know which damages number the file can support before the negotiation starts.',
      body: [
        'The Damages Ledger keeps medical bills, liens, benefit payments, and the documents behind them in one running view instead of leaving the total spread across a case file.',
        'For workers’ compensation, the same ledger reconciles the benefit printout across TTD, PD, and medical payments so the firm can see what was paid against what the record says is owed.',
      ],
      steps: [
        { heading: 'Read the financial record', body: 'Extract supported charges, payments, liens, and benefits from the case documents.' },
        { heading: 'Match what belongs together', body: 'Fold an explanation of benefits into its bill and keep unmatched items visible.' },
        { heading: 'Review the running total', body: 'Open the source behind a figure and resolve gaps before relying on the number.' },
      ],
      limits: [
        'It will not invent an amount for a lien or payment the file does not state.',
        'It will not silently merge two financial entries that cannot be matched.',
      ],
      related: ['case-value', 'demand-packages', 'case-management-summary'],
      meta: {
        title: 'Damages Ledger for Bills, Liens, and Benefits | Autolaw',
        description: 'Keep bills, liens, benefit payments, and their source documents in one running damages ledger for PI and workers’ comp matters.',
      },
    },
  },
  {
    id: 'demand-packages',
    name: 'Demand Packages',
    icon: 'demand',
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
    slug: 'demand-packages',
    page: {
      promise: 'Turn an approved case record into a demand your attorney still controls.',
      body: [
        'Demand Packages bring the chronology, damages ledger, supported case facts, and the firm’s own template into one controlled review flow.',
        'Each section stays reviewable before export, so the finished Word document reflects what the attorney approved rather than whatever the system first proposed.',
      ],
      steps: [
        { heading: 'Assemble the record', body: 'Bring approved chronology, damages, and case facts into the firm’s demand structure.' },
        { heading: 'Approve each section', body: 'Review the supported narrative and figures section by section.' },
        { heading: 'Export on approval', body: 'Create the Word package only after the attorney has confirmed what belongs in it.' },
      ],
      limits: [
        'It will not export a figure nobody at the firm approved.',
        'It will not replace the firm’s template with a generic voice.',
        'It will not make the settlement decision for the attorney or client.',
      ],
      related: ['medical-chronologies', 'damages-ledger', 'case-value'],
      meta: {
        title: 'Evidence-Backed Demand Packages With Attorney Review | Autolaw',
        description: 'Build a demand from the approved chronology, damages ledger, case facts, and your firm’s template, then export it to Word.',
      },
    },
  },
  {
    id: 'case-value',
    name: 'Case Value & Howell Analysis',
    icon: 'case-value',
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
    slug: 'case-value-and-howell-analysis',
    page: {
      promise: 'See the range, the Howell view, and the evidence behind the number.',
      body: [
        'Case Value & Howell Analysis gives the firm conservative, base, and aggressive views built from the same supported damages record instead of one unexplained number.',
        'Billed and paid amounts stay distinct, future care remains visible in the scenario, and the attorney can open the record behind the inputs before using the analysis.',
      ],
      steps: [
        { heading: 'Ground the inputs', body: 'Start with supported charges, payments, liens, and future-care entries from the case.' },
        { heading: 'Compare three views', body: 'Place conservative, base, and aggressive scenarios side by side.' },
        { heading: 'Review the Howell view', body: 'Inspect billed-versus-paid treatment and export the approved Howell summary.' },
      ],
      limits: [
        'It will not present a scenario as a promised outcome.',
        'It will not hide which evidence or assumption changed the range.',
      ],
      related: ['damages-ledger', 'demand-packages', 'negotiation'],
      meta: {
        title: 'Case Value and Howell Analysis for California PI | Autolaw',
        description: 'Compare three evidence-backed case-value scenarios, billed and paid Howell views, and future care without hiding the inputs.',
      },
    },
  },
  {
    id: 'negotiation',
    name: 'Negotiation Tracking',
    icon: 'negotiation',
    line: 'Demand sent, offers, counters, best offer, on one timeline.',
    practice: 'PI',
    phases: ['pre-lit'],
    availability: 'live',
    detail: [
      'Every move in the negotiation against one matter.',
      'The adjuster and carrier on the record with it.',
    ],
    output: 'On screen',
    slug: 'negotiation-tracking',
    page: {
      promise: 'Know every move, every counter, and the best offer still on the table.',
      body: [
        'Negotiation Tracking keeps the demand, offers, counters, adjuster, and carrier on one matter timeline so the current position never depends on the last person’s inbox.',
        'The firm can see how the negotiation moved and which offer remains the high-water mark while keeping the case record close at hand.',
      ],
      steps: [
        { heading: 'Record the demand', body: 'Place the sent demand and the people handling it at the start of the timeline.' },
        { heading: 'Add each move', body: 'Keep every offer and counter in order against the same matter.' },
        { heading: 'See the position', body: 'Show the current response and best offer without reconstructing the thread by hand.' },
      ],
      limits: [
        'It will not decide whether the firm should accept an offer.',
        'It will not convert an unrecorded conversation into a negotiation event.',
      ],
      related: ['demand-packages', 'case-value', 'case-management-summary'],
      meta: {
        title: 'Negotiation Tracking for Personal Injury Matters | Autolaw',
        description: 'Keep the demand, offers, counters, adjuster, carrier, and best offer together on one personal injury matter timeline.',
      },
    },
  },
  {
    id: 'case-management-summary',
    name: 'Case Management Summary',
    icon: 'case-summary',
    line: 'Claim info, both chronologies, treatment, providers, damages — one document.',
    practice: 'both',
    phases: ['litigation'],
    availability: 'live',
    detail: [
      'Pre-litigation and litigation chronologies in a single summary.',
      'Providers, bills, wage loss, costs advanced, and experts alongside them.',
    ],
    output: 'Word export',
    slug: 'case-management-summary',
    page: {
      promise: 'Walk into the next case conference with the whole matter in one document.',
      body: [
        'The Case Management Summary pulls claim information, both chronologies, treatment, providers, damages, wage loss, costs, and experts into a single attorney-reviewable document.',
        'It is a working map of the matter rather than another disconnected summary, with the supported record organized so the team can move from overview to issue without starting over.',
      ],
      steps: [
        { heading: 'Collect the approved case facts', body: 'Bring claim information, providers, damages, and matter details into one view.' },
        { heading: 'Join both timelines', body: 'Place pre-litigation and litigation chronology material in the same case narrative.' },
        { heading: 'Review and export', body: 'Confirm the assembled summary and export the Word document for the team.' },
      ],
      limits: [
        'It will not replace a missing case fact with a plausible one.',
        'It will not bury a disagreement simply to make the summary read more cleanly.',
      ],
      related: ['medical-chronologies', 'damages-ledger', 'conflicts'],
      meta: {
        title: 'Case Management Summaries From the Complete Record | Autolaw',
        description: 'Bring claim facts, chronologies, providers, treatment, damages, wage loss, costs, and experts into one Word case summary.',
      },
    },
  },
  {
    id: 'conflicts',
    name: 'Conflicting Records & Opinions',
    icon: 'conflicts',
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
    slug: 'conflicting-records-and-opinions',
    page: {
      promise: 'Find the contradiction before it becomes the other side’s strategy.',
      body: [
        'Conflicting Records & Opinions finds statements that cannot comfortably sit together and keeps both sources visible instead of forcing the file into a cleaner story than the evidence supports.',
        'Each side retains its author, date, page, and context, giving the attorney the material needed to resolve the conflict rather than a hidden machine choice.',
      ],
      steps: [
        { heading: 'Compare the record', body: 'Look across documents for claims that disagree on the same fact or medical issue.' },
        { heading: 'Hold both sources', body: 'Keep each position visible with its author, date, page, and surrounding context.' },
        { heading: 'Send it to review', body: 'Put the unresolved conflict in front of an attorney instead of selecting a winner.' },
      ],
      limits: [
        'It will not pick a winner between two conflicting records.',
        'It will not hide the losing-looking source from the attorney’s view.',
      ],
      related: ['ask-al', 'qme-ame', 'case-management-summary'],
      meta: {
        title: 'Conflicting Medical Records and Opinions | Autolaw',
        description: 'Surface records and medical opinions that disagree while preserving both dates, authors, pages, and sources for attorney review.',
      },
    },
  },
  {
    id: 'deadlines',
    name: 'Deadlines & Statute of Limitations',
    icon: 'deadlines',
    line: 'What is running, and what closes next.',
    practice: 'both',
    phases: ['litigation'],
    availability: 'live',
    detail: [
      'The limitations estimate from the date of loss and the jurisdiction.',
      'Said plainly when it cannot be determined, rather than guessed.',
    ],
    output: 'On screen',
    slug: 'deadlines-and-statute-of-limitations',
    page: {
      promise: 'See what is running, what closes next, and where the record is too thin to guess.',
      body: [
        'Deadlines & Statute of Limitations puts the dates that can close a claim into a visible case view, starting from the supported date of loss and jurisdiction.',
        'When the file does not contain enough to determine a limitation estimate, the system says so plainly and leaves the decision with the firm instead of manufacturing certainty.',
      ],
      steps: [
        { heading: 'Confirm the inputs', body: 'Start with the date of loss, jurisdiction, and other facts the firm has approved.' },
        { heading: 'Show what is running', body: 'Calculate the supported estimate and order the matter’s next deadlines.' },
        { heading: 'Expose uncertainty', body: 'Flag an estimate that cannot be determined from the approved record.' },
      ],
      limits: [
        'It will not guess a limitations date when the required facts are missing.',
        'It will not make the attorney’s calendaring or legal determination for the firm.',
      ],
      related: ['missing-records', 'ask-al', 'case-management-summary'],
      meta: {
        title: 'Deadlines and Statute of Limitations Visibility | Autolaw',
        description: 'See supported limitation estimates and upcoming case deadlines while keeping missing inputs and unresolved uncertainty visible.',
      },
    },
  },
  {
    id: 'illustrations',
    name: 'Accident & Injury Illustrations',
    icon: 'illustrations',
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
    slug: 'accident-and-injury-illustrations',
    page: {
      promise: 'Early-access pilot: our team builds an illustration from supported case evidence, with your attorney in control.',
      body: [
        'Accident & Injury Illustrations is available through a hands-on pilot: our team runs the workflow with your firm on your case, from sufficiency review through attorney approval.',
        'Every scene is bound to the evidence behind it. The system re-inspects a finished render for failures such as reversed impact direction or an over-claimed spinal level, and a failed scene is parked for attorney review rather than quietly accepted.',
      ],
      steps: [
        { heading: 'Prove the record is sufficient', body: 'Refuse to start when the available evidence is too thin to support the scene.' },
        { heading: 'Bind the scene to evidence', body: 'Carry the supported collision, injury, treatment, or limitation facts into the scene contract.' },
        { heading: 'Re-inspect and approve', body: 'Check the render again, park failures, and lock the exhibit only after attorney approval.' },
      ],
      limits: [
        'It will not depict a fact the record does not state.',
        'It will not lock an exhibit without attorney approval.',
        'It will not pass a failed re-inspection through as finished work.',
      ],
      related: ['conflicts', 'significance-brief', 'demand-packages'],
      meta: {
        title: 'Accident and Injury Illustrations — Early Access | Autolaw',
        description: 'Pilot evidence-bound accident and injury illustrations with sufficiency checks, render re-inspection, attorney review, and locked exhibits.',
      },
    },
  },
  {
    id: 'discovery-responses',
    name: 'Discovery Responses',
    icon: 'discovery',
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
    icon: 'deposition',
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

export const FEATURE_BY_ID = new Map(FEATURES.map((feature) => [feature.id, feature]));

export const ROUTED_FEATURES = FEATURES.filter(
  (feature): feature is Feature & { slug: string; page: FeaturePage } =>
    Boolean(feature.slug && feature.page),
);
