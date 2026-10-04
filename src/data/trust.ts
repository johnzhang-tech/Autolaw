/**
 * The public trust tier, as data.
 *
 * Every statement here is true in case-app today or is a dated commitment, and each card,
 * answer and vendor row names the claim ids that prove it. The ids point into case-app's
 * internal evidence record, docs/trust/evidence-annex.md, which is not public. They are
 * kept here, never rendered, so that `python3 docs/trust/check.py --site <this repo>` in
 * case-app can check every statement against that record before the site deploys.
 *
 * Wording source: case-app docs/trust/trust-center.html, subprocessors.html and
 * ai-data-use.html, reviewed 2026-10-03. Change the evidence first, then this file.
 */

export const TRUST_LAST_VERIFIED = '3 October 2026';

export type ClaimId = string;

export interface Commitment {
  quarter: string;
  text: string;
}

export interface TrustCard {
  title: string;
  body: string;
  claims: ReadonlyArray<ClaimId>;
  commitments?: ReadonlyArray<Commitment>;
}

export const PRIVACY_CARDS: ReadonlyArray<TrustCard> = [
  {
    title: 'Documents can come from where they already are',
    body: 'Autolaw connects to Dropbox, so a matter can be built from the case documents your firm already stores there. Disconnecting Dropbox removes the connection and asks Dropbox to revoke Autolaw’s access.',
    claims: ['DF-1', 'DL-1'],
  },
  {
    title: 'One firm, one boundary',
    body: 'Each firm is a separate tenant. In our application database, every table holding case data carries the firm’s identifier or is tied to a record that does. Search indexes are built per case, so no index holds two firms’ documents. Before a document is shown, our servers check that its case belongs to your firm, rather than relying on the browser, which any visitor can bypass.',
    claims: ['TI-1', 'TI-3', 'TI-5'],
  },
  {
    title: 'Document access is recorded',
    body: 'When someone opens a document or one of the main record views, it is recorded under your firm’s account along with who did it. Your firm can ask us for that log.',
    claims: ['IR-2'],
  },
  {
    title: 'Encryption',
    body: 'Traffic between your browser, our application, our database, our case graph and our AI providers is encrypted with TLS. The database and file storage are encrypted at rest with AES-256, using Google-managed keys. Customer-managed keys are not offered.',
    claims: ['EN-1', 'EN-2'],
  },
  {
    title: 'Retention and deletion',
    body: 'Case data is kept while your account is active. Archiving a case hides it and keeps its data so it can be restored, and deleted files can be recovered for seven days. When your firm leaves, we delete its data on request.',
    claims: ['RT-1', 'RT-2', 'RT-3'],
    commitments: [
      { quarter: 'Q4 2026', text: 'A published retention schedule for each kind of data.' },
      { quarter: 'Q1 2027', text: 'Automated offboarding that sends your firm a verification report.' },
    ],
  },
  {
    title: 'Signing in',
    body: 'Your staff sign in with a password, or with a Google or Microsoft account. Passwords are stored as bcrypt hashes, and firm administrators manage users and firm settings.',
    claims: ['AC-3', 'TI-10', 'AC-2'],
    commitments: [
      { quarter: 'Q1 2027', text: 'Multi-factor authentication.' },
      { quarter: 'Q2 2027', text: 'Single sign-on with your firm’s identity provider (SAML or OIDC).' },
    ],
  },
];

export const AI_CARDS: ReadonlyArray<TrustCard> = [
  {
    title: 'Google Gemini reads your documents',
    body: 'Document text, page images and intake recordings go to Google Gemini on its paid API tier. Under those terms Google does not use prompts or responses to improve its products; it keeps them for a limited period to detect abuse.',
    claims: ['DF-3', 'MT-2'],
  },
  {
    title: 'Anthropic and Replicate see only a case brief',
    body: 'Anthropic’s Claude receives no document text in our current configuration. If your firm uses the optional media feature, a summary brief of the case goes to Claude to write a storyboard and to Replicate to render it. Anthropic does not train on that data and deletes it within 30 days by default. Replicate’s terms include no explicit promise not to train, so we make none for it.',
    claims: ['DF-8', 'DF-7', 'MT-3', 'MT-5'],
  },
  {
    title: 'A demand package needs your approval to leave',
    body: 'Demand drafting cites the source documents, and a demand package cannot be exported until someone at your firm marks it approved.',
    claims: ['MT-4'],
  },
];

