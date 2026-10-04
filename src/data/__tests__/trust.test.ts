import { describe, it, expect } from 'vitest';
import {
  AI_CARDS,
  AI_QUESTIONS,
  AUDIT_CARDS,
  PRIVACY_CARDS,
  SUBPROCESSORS,
  SUBPROCESSOR_CHANGES,
  TRUST_LAST_VERIFIED,
} from '../trust';

/*
 * Every public trust statement names the evidence that proves it. The ids point into
 * case-app's internal evidence record (docs/trust/evidence-annex.md); case-app's
 * `python3 docs/trust/check.py --site <this repo>` checks each one there. These tests
 * check what can be checked from this repo alone.
 */
const CLAIM_ID = /^(?:OV|DF|TI|EN|RT|DL|MT|IR|AC)-\d+$|^SP-table$/;
// Claims that may appear only in the NDA Trust Pack (distribution memo, section 6).
const NDA_ONLY_CLAIMS = ['TI-7', 'TI-8', 'TI-9', 'TI-11', 'EN-6', 'IR-3', 'DL-2', 'BC-1', 'VM-1', 'LG-1', 'SD-1'];
const NDA_ONLY_PHRASES = [
  'file name', 'by hand', 'browser’s storage', "browser's storage", 'not yet revoked',
  'without an additional layer', 'direct access to the production', 'local copy',
  'older store', 'single zone', 'sign-in secrets',
];
const QUARTER = /^Q[1-4] 20\d\d$/;

const cards = [...PRIVACY_CARDS, ...AI_CARDS, ...AUDIT_CARDS];
const answers = AI_QUESTIONS.flatMap((q) => q.answers);
const allClaims = [
  ...cards.flatMap((c) => c.claims),
  ...answers.flatMap((a) => a.claims),
  ...SUBPROCESSORS.flatMap((s) => s.claims),
];
const allText = [
  ...cards.flatMap((c) => [c.title, c.body, ...(c.commitments ?? []).map((x) => x.text)]),
  ...AI_QUESTIONS.flatMap((q) => [q.question, ...q.answers.map((a) => a.text), ...(q.commitments ?? []).map((x) => x.text)]),
  ...SUBPROCESSORS.flatMap((s) => [s.vendor, s.purpose, s.receives, s.when, s.region, s.training]),
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
    ];
    expect(commitments.length).toBeGreaterThan(0);
    commitments.forEach((c) => expect(c.quarter, c.text).toMatch(QUARTER));
  });

  it('answers every AI question with a statement or a commitment', () => {
    AI_QUESTIONS.forEach((q) => expect(q.answers.length + (q.commitments ?? []).length, q.question).toBeGreaterThan(0));
  });
});
