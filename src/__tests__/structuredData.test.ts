import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FAQ } from '../pages/pricing/PricingPage';
import { REPORT_PACKS } from '../config';

/*
 * Structured data is copy that no one on the team ever reads.
 *
 * It sits in the <head>, it renders nowhere, and the only consumer is a crawler — so it
 * is the one place on the site where a claim can be wrong for a year without anybody
 * noticing. Two things follow.
 *
 * First, it is held to the same standard as visible copy: an `offers` block with a price
 * would be a published price, and the prices are not known, so the guard below forbids
 * one until REPORT_PACKS says otherwise. A crawler quoting a made-up figure in a rich
 * result is no better than the page doing it.
 *
 * Second, anything duplicated between markup and a page's own source must be compared
 * rather than trusted. The FAQ is the live case: the questions exist in PricingPage.tsx
 * and again in pricing/index.html, two files that are edited for different reasons, and
 * Google penalises FAQ markup that does not match the page. So the JSON-LD is parsed and
 * checked against the array the page actually renders.
 */

const ROOT = process.cwd();

const htmlEntries = (): string[] => {
  const config = readFileSync(join(ROOT, 'vite.config.ts'), 'utf8');
  const inputs = config.slice(config.indexOf('rollupOptions'));
  return [...inputs.matchAll(/__dirname,\s*['"]([^'"]+\.html)['"]/g)].map((m) => m[1]);
};

const blocksIn = (entry: string): unknown[] => {
  const html = readFileSync(join(ROOT, entry), 'utf8');
  return [
    ...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g),
  ].map((m) => JSON.parse(m[1]));
};

describe('structured data', () => {
  /*
   * blocksIn matches `<script type="application/ld+json">` as an exact literal, so a
   * reformat to single quotes or an added attribute would make every block invisible —
   * and then the "claims no price" guard below passes because it found nothing to look
   * at. Counting the raw occurrences first is what stops that being silent.
   */
  it('finds every block that is actually in the file', () => {
    for (const entry of htmlEntries()) {
      const raw = readFileSync(join(ROOT, entry), 'utf8');
      const occurrences = (raw.match(/application\/ld\+json/g) ?? []).length;
      expect(blocksIn(entry).length, `${entry} has ${occurrences} ld+json blocks`).toBe(occurrences);
    }
  });

  it('parses as JSON wherever it appears', () => {
    const offenders: string[] = [];
    for (const entry of htmlEntries()) {
      try {
        blocksIn(entry);
      } catch (error) {
        offenders.push(`${entry}: ${(error as Error).message}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('describes the organisation on the home page', () => {
    const org = blocksIn('index.html').find(
      (block): block is Record<string, unknown> =>
        typeof block === 'object' && block !== null && (block as Record<string, unknown>)['@type'] === 'Organization',
    );
    expect(org).toBeDefined();
    expect(org?.['@context']).toBe('https://schema.org');
    expect(org?.name).toBe('Autolaw');
    expect(org?.url).toBe('https://www.autolaw.ai/');
  });

  it('publishes the pricing FAQ exactly as the page answers it', () => {
    const faq = blocksIn('pricing/index.html').find(
      (block): block is Record<string, unknown> =>
        typeof block === 'object' && block !== null && (block as Record<string, unknown>)['@type'] === 'FAQPage',
    );
    expect(faq).toBeDefined();

    const entities = faq?.mainEntity as Array<Record<string, unknown>>;
    expect(entities.map((entity) => entity.name)).toEqual(FAQ.map((item) => item.q));
    expect(
      entities.map((entity) => (entity.acceptedAnswer as Record<string, unknown>).text),
    ).toEqual(FAQ.map((item) => item.a));
  });

  /*
   * The guard that matters. An Offer or a price in markup is a published price, and
   * nobody has read the live Stripe figures yet — so while every pack is null, no
   * structured data anywhere may carry one.
   *
   * Conditional, for the reason given in PricingPage.test.tsx: filling REPORT_PACKS in
   * is the expected next step and should not read as a regression. Publishing price
   * markup once a price exists is a separate decision with Google's structured-data
   * policy attached, so this goes quiet then rather than guessing at it.
   */
  it('claims no price in markup while no price is known', () => {
    if (REPORT_PACKS.some((pack) => pack.priceUsd !== null)) return;
    const offenders: string[] = [];
    for (const entry of htmlEntries()) {
      const raw = JSON.stringify(blocksIn(entry));
      if (/"(offers|price|priceSpecification|lowPrice|highPrice)"/i.test(raw)) offenders.push(entry);
    }
    expect(offenders).toEqual([]);
  });
});