export const AUDIT_CARDS: ReadonlyArray<TrustCard> = [
  {
    title: 'SOC 2',
    body: 'Autolaw is preparing for its SOC 2 audit; a Type I report is planned for Q2 2027. Until then, we complete your security questionnaire directly and send the full Trust Pack under a confidentiality agreement.',
    claims: ['OV-2'],
  },
  {
    title: 'HIPAA',
    body: 'There is no certifying body for HIPAA and no audit that issues a HIPAA certificate, so no vendor can hold one. What a firm can be given is a business associate agreement. Autolaw will offer one once its AI processing moves to Google Cloud’s HIPAA-eligible platform, planned for Q2 2027. That is a different kind of thing from the SOC 2 report above.',
    claims: ['OV-1'],
  },
];

export const SECTION_INTROS: Readonly<Record<'privacy' | 'model', { text: string; claims: ReadonlyArray<ClaimId> }>> = {
  privacy: {
    text: 'The answer is in the controls: each firm’s data is kept apart, opening a document is recorded, and encryption and retention are stated exactly.',
    claims: ['TI-1', 'IR-2', 'EN-1', 'RT-1'],
  },
  model: {
    text: 'No. Autolaw trains no models on your data, and the AI providers that read your documents work under paid terms that do not allow them to train on it.',
    claims: ['MT-1', 'MT-2', 'MT-3'],
  },
};

export const REVIEWER_COMMITMENTS: ReadonlyArray<Commitment> = [
  { quarter: 'Q4 2026', text: 'A written incident-response plan, with notice to affected firms within 72 hours of confirming a breach.' },
];

export interface Subprocessor {
  vendor: string;
  purpose: string;
  receives: string;
  when: string;
  region: string;
  training: string;
  claims: ReadonlyArray<ClaimId>;
}

const NOT_AI = 'Not an AI model service';

export const SUBPROCESSORS: ReadonlyArray<Subprocessor> = [
  { vendor: 'Google Cloud', purpose: 'Hosts the application, file storage, database and secrets', receives: 'All firm data', when: 'Always', region: 'US', training: NOT_AI, claims: ['SP-table'] },
  { vendor: 'Google Gemini API (paid tier)', purpose: 'Extraction, transcription, search index, drafting, storyboard images', receives: 'Document text, page images, intake recordings', when: 'Always', region: 'Not region-pinned', training: 'Not used to improve Google’s products under paid terms; kept for a limited period to detect abuse', claims: ['SP-table', 'MT-2'] },
  { vendor: 'Anthropic', purpose: 'Storyboard writing', receives: 'Case briefs', when: 'Only with the media feature', region: 'Not stated by Anthropic', training: 'Not used for training; deleted within 30 days by default', claims: ['SP-table', 'MT-3', 'DF-8'] },
  { vendor: 'Replicate (runs the MiniMax Hailuo video model)', purpose: 'Storyboard video rendering', receives: 'Prompts built from a case brief', when: 'Only with the media feature', region: 'Not stated', training: 'No explicit no-training term, so we make no claim', claims: ['SP-table', 'MT-5'] },
  { vendor: 'Neo4j (managed host)', purpose: 'Case graph', receives: 'Facts and relationships derived from documents', when: 'Always', region: 'US (being confirmed)', training: NOT_AI, claims: ['SP-table'] },
  { vendor: 'Upstash', purpose: 'Background job queue', receives: 'Internal identifiers and medical terms queued for lookup', when: 'Always', region: 'US (being confirmed)', training: NOT_AI, claims: ['SP-table'] },
  { vendor: 'Resend', purpose: 'Transactional email', receives: 'Email addresses and notification text, kept 30 days on its standard plans', when: 'Always', region: 'US', training: NOT_AI, claims: ['SP-table', 'RT-5'] },
  { vendor: 'Stripe', purpose: 'Billing', receives: 'Billing identity; no case data', when: 'When your firm pays through Autolaw', region: 'US', training: NOT_AI, claims: ['SP-table'] },
  { vendor: 'Langfuse', purpose: 'AI usage metering', receives: 'Model names, token counts, cost and internal identifiers; no prompt or document text', when: 'Always', region: 'US (Oregon)', training: NOT_AI, claims: ['SP-table', 'DF-5'] },
  { vendor: 'Dropbox', purpose: 'File sync', receives: 'The folders you select', when: 'Only when your firm connects it', region: 'Your Dropbox account', training: NOT_AI, claims: ['SP-table'] },
];

