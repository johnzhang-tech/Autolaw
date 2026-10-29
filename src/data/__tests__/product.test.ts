import { describe, it, expect } from 'vitest';
import {
  FEATURE_BY_ID,
  PLATFORM_ADDS,
  REPORTS_TIER_FEATURE_IDS,
  FEATURES,
  ORDERABLE_REPORTS,
  PLATFORM,
  PHASES,
  REPORT_PRODUCTS,
  ROUTED_FEATURES,
  resolveReport,
  type Feature,
} from '../product';

const inPhase = (p: 'pre-lit' | 'litigation') => FEATURES.filter((f) => f.phases.includes(p));

describe('product data', () => {
  it('gives every feature a sales line and something to expand into', () => {
    FEATURES.forEach((f: Feature) => {
      expect(f.name.length).toBeGreaterThan(0);
      expect(f.line.length).toBeGreaterThan(0);
      expect('icon' in f, `${f.name} has no product icon`).toBe(true);
      expect(f.detail.length).toBeGreaterThanOrEqual(2);
      expect(f.phases.length).toBeGreaterThan(0);
    });
  });

  it('publishes Intake as the first live pre-litigation destination', () => {
    const intake = FEATURE_BY_ID.get('intake');

    expect(intake).toMatchObject({
      name: 'Intake',
      availability: 'live',
      phases: ['pre-lit'],
      slug: 'intake',
    });
    expect(inPhase('pre-lit')[0]?.id).toBe('intake');
    expect(intake?.page).toBeDefined();
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
    expect(PHASES['pre-lit'].line).toBe('Build stronger cases—with insight and speed.');
    expect(PHASES['litigation'].heading).toBe('Litigation');
    expect(PHASES['litigation'].line).toBe('Win with deeper preparation and faster response.');
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

  it('gives exactly the fourteen publishable features complete page data', () => {
    expect(ROUTED_FEATURES).toHaveLength(14);
    expect(ROUTED_FEATURES.map((f) => f.slug)).toEqual([
      'intake',
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

/*
 * The catalog is a narrower claim than the feature grid, and a more expensive one to get
 * wrong.
 *
 * A feature being `live` means a firm with access can reach it. A report being in this
 * catalog means something stronger: that a firm can order it per case and be billed for
 * it, which is true only of the types case-app actually launches — `chronology` and
 * `howell` for personal injury, `chronology` and `qme_ame_memo` for workers'
 * compensation, in packages/shared/src/reports-tier.ts. The practice-area assertion below
 * is that list, restated here because the two repositories deploy separately and nothing
 * else would notice them drifting apart.
 *
 * The resolver throws rather than returning undefined so that a report naming a feature
 * that is missing, unrouted, or not live fails the build instead of rendering a card with
 * an empty heading and a link to a 404.
 */
describe('orderable report catalog', () => {
  it('names exactly the three reports a firm can order, in buyer order', () => {
    expect(REPORT_PRODUCTS.map((report) => report.featureId)).toEqual([
      'medical-chronologies',
      'case-value',
      'qme-ame',
    ]);
  });

  it('offers each report to the practice areas case-app launches it for', () => {
    const areas = new Map(REPORT_PRODUCTS.map((report) => [report.featureId, report.practiceAreas]));
    expect(areas.get('medical-chronologies')).toEqual(['PI', 'WC']);
    expect(areas.get('case-value')).toEqual(['PI']);
    expect(areas.get('qme-ame')).toEqual(['WC']);
  });

  it('advertises only live, routed features as orderable', () => {
    expect(ORDERABLE_REPORTS).toHaveLength(REPORT_PRODUCTS.length);
    ORDERABLE_REPORTS.forEach((report) => {
      expect(report.feature.availability).toBe('live');
      expect(report.feature.slug).toBeTruthy();
      expect(report.feature.page).toBeDefined();
    });
  });

  it('refuses a report that names a feature which does not exist', () => {
    expect(() => resolveReport({ ...REPORT_PRODUCTS[0], featureId: 'no-such-feature' })).toThrow(
      /no-such-feature/,
    );
  });

  /*
   * The illustration pilot is the live case for this: it is `early-access`, it has a
   * routed page, and it is the one a future edit is most likely to promote into the
   * catalog by mistake, because everything about it except its availability looks ready.
   */
  it('refuses a report whose feature is not live', () => {
    expect(() => resolveReport({ ...REPORT_PRODUCTS[0], featureId: 'illustrations' })).toThrow(
      /early-access/,
    );
  });

  it('gives every report a buyer problem and exactly three deliverables', () => {
    REPORT_PRODUCTS.forEach((report) => {
      expect(report.problem.length).toBeGreaterThan(20);
      expect(report.deliverables).toHaveLength(3);
      report.deliverables.forEach((deliverable) => expect(deliverable.length).toBeGreaterThan(10));
    });
  });

  it('leaves the illustration pilot out of the catalog', () => {
    expect(REPORT_PRODUCTS.map((report) => report.featureId)).not.toContain('illustrations');
  });

  it('claims no accuracy percentage in catalog copy', () => {
    const copy = REPORT_PRODUCTS.flatMap((report) => [
      report.problem,
      report.boundary ?? '',
      ...report.deliverables,
    ]).join(' ');
    expect(copy).not.toMatch(/\d+(?:\.\d+)?\s*%/);
  });
});

/*
 * The two tiers, as the product actually draws the line.
 *
 * reports-tier-routes.ts in case-app is an allowlist enforced inside isAuthenticated: a
 * Reports-tier firm may order reports, buy packs, list cases and call the Ask AL ai-zone
 * route, and everything else returns 403. So the platform is not an upsell bolted on top
 * of reports — reports are the cut-down tier, and the comparison on /platform is the
 * difference between the two.
 *
 * Derived rather than written down, because a hand-kept inclusion list drifts from the
 * product the first time a feature moves and nothing notices. The coverage assertion is
 * the one that matters: a new live feature must land in one side or the other, so it
 * cannot quietly end up advertised by neither page.
 */
describe('platform tier', () => {
  it('gives the reports tier the orderable reports and Ask AL, and nothing else', () => {
    expect([...REPORTS_TIER_FEATURE_IDS].sort()).toEqual(
      ['ask-al', 'case-value', 'medical-chronologies', 'qme-ame'].sort(),
    );
  });

  it('advertises only live, routed features as what the platform adds', () => {
    expect(PLATFORM_ADDS.length).toBeGreaterThan(5);
    PLATFORM_ADDS.forEach((feature) => {
      expect(feature.availability, `${feature.id} is not live`).toBe('live');
      expect(feature.slug, `${feature.id} has no page to link to`).toBeTruthy();
    });
  });

  it('never lists a feature as both included and added', () => {
    const overlap = PLATFORM_ADDS.filter((feature) => REPORTS_TIER_FEATURE_IDS.includes(feature.id));
    expect(overlap.map((feature) => feature.id)).toEqual([]);
  });

  /*
   * The guard with teeth. Add a live feature and forget to classify it and this fails,
   * rather than the feature silently appearing on neither tier's page.
   */
  it('accounts for every live feature on one side or the other', () => {
    const live = FEATURES.filter((feature) => feature.availability === 'live').map((f) => f.id);
    const classified = [...REPORTS_TIER_FEATURE_IDS, ...PLATFORM_ADDS.map((f) => f.id)];
    expect([...live].sort()).toEqual([...classified].sort());
  });
});
