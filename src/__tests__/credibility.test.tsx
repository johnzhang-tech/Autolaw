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

const SRC = join(process.cwd(), 'src');

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
  walk(SRC)
    .filter((f) => !f.includes('__tests__'))
    // .md is included because the Figma export shipped an Attributions.md crediting
    // Unsplash photography and shadcn/ui long after both were gone. A stale claim in
    // a doc is the same credibility problem as one in markup.
    .filter((f) => /\.(tsx?|css|html|md)$/.test(f));

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

  it('exposes no raw Cloud Run hostname to visitors', () => {
    const offenders = sourceFiles().filter((f) =>
      /[a-z-]+-\d{10,}\.[a-z0-9-]+\.run\.app/i.test(readFileSync(f, 'utf8'))
    );
    expect(offenders).toEqual([]);
  });

  it('keeps app tokens identical to the design system source', () => {
    const ds = readFileSync(join(process.cwd(), 'design-system/tokens.css'), 'utf8');
    const app = readFileSync(join(SRC, 'styles/tokens.css'), 'utf8');
    expect(app).toBe(ds);
  });
});
