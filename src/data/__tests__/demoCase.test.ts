import { describe, it, expect } from 'vitest';
import {
  ARRIVALS, DOCUMENT_COUNT, CASE_SUMMARY, CHRONOLOGY, CONFLICT_COUNTERPART,
  ASK_AL_PREVIEW, CITATION_KINDS, REVIEW_ITEM, OUTPUT_ROWS, EXPORT_RULE,
  ASK_AL_QA, PI_PANEL, WC_PANEL, BODY_REGIONS, PRACTICE_CLOSING,
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

describe('sections data', () => {
  it('asks three questions: two grounded, one refused', () => {
    expect(ASK_AL_QA).toHaveLength(3);
    expect(ASK_AL_QA.filter((q) => q.refusal)).toHaveLength(1);
    for (const q of ASK_AL_QA) {
      if (q.refusal) {
        expect(q.citations).toHaveLength(0);
        expect(q.answer.every((s) => s.cite === null)).toBe(true);
        expect(q.answer.map((s) => s.text).join(' ')).toMatch(/not in my context/i);
      } else {
        const cited = q.answer.filter((s) => s.cite !== null).map((s) => s.cite);
        expect(cited).toEqual(q.citations.map((c) => c.n));
        q.citations.forEach((c) => {
          expect(CITATION_KINDS).toContain(c.kind);
          expect(c.excerpt.length).toBeGreaterThan(20);
        });
      }
    }
  });

  it('names the PI and WC tabs the application uses', () => {
    expect(PI_PANEL.tabs.map((t) => t.label)).toEqual(['Medical', 'Liability & Incident', 'Damages & Demand']);
    expect(WC_PANEL.tabs.map((t) => t.label)).toEqual(['Summary', 'Injury & Work Status', 'Benefits & Wages', 'Medical-Legal & Disputes']);
  });

  it('has eight body regions with unique keys, four accepted-or-disputed and four with no records', () => {
    expect(BODY_REGIONS).toHaveLength(8);
    expect(new Set(BODY_REGIONS.map((r) => r.key)).size).toBe(8);
    expect(BODY_REGIONS.filter((r) => r.rows.some((row) => /no documents reference/i.test(row.value)))).toHaveLength(4);
  });

  it('closes differently for each practice', () => {
    expect(PRACTICE_CLOSING.PI.heading).not.toBe(PRACTICE_CLOSING.WC.heading);
    expect(PRACTICE_CLOSING.PI.href).toBe('/schedule-call/?practice=pi');
    expect(PRACTICE_CLOSING.WC.href).toBe('/schedule-call/?practice=wc');
  });
});
