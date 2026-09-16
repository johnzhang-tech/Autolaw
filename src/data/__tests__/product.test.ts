import { describe, it, expect } from 'vitest';
import {
  FEATURE_BY_ID,
  FEATURES,
  PLATFORM,
  PHASES,
  ROUTED_FEATURES,
  type Feature,
} from '../product';

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

  it('gives exactly the thirteen publishable features complete page data', () => {
    expect(ROUTED_FEATURES).toHaveLength(13);
    expect(ROUTED_FEATURES.map((f) => f.slug)).toEqual([
      'ask-al',
      'medical-chronologies',
      'medical-significance-brief',
      'missing-records-and-gaps',
      'qme-ame-deep-analysis',
      'damages-ledger',
      'demand-packages',
      'case-value-and-howell-analysis',
      'negotiation-tracking',
      'case-management-summary',
      'conflicting-records-and-opinions',
      'deadlines-and-statute-of-limitations',
      'accident-and-injury-illustrations',
    ]);

    ROUTED_FEATURES.forEach((feature) => {
      expect(feature.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(feature.page.promise.length).toBeGreaterThan(20);
      expect(feature.page.body.length).toBeGreaterThanOrEqual(2);
      expect(feature.page.steps).toHaveLength(3);
      expect(feature.page.limits.length).toBeGreaterThanOrEqual(2);
      expect(feature.page.related.length).toBeGreaterThanOrEqual(2);
      expect(feature.page.meta.title).toMatch(/\| Autolaw$/);
      expect(feature.page.meta.description.length).toBeGreaterThan(50);
    });
  });

  it('never publishes a destination for a coming-next feature', () => {
    const comingNext = FEATURES.filter((f) => f.availability === 'coming-next');
    expect(comingNext.map((f) => f.name)).toEqual(['Discovery Responses', 'Deposition Review']);
    comingNext.forEach((feature) => {
      expect(feature.slug).toBeUndefined();
      expect(feature.page).toBeUndefined();
    });
  });

  it('keeps every related feature id resolvable and routed', () => {
    expect(FEATURE_BY_ID.size).toBe(FEATURES.length);
    ROUTED_FEATURES.forEach((feature) => {
      feature.page.related.forEach((relatedId) => {
        const related = FEATURE_BY_ID.get(relatedId);
        expect(related, `${feature.id} relates to missing ${relatedId}`).toBeDefined();
        expect(related?.slug, `${feature.id} relates to unrouted ${relatedId}`).toBeTruthy();
      });
    });
  });

  it('states the illustration pilot in the page promise and publishes no percentage', () => {
    const illustrations = FEATURE_BY_ID.get('illustrations');
    expect(illustrations?.availability).toBe('early-access');
    expect(illustrations?.page?.promise).toMatch(/pilot/i);

    const pageCopy = ROUTED_FEATURES.map((feature) => JSON.stringify(feature.page)).join(' ');
    expect(pageCopy).not.toMatch(/\d+(?:\.\d+)?\s*%/);
  });
});
