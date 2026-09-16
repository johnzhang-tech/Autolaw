import { describe, it, expect } from 'vitest';
import { FEATURES, PLATFORM, PHASES, type Feature } from '../product';

const inPhase = (p: 'pre-lit' | 'litigation') => FEATURES.filter((f) => f.phases.includes(p));

describe('product data', () => {
  it('gives every feature a sales line and something to expand into', () => {
    FEATURES.forEach((f: Feature) => {
      expect(f.name.length).toBeGreaterThan(0);
      expect(f.line.length).toBeGreaterThan(0);
      expect(f.detail.length).toBeGreaterThanOrEqual(2);
      expect(f.phases.length).toBeGreaterThan(0);
    });
  });

  it('uses unique ids', () => {
    expect(new Set(FEATURES.map((f) => f.id)).size).toBe(FEATURES.length);
  });

  it('fills both phase columns', () => {
    expect(inPhase('pre-lit').length).toBeGreaterThanOrEqual(8);
    expect(inPhase('litigation').length).toBeGreaterThanOrEqual(5);
  });

  it('promises no output for a feature that does not exist yet', () => {
    const comingNext = FEATURES.filter((f) => f.availability === 'coming-next');
    expect(comingNext.length).toBeGreaterThan(0);
    comingNext.forEach((f) => expect(f.output).toBe('Not yet available'));
  });

  it('keeps every phase heading and its line', () => {
    expect(PHASES['pre-lit'].heading).toBe('Pre-Litigation');
    expect(PHASES['litigation'].heading).toBe('Litigation');
    Object.values(PHASES).forEach((p) => expect(p.line.length).toBeGreaterThan(0));
  });

  it('names the cross-phase strip items', () => {
    expect(PLATFORM.length).toBeGreaterThanOrEqual(3);
    PLATFORM.forEach((p) => expect(p.line.length).toBeGreaterThan(0));
  });

  it('claims no accuracy percentage anywhere in the copy', () => {
    const all = FEATURES.flatMap((f) => [f.line, f.wcLine ?? '', f.output, ...f.detail])
      .concat(PLATFORM.map((p) => p.line))
      .join(' ');
    expect(all).not.toMatch(/\d+\s*%/);
  });

  it('never puts a WC-specific line on a PI-only feature', () => {
    expect(FEATURES.filter((f) => f.wcLine).every((f) => f.practice !== 'PI')).toBe(true);
  });
});
