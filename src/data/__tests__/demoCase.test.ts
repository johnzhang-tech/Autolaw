import { describe, it, expect } from 'vitest';
import {
  ARRIVALS, DOCUMENT_COUNT, CASE_SUMMARY, CHRONOLOGY, CONFLICT_COUNTERPART,
  ASK_AL_PREVIEW, CITATION_KINDS, REVIEW_ITEM, OUTPUT_ROWS, EXPORT_RULE,
} from '../demoCase';

describe('demo case', () => {
  it('arrivals add up to the document count the summary states', () => {
    expect(ARRIVALS.reduce((n, g) => n + g.count, 0)).toBe(DOCUMENT_COUNT);
    expect(CASE_SUMMARY.meta).toContain(String(DOCUMENT_COUNT));
  });

  it('attaches the QME counterpart to the modified-duty event, and nowhere else', () => {
    const withCounterpart = CHRONOLOGY.filter((e) => e.counterpart);
    expect(withCounterpart).toHaveLength(1);
    expect(withCounterpart[0].title).toMatch(/modified duty/i);
    expect(withCounterpart[0].counterpart).toBe(CONFLICT_COUNTERPART);
  });

  it('cites the Ask AL preview only with kinds the product has', () => {
    ASK_AL_PREVIEW.chips.forEach((chip) => expect(CITATION_KINDS).toContain(chip.kind));
    const cited = ASK_AL_PREVIEW.answer.filter((s) => s.cite !== null).map((s) => s.cite);
    expect(cited).toEqual(ASK_AL_PREVIEW.chips.map((c) => c.n));
  });

  it('keeps the review item, output rows and export rule to what the product shows', () => {
    expect(REVIEW_ITEM.status).toBe('Needs review');
    expect(OUTPUT_ROWS.map((r) => r.label)).toEqual(['Source-linked chronology', 'Missing evidence', 'Claim readiness']);
    expect(EXPORT_RULE).toBe('A human-approved event is required before exporting.');
  });
});
