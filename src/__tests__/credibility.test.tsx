import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { ROUTED_FEATURES } from '../data/product';
import { LOGIN_URL } from '../config';

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git' || entry === 'dist' || entry === 'build') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

/**
 * Every HTML file Vite ships, read back out of the build config instead of listed here.
 *
 * index.html used to be named on its own, and naming it was the right instinct: it is a
 * file that literally ships, it holds <link rel="canonical"> and og:url — the two
 * likeliest places for a wrong host to reappear — and a scan of src/ alone never looks at
 * it. The site now has four of them, one per page, each with its own canonical and og:url.
 *
 * Deriving the list from vite.config.ts rather than repeating it means a page added later
 * is scanned the moment it is buildable, rather than the moment someone remembers this
 * file exists. The guard below asserts the list is non-empty and that every path resolves,
 * because a regex that quietly stops matching would turn every check in this file green.
 */
const htmlEntries = (): string[] => {
  const config = readFileSync(join(ROOT, 'vite.config.ts'), 'utf8');
  const inputs = config.slice(config.indexOf('rollupOptions'));
  return [...inputs.matchAll(/__dirname,\s*['"]([^'"]+\.html)['"]/g)].map((m) => join(ROOT, m[1]));
};

/**
 * Files that ship to a visitor.
 *
 * `__tests__` is excluded for a specific reason: this file necessarily contains the
 * literal strings it searches for ("logoipsum", "shutterstock"), so a scanner that
 * included itself could never reach zero offenders no matter how clean the site got.
 * Test files are not served, so scanning them adds no protection — only a permanent
 * false positive that would train someone to ignore a failing guard.
 */
const sourceFiles = () =>
  [
    ...walk(SRC)
      .filter((f) => !f.includes('__tests__'))
      // .md is included because the Figma export shipped an Attributions.md crediting
      // Unsplash photography and shadcn/ui long after both were gone. A stale claim in
      // a doc is the same credibility problem as one in markup.
      .filter((f) => /\.(tsx?|css|html|md)$/.test(f)),
    ...htmlEntries(),
  ];

describe('credibility guards', () => {
  /*
   * Runs first because every other guard in this file depends on it. If the entry regex
   * stops matching — someone reformats vite.config.ts, or switches to a helper that builds
   * the input map — the scan silently covers nothing but src/, and the four files most
   * likely to carry a wrong hostname stop being checked while the suite stays green.
   */
  it('scans every HTML page the build ships', () => {
    const entries = htmlEntries();
    expect(entries.map((f) => f.replace(`${ROOT}/`, ''))).toEqual([
      'index.html',
      'security/index.html',
      'about/index.html',
      'schedule-call/index.html',
      'privacy/index.html',
      'terms/index.html',
      ...ROUTED_FEATURES.map((feature) => `product/${feature.slug}/index.html`),
    ]);
    entries.forEach((f) => expect(existsSync(f), `${f} is a build entry but does not exist`).toBe(true));
  });

  it('ships no placeholder customer logos', () => {
    const offenders = sourceFiles().filter((f) =>
      /logoipsum/i.test(readFileSync(f, 'utf8'))
    );
    expect(offenders).toEqual([]);
  });

  it('ships no test or example contact address', () => {
    const offenders = sourceFiles().filter((f) =>
      /(test|example|placeholder)@autolaw\.ai/i.test(readFileSync(f, 'utf8'))
    );
    expect(offenders).toEqual([]);
  });

  it('ships no stock photography or external image hosts', () => {
    const offenders = sourceFiles().filter((f) =>
      /(unsplash\.com|pexels\.com|shutterstock)/i.test(readFileSync(f, 'utf8'))
    );
    expect(offenders).toEqual([]);
  });

  it('allows only the explicitly approved production login hostname', () => {
    const approved = 'https://case-app-1055716306475.us-central1.run.app/login';
    expect(LOGIN_URL).toBe(approved);
    const offenders = sourceFiles().filter((f) => {
      const withoutApprovedLogin = readFileSync(f, 'utf8').replaceAll(approved, '');
      return /\.run\.app/i.test(withoutApprovedLogin);
    });
    expect(offenders).toEqual([]);
  });

  it('keeps app tokens identical to the design system source', () => {
    const ds = readFileSync(join(process.cwd(), 'design-system/tokens.css'), 'utf8');
    const app = readFileSync(join(SRC, 'styles/tokens.css'), 'utf8');
    expect(app).toBe(ds);
  });
  /*
   * Site basics. Every page links the favicon, and the files a crawler or a browser asks
   * for without being told exist under public/. Before this, /favicon.ico returned the
   * home page with a 200 — as did every other unknown path — so a missing file was invisible.
   */
  it('ships a favicon, robots.txt, sitemap.xml, and a 404 page', () => {
    for (const f of ['favicon.svg', 'favicon.png', 'apple-touch-icon.png', 'robots.txt', 'sitemap.xml', '404.html']) {
      expect(existsSync(join(ROOT, 'public', f)), `public/${f} is missing`).toBe(true);
    }
    const sitemap = readFileSync(join(ROOT, 'public/sitemap.xml'), 'utf8');
    for (const page of ['/', '/security/', '/about/', '/schedule-call/']) {
      expect(sitemap).toContain(`<loc>https://www.autolaw.ai${page}</loc>`);
    }
  });

  it('links the favicon from every page', () => {
    for (const f of [...htmlEntries(), join(ROOT, 'public/404.html')]) {
      expect(readFileSync(f, 'utf8'), `${f} has no favicon link`).toMatch(/rel="icon" href="\/favicon\.svg"/);
    }
  });

  it('loads no stylesheet, font, or script from a third-party origin', () => {
    const offenders = htmlEntries().filter((f) => /https?:\/\/(fonts\.googleapis|fonts\.gstatic|cdn\.|unpkg|jsdelivr)/i.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
    for (const face of ['manrope-400', 'manrope-500', 'manrope-600', 'manrope-700', 'source-serif-4-400', 'source-serif-4-600', 'source-serif-4-400-italic']) {
      expect(existsSync(join(ROOT, 'public/fonts', `${face}.woff2`)), `${face}.woff2 missing`).toBe(true);
    }
  });
  /*
   * summary_large_image reserves a 1200x630 panel and fills it with nothing when og:image
   * is absent or 404s, so the link renders as a blank slab — the worst artifact at the
   * moment one attorney forwards this to another. The three tags and the file therefore
   * ship together or not at all, and this asserts exactly that rather than each half.
   */
  it('claims a large share image only when the file exists', () => {
    const png = existsSync(join(ROOT, 'public/og-card.png'));
    for (const f of htmlEntries()) {
      const html = readFileSync(f, 'utf8');
      const large = /twitter:card"\s+content="summary_large_image"/.test(html);
      const image = /property="og:image"\s+content="https:\/\/www\.autolaw\.ai\/og-card\.png"/.test(html);
      const alt = /property="og:image:alt"/.test(html);
      expect(large && image && alt, `${f} share tags`).toBe(png);
    }
    expect(png).toBe(true);
  });
});
