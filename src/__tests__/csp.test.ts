import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { UMAMI_COLLECT_ORIGIN, UMAMI_SCRIPT_URL } from '../config';

/*
 * The Content-Security-Policy nginx sends, held to what the page actually loads.
 *
 * Two directives name a third party, and each names exactly one: the Umami tracker's host
 * in script-src and the host it posts to in connect-src. A policy wider than that lets
 * any script on those lists run; a policy narrower than that blocks the tracker or its
 * requests, which shows up nowhere but an Umami dashboard that stays at zero. Both hosts
 * come from src/config.ts, so changing one there without changing nginx.conf fails here.
 */

const conf = () => readFileSync(join(process.cwd(), 'nginx.conf'), 'utf8');

const policy = (): Map<string, string[]> => {
  const header = /add_header Content-Security-Policy "([^"]+)" always;/.exec(conf());
  if (!header) return new Map();
  return new Map(
    header[1]
      .split(';')
      .map((d) => d.trim().split(/\s+/))
      .filter((parts) => parts[0])
      .map(([name, ...sources]) => [name, sources]),
  );
};

describe('content security policy', () => {
  it('can still read the header it checks', () => {
    expect(policy().size).toBeGreaterThan(5);
  });

  it('runs scripts from this site and the Umami tracker host, and nowhere else', () => {
    expect(policy().get('script-src')).toEqual(["'self'", new URL(UMAMI_SCRIPT_URL).origin]);
  });

  it('lets the page talk to this site and the Umami collection endpoint, and nowhere else', () => {
    expect(policy().get('connect-src')).toEqual(["'self'", UMAMI_COLLECT_ORIGIN]);
  });

  it('allows no inline or evaluated script', () => {
    const script = policy().get('script-src') ?? [];
    expect(script.filter((s) => /unsafe|data:|\*/.test(s))).toEqual([]);
    expect(policy().get('default-src')).toEqual(["'self'"]);
  });

  it('names https origins only', () => {
    expect(new URL(UMAMI_SCRIPT_URL).protocol).toBe('https:');
    expect(new URL(UMAMI_COLLECT_ORIGIN).origin).toBe(UMAMI_COLLECT_ORIGIN);
    expect(UMAMI_COLLECT_ORIGIN.startsWith('https://')).toBe(true);
  });
});
