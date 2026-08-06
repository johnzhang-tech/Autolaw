import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

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
 * Files that ship to a visitor.
 *
 * index.html is included explicitly. It is the file that literally ships, and it holds
 * <link rel="canonical"> and og:url — the two likeliest places for a wrong host to
 * reappear — yet a scan of src/ alone never looks at it.
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
    join(ROOT, 'index.html'),
  ];

describe('credibility guards', () => {
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

  /*
   * Matches any .run.app host, not the shape of the one that used to be here. The earlier
   * pattern required a >=10-digit project number, so it only ever caught
   * case-app-1055716306475.us-central1.run.app — Cloud Run's newer
   * service-hash-region.a.run.app format sailed straight through. No legitimate .run.app
   * host belongs on the marketing site, so the broad pattern carries no false-positive risk.
   */
  it('exposes no raw Cloud Run hostname to visitors', () => {
    const offenders = sourceFiles().filter((f) =>
      /\.run\.app/i.test(readFileSync(f, 'utf8'))
    );
    expect(offenders).toEqual([]);
  });

  it('keeps app tokens identical to the design system source', () => {
    const ds = readFileSync(join(process.cwd(), 'design-system/tokens.css'), 'utf8');
    const app = readFileSync(join(SRC, 'styles/tokens.css'), 'utf8');
    expect(app).toBe(ds);
  });
});
