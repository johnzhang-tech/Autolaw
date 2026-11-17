import { afterEach, describe, it, expect, vi } from 'vitest';
import {
  AI_CARDS,
  AI_QUESTIONS,
  AUDIT_CARDS,
  PRIVACY_CARDS,
  REVIEWER_COMMITMENTS,
  SECTION_INTROS,
  SUBPROCESSORS,
  SUBPROCESSOR_CHANGES,
  SUBPROCESSOR_NOTES,
  TRUST_LAST_VERIFIED,
} from '../trust';
import { NDA_ONLY_CLAIMS, NDA_ONLY_PHRASES } from '../../pages/security/__tests__/trustGuard';
import { CERTIFICATIONS } from '../../config';

/*
 * Every public trust statement names the evidence that proves it. The ids point into
 * case-app's internal evidence record (docs/trust/evidence-annex.md); case-app's
 * `python3 docs/trust/check.py --site <this repo>` checks each one there. These tests
 * check what can be checked from this repo alone.
 */
const CLAIM_ID = /^(?:OV|DF|TI|EN|RT|DL|MT|IR|AC)-\d+$|^SP-table$/;
const QUARTER = /^Q[1-4] 20\d\d$/;

const cards = [...PRIVACY_CARDS, ...AI_CARDS, ...AUDIT_CARDS];
const answers = [...AI_QUESTIONS.flatMap((q) => q.answers), ...SUBPROCESSOR_NOTES];
const allClaims = [
  ...cards.flatMap((c) => c.claims),
  ...answers.flatMap((a) => a.claims),
  ...SUBPROCESSORS.flatMap((s) => s.claims),
  ...CERTIFICATIONS.flatMap((c) => c.claims),
  ...Object.values(SECTION_INTROS).flatMap((i) => i.claims),
];
const allText = [
  ...cards.flatMap((c) => [c.title, c.body, ...(c.commitments ?? []).map((x) => x.text)]),
  ...AI_QUESTIONS.flatMap((q) => [q.question, ...q.answers.map((a) => a.text), ...(q.commitments ?? []).map((x) => x.text)]),
  ...SUBPROCESSORS.flatMap((s) => [s.vendor, s.purpose, s.receives, s.when, s.region, s.training]),
  ...Object.values(SECTION_INTROS).map((i) => i.text),
  ...REVIEWER_COMMITMENTS.map((x) => x.text),
].join('\n');

describe('trust data', () => {
  it('has content to check', () => {
    expect(PRIVACY_CARDS.length).toBe(6);
    expect(AI_CARDS.length).toBe(3);
    expect(AUDIT_CARDS.length).toBe(2);
    expect(SUBPROCESSORS.length).toBe(10);
    expect(AI_QUESTIONS.length).toBe(8);
    expect(SUBPROCESSOR_CHANGES.length).toBeGreaterThan(0);
    expect(TRUST_LAST_VERIFIED).toMatch(/^\d{1,2} [A-Z][a-z]+ 20\d\d$/);
  });

  it('names the evidence behind every card, answer and vendor row', () => {
    cards.forEach((c) => expect(c.claims.length, c.title).toBeGreaterThan(0));
    answers.forEach((a) => expect(a.claims.length, a.text).toBeGreaterThan(0));
    SUBPROCESSORS.forEach((s) => expect(s.claims, s.vendor).toContain('SP-table'));
    allClaims.forEach((id) => expect(id).toMatch(CLAIM_ID));
  });

  it('carries no claim that belongs only in the NDA Trust Pack', () => {
    expect(allClaims.filter((id) => NDA_ONLY_CLAIMS.includes(id))).toEqual([]);
  });

  it('carries no gap detail that belongs only in the NDA Trust Pack', () => {
    expect(NDA_ONLY_PHRASES.filter((p) => allText.toLowerCase().includes(p.toLowerCase()))).toEqual([]);
  });

  it('dates every commitment to a quarter', () => {
    const commitments = [
      ...cards.flatMap((c) => c.commitments ?? []),
      ...AI_QUESTIONS.flatMap((q) => q.commitments ?? []),
      ...REVIEWER_COMMITMENTS,
    ];
    expect(commitments.length).toBeGreaterThan(0);
    commitments.forEach((c) => expect(c.quarter, c.text).toMatch(QUARTER));
  });

  it('answers every AI question with a statement or a commitment', () => {
    AI_QUESTIONS.forEach((q) => expect(q.answers.length + (q.commitments ?? []).length, q.question).toBeGreaterThan(0));
  });
});

/*
 * The visit counter on autolaw.ai is listed exactly when it runs.
 *
 * Both switch on the same build-time website id, so the Trust Center cannot list a vendor
 * that receives nothing, or omit one that receives every page view. Each state is
 * rebuilt from a fresh import with the id stubbed, since the list is fixed when the
 * module loads.
 */
describe('website analytics on the subprocessor list', () => {
  const TEST_ID = '0b5e2f8c-1d3a-4c6e-9f70-2a4b6c8d0e1f';
  async function trustWith(id: string) {
    vi.stubEnv('VITE_UMAMI_WEBSITE_ID', id);
    vi.resetModules();
    return import('../trust');
  }
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('is absent while no website id is set', async () => {
    const t = await trustWith('');
    expect(t.SUBPROCESSORS.map((s) => s.vendor).join(' ')).not.toMatch(/umami/i);
    expect(t.SUBPROCESSOR_CHANGES.map((c) => c.version)).toEqual(['1.0']);
  });

  it('is listed, with a new version of the list, once a website id is set', async () => {
    const t = await trustWith(TEST_ID);
    const row = t.SUBPROCESSORS.find((s) => /umami/i.test(s.vendor));
    expect(row).toBeDefined();
    expect(t.SUBPROCESSORS).toHaveLength(11);
    expect(row!.claims).toContain('SP-table');
    expect(t.SUBPROCESSOR_CHANGES.at(-1)?.change).toMatch(/umami/i);
    expect(t.SUBPROCESSOR_CHANGES.map((c) => c.version)).toEqual(['1.0', '1.1']);
  });

  /*
   * What a firm reading the row needs to be able to rely on: it is about the website, not
   * the application; page addresses go without their query; and nothing identifies them.
   */
  it('says what it receives and what it does not', async () => {
    const { SUBPROCESSORS } = await trustWith(TEST_ID);
    const row = SUBPROCESSORS.find((s) => /umami/i.test(s.vendor))!;
    expect(row.when).toMatch(/autolaw\.ai/);
    expect(row.when).toMatch(/never .*application/i);
    expect(row.receives).toMatch(/without its query/i);
    expect(row.receives).toMatch(/referring site/i);
    expect(row.receives).toMatch(/country/i);
    expect(row.receives).toMatch(/IP address/i);
    expect(row.receives).toMatch(/no cookies?/i);
    expect(row.receives).toMatch(/no names/i);
  });
});
