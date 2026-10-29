import { describe, it, expect } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ReactElement } from 'react';
import App from '../App';
import { SecurityPage } from '../pages/security/SecurityPage';
import { SubprocessorsPage } from '../pages/security/subprocessors/SubprocessorsPage';
import { AiDataUsePage } from '../pages/security/ai/AiDataUsePage';
import { AboutPage } from '../pages/about/AboutPage';
import { PricingPage } from '../pages/pricing/PricingPage';
import { PlatformPage } from '../pages/platform/PlatformPage';
import { SampleReportsPage } from '../pages/sample-reports/SampleReportsPage';
import { ScheduleCallPage } from '../pages/schedule-call/ScheduleCallPage';
import { PrivacyPage } from '../pages/privacy/PrivacyPage';
import { TermsPage } from '../pages/terms/TermsPage';
import { FeaturePage } from '../pages/product/FeaturePage';
import { BlogIndexPage } from '../pages/blog/BlogIndexPage';
import { PostPage } from '../pages/blog/PostPage';
import { ROUTED_FEATURES } from '../data/product';
import { POSTS } from '../data/blog';

/*
 * Every internal link on the site, checked against the routes the build actually ships.
 *
 * The other guards cover adjacent things and leave this gap open. sitemap.test.ts checks
 * that the build and the sitemap agree; pages.test.tsx checks that a same-page fragment
 * resolves on the page carrying it. Neither notices a link to /product/medical-chronology/
 * when the directory is medical-chronologies — a plausible path, a 404 for the visitor,
 * and nothing anywhere that fails.
 *
 * That mistake is likeliest exactly where this release put the new links: three pages
 * written at once, each pointing at the other two, with a product slug typed by hand.
 *
 * Routes come from vite.config.ts rather than a list here, so a page added later is
 * covered without anybody remembering this file exists.
 */

const ROOT = process.cwd();

/** The paths a visitor can reach: "/" plus one per directory entry in the build. */
const builtRoutes = (): Set<string> => {
  const config = readFileSync(join(ROOT, 'vite.config.ts'), 'utf8');
  const inputs = config.slice(config.indexOf('rollupOptions'));
  const entries = [...inputs.matchAll(/__dirname,\s*['"]([^'"]+\.html)['"]/g)].map((m) => m[1]);
  return new Set(entries.map((entry) => `/${entry.replace(/(^|\/)index\.html$/, '$1')}`));
};

/** Files served straight out of public/, which are routes too. */
const PUBLIC_FILES = new Set([
  '/favicon.svg',
  '/favicon.png',
  '/apple-touch-icon.png',
  '/robots.txt',
  '/sitemap.xml',
  '/og-card.png',
]);

const PAGES: ReadonlyArray<[string, () => ReactElement]> = [
  ['home', () => <App />],
  ['pricing', () => <PricingPage />],
  ['platform', () => <PlatformPage />],
  ['sample-reports', () => <SampleReportsPage />],
  ['security', () => <SecurityPage />],
  ['security/subprocessors', () => <SubprocessorsPage />],
  ['security/ai', () => <AiDataUsePage />],
  ['about', () => <AboutPage />],
  ['schedule-call', () => <ScheduleCallPage />],
  ['privacy', () => <PrivacyPage />],
  ['terms', () => <TermsPage />],
  ['blog', () => <BlogIndexPage />],
  ...POSTS.map((post) => [`blog/${post.slug}`, () => <PostPage slug={post.slug} />] as [string, () => ReactElement]),
  ...ROUTED_FEATURES.map((feature) => [
    `product/${feature.slug}`,
    () => <FeaturePage id={feature.id} />,
  ] as [string, () => ReactElement]),
];

describe('internal link integrity', () => {
  it('can still read the routes it is checking', () => {
    const routes = builtRoutes();
    expect(routes.size).toBeGreaterThan(10);
    expect(routes.has('/')).toBe(true);
    expect(routes.has('/pricing/')).toBe(true);
  });

  for (const [name, page] of PAGES) {
    it(`${name} links only to routes that exist`, () => {
      const routes = builtRoutes();
      const { container } = render(page());
      const broken = [...container.querySelectorAll<HTMLAnchorElement>('a[href^="/"]')]
        .map((a) => a.getAttribute('href') ?? '')
        /* Drop the fragment: which anchor a link targets is pages.test.tsx's business. */
        /* Drop the query too: /schedule-call/?practice=pi carries the practice the
           visitor chose in Solutions, and the route it addresses is /schedule-call/. */
        .map((href) => href.split('#')[0].split('?')[0])
        .filter((path) => path !== '')
        .filter((path) => !routes.has(path) && !PUBLIC_FILES.has(path));
      cleanup();
      expect([...new Set(broken)]).toEqual([]);
    });
  }
});