export const SUBPROCESSOR_NOTICE: Commitment = {
  quarter: 'Q4 2026',
  text: '30 days’ advance notice before adding a vendor that processes document content.',
};

export const SUBPROCESSOR_CHANGES: ReadonlyArray<{ version: string; date: string; change: string }> = [
  { version: '1.0', date: '3 October 2026', change: 'First published list.' },
];

export interface AiAnswer {
  text: string;
  claims: ReadonlyArray<ClaimId>;
}

export interface AiQuestion {
  id: string;
  question: string;
  answers: ReadonlyArray<AiAnswer>;
  commitments?: ReadonlyArray<Commitment>;
}

export const AI_QUESTIONS: ReadonlyArray<AiQuestion> = [
  {
    id: 'models',
    question: 'Which AI models see our files?',
    answers: [
      { text: 'Google Gemini, on the paid API tier, receives document text, page images and intake recordings for extraction, transcription, search and drafting.', claims: ['DF-3'] },
      { text: 'Document text is indexed for search in Gemini File Search stores created for each case and each intake session.', claims: ['DF-4'] },
      { text: 'Anthropic’s Claude receives no document text in our current configuration. If your firm uses the optional media feature, a summary brief of the case, not the raw documents, is sent to Claude to write a storyboard, and to Gemini image models and Replicate to render it.', claims: ['DF-8', 'DF-7'] },
      { text: 'OpenAI is not used.', claims: ['DF-6'] },
    ],
  },
  {
    id: 'training',
    question: 'Do the models learn from our files?',
    answers: [
      { text: 'Autolaw does not train machine-learning models on your data.', claims: ['MT-1'] },
      { text: 'Google Gemini, paid tier: Google does not use prompts or responses to improve its products.', claims: ['MT-2'] },
      { text: 'Anthropic: inputs and outputs are not used to train Anthropic’s models.', claims: ['MT-3'] },
      { text: 'Replicate’s terms limit its use of inputs to running the service and include no explicit no-training commitment, so we make no training claim for Replicate. It receives only prompts built from a case brief.', claims: ['MT-5'] },
    ],
  },
  {
    id: 'retention',
    question: 'How long do the AI providers keep copies?',
    answers: [
      { text: 'Google retains paid-tier API prompts and responses for a limited period to detect abuse.', claims: ['MT-2'] },
      { text: 'Anthropic deletes API inputs and outputs within 30 days by default.', claims: ['MT-3'] },
      { text: 'Text indexed for search stays in its store until it is deleted. Autolaw deletes a firm’s data on request.', claims: ['DF-4'] },
    ],
    commitments: [
      { quarter: 'Q1 2027', text: 'Automated offboarding that sends your firm a verification report.' },
      { quarter: 'Q2 2027', text: 'Zero-data-retention terms with AI processors where offered.' },
    ],
  },
  {
    id: 'region',
    question: 'Where does the AI processing happen?',
    answers: [
      { text: 'The Gemini API does not pin a processing region: Google states that API data may be stored transiently or cached in any country where it operates. Anthropic does not state a region. Autolaw’s own application, database and file storage run on Google Cloud in the United States.', claims: ['SP-table', 'DF-2'] },
    ],
    commitments: [
      { quarter: 'Q2 2027', text: 'AI processing on Google Cloud’s HIPAA-eligible platform, with a fixed region.' },
    ],
  },
  {
    id: 'other-firms',
    question: 'Can another firm’s documents surface in our answers?',
    answers: [
      { text: 'Search stores are created per case and per intake session, so no store holds two firms’ documents. Retrieval also checks each result’s case and drops any result from a different case.', claims: ['TI-3'] },
    ],
  },
  {
    id: 'control',
    question: 'Where does a lawyer stay in control?',
    answers: [
      { text: 'Demand drafting cites the source documents, and a demand package cannot be exported until someone at your firm marks it approved.', claims: ['MT-4'] },
    ],
  },
  {
    id: 'metering',
    question: 'What does Autolaw record about AI use?',
    answers: [
      { text: 'Our AI-usage metering receives model names, token counts, cost and internal identifiers. It never receives prompt, response or document text.', claims: ['DF-5'] },
    ],
  },
  {
    id: 'next',
    question: 'What is planned next?',
    answers: [],
    commitments: [
      SUBPROCESSOR_NOTICE,
      { quarter: 'Q2 2027', text: 'A business associate agreement or contractual no-training terms on file with every AI processor.' },
      { quarter: 'Q2 2027', text: 'Zero-data-retention terms with AI processors where offered.' },
    ],
  },
];
