import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PRIVACY_TEXT, TERMS_TEXT } from '../config';

/**
 * The sitemap is the one file on the site that nothing else reads.
 *
 * Every other page is reachable from the nav, so a broken one is found the first time
 * somebody clicks it. `public/sitemap.xml` is hand-maintained, served to crawlers only,
 * and silent in every direction: a page added to vite.config.ts and forgotten here is
 * simply never submitted, and a page removed from the build leaves a <loc> pointing at a
 * 404 that no visitor will ever report. Both states look exactly like a working site.
 *
 * It had also been shipping with `http://www.sitemap.org/schemas/sitemap/0.9` as its
 * namespace — the real one is `sitemaps.org`, with an `s`. A namespace is matched as an
 * opaque string, so a document in the wrong one is not a sitemap with a typo in it; it is
 * a document the schema does not describe, and a validator is entitled to reject the whole
 * file rather than the one bad attribute.
 *
 * So the entry list is derived from vite.config.ts in both directions, the same way
 * canonical-host.test.ts derives its host list from the pages rather than restating it,
 * and the withheld pages are derived from the switches that withhold them: when
 * PRIVACY_TEXT stops being empty, this file starts demanding /privacy/ in the sitemap
 * instead of forbidding it.
 */

const ROOT = process.cwd();

const SITEMAP_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9';

const sitemap = () => readFileSync(join(ROOT, 'public', 'sitemap.xml'), 'utf8');
const robots = () => readFileSync(join(ROOT, 'public', 'robots.txt'), 'utf8');

/** Every HTML file the build ships, read out of vite.config.ts rather than listed here. */
const htmlEntries = (): string[] => {
  const config = readFileSync(join(ROOT, 'vite.config.ts'), 'utf8');
  const inputs = config.slice(config.indexOf('rollupOptions'));
  return [...inputs.matchAll(/__dirname,\s*['"]([^'"]+\.html)['"]/g)].map((m) => m[1]);
};

/** The host every page declares in <link rel="canonical">, taken from the home page. */
const canonicalHost = (): string => {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  const match = html.match(/<link\s+rel="canonical"\s+href="https:\/\/([^/"]+)/);
  if (!match) throw new Error('index.html declares no canonical host');
  return match[1];
};

/**
 * `security/index.html` is served at `/security/`, and `index.html` at `/`. The trailing
 * slash is load-bearing: nginx's `try_files $uri $uri/` resolves the directory, and a
 * sitemap entry without the slash submits the URL that costs a 301.
 */
const urlForEntry = (entry: string): string => {
  const dir = entry.replace(/(^|\/)index\.html$/, '$1').replace(/^\.\//, '');
  return `https://${canonicalHost()}/${dir}`;
};

/**
 * Pages that exist as routes but whose document is not published yet. Each is keyed to
 * the config switch that withholds it, so publishing the text flips this file's
 * expectation with it rather than leaving a stale exemption behind.
 */
const withheldEntries = (): string[] => [
  ...(PRIVACY_TEXT.length === 0 ? ['privacy/index.html'] : []),
  ...(TERMS_TEXT.length === 0 ? ['terms/index.html'] : []),
];

const locs = (): string[] => [...sitemap().matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

describe('sitemap', () => {
  /*
   * Runs first for the same reason canonical-host.test.ts leads with its own: every
   * assertion below reads through one of these parsers, and a regex that silently stops
   * matching would hand the rest of the file empty lists to agree about.
   */
  it('can still read the sitemap and the build it is checking', () => {
    expect(htmlEntries().length).toBeGreaterThan(1);
    expect(locs().length).toBeGreaterThan(1);
    expect(canonicalHost()).toBe('www.autolaw.ai');
  });

  it('declares the sitemaps.org namespace', () => {
    expect(sitemap()).toContain(`<urlset xmlns="${SITEMAP_NS}">`);
  });

  it('submits every page the build ships, except the ones being withheld', () => {
    const withheld = withheldEntries();
    const expected = htmlEntries()
      .filter((entry) => !withheld.includes(entry))
      .map(urlForEntry)
      .sort();
    expect(locs().sort()).toEqual(expected);
  });

  it('submits no page whose document is still unpublished', () => {
    const forbidden = withheldEntries().map(urlForEntry);
    expect(locs().filter((loc) => forbidden.includes(loc))).toEqual([]);
  });

  /*
   * A <loc> on any other host submits a page that asks robots away from itself: nginx
   * sends noindex to every host but the canonical one. Submitting and suppressing the
   * same URL is worse than submitting nothing.
   */
  it('submits every URL on the canonical host, with a trailing slash', () => {
    const prefix = `https://${canonicalHost()}/`;
    for (const loc of locs()) {
      expect(loc.startsWith(prefix)).toBe(true);
      expect(loc.endsWith('/')).toBe(true);
    }
  });

  it('is the sitemap robots.txt points crawlers at', () => {
    expect(robots()).toContain(`Sitemap: https://${canonicalHost()}/sitemap.xml`);
  });
});
