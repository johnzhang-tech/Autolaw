import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CANONICAL_HOST, umamiWebsiteId } from '../config';

/*
 * The one value the build takes from outside src/: the Umami website id.
 *
 * It lives in .env.production, which Vite reads for `vite build` and nothing else, so dev
 * and the test suite never count a visit. The Dockerfile copies the whole tree before it
 * builds and the Cloud Build trigger runs that Dockerfile, so the committed file is what
 * production gets. These tests hold the three places that have to agree for that to stay
 * true, because each one failing on its own ships a site that is silently not measured.
 */

const ROOT = process.cwd();
const TEST_ID = '0b5e2f8c-1d3a-4c6e-9f70-2a4b6c8d0e1f';

describe('Umami website id', () => {
  it('accepts a website id, trimmed', () => {
    expect(umamiWebsiteId(TEST_ID)).toBe(TEST_ID);
    expect(umamiWebsiteId(`  ${TEST_ID.toUpperCase()}\n`)).toBe(TEST_ID.toUpperCase());
  });

  /*
   * The value goes into a script attribute. Anything that is not exactly a UUID — the
   * whole snippet Umami shows, the id in quotes, a placeholder — means no tracker, which
   * is today's behaviour, rather than a malformed tag.
   */
  it('rejects anything that is not one', () => {
    for (const raw of [undefined, null, '', '   ', 'your-website-id', `"${TEST_ID}"`, `${TEST_ID}x`, '0b5e2f8c1d3a4c6e9f702a4b6c8d0e1f', `<script defer src="https://cloud.umami.is/script.js" data-website-id="${TEST_ID}"></script>`, 42]) {
      expect(umamiWebsiteId(raw), JSON.stringify(raw)).toBeNull();
    }
  });
});

describe('.env.production', () => {
  const file = () => readFileSync(join(ROOT, '.env.production'), 'utf8');
  const declared = () => /^VITE_UMAMI_WEBSITE_ID=(.*)$/m.exec(file());

  it('declares the website id the production build reads', () => {
    expect(declared()).not.toBeNull();
  });

  /*
   * Either both states are fine or the guard teaches someone to edit it: empty ships the
   * site inert, a website id ships it measured. What fails is a value that is neither,
   * because the build would quietly treat it as empty and nobody would know until the
   * Umami dashboard stayed at zero.
   */
  it('holds nothing, or exactly a website id', () => {
    const value = declared()![1].trim();
    expect(value === '' || umamiWebsiteId(value) !== null, `VITE_UMAMI_WEBSITE_ID=${value}`).toBe(true);
  });

  it('reaches the Docker build', () => {
    const ignored = readFileSync(join(ROOT, '.dockerignore'), 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'));
    expect(ignored.filter((pattern) => /^\.env/.test(pattern) || pattern === '*')).toEqual([]);
    expect(readFileSync(join(ROOT, 'Dockerfile'), 'utf8')).toMatch(/COPY \. \.\s+RUN npm run build/);
  });
});

describe('canonical host', () => {
  /* data-domains is the host visits are counted on, so it is the host the pages declare. */
  it('is the host every page declares', () => {
    const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
    expect(html).toContain(`<link rel="canonical" href="https://${CANONICAL_HOST}/"`);
    expect(CANONICAL_HOST).toBe('www.autolaw.ai');
  });
});
