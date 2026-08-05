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
const sourceFiles = () =>
  walk(SRC).filter((f) => /\.(tsx?|css|html)$/.test(f));

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
