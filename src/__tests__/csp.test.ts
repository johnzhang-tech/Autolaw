import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { LEADS_API_ORIGIN, UMAMI_COLLECT_ORIGIN, UMAMI_SCRIPT_URL } from '../config';

/*
 * The Content-Security-Policy nginx sends, held to what the page actually loads.
 *
 * Two directives name a third party: the Umami tracker's host in script-src, and in
 * connect-src the host it posts to plus case-app, where the schedule-a-call form posts. A
 * policy wider than that lets any script on those lists run; a policy narrower than that
 * blocks the tracker or the form, which shows up nowhere but an Umami dashboard that stays
 * at zero or a request that falls back to email. Every host comes from src/config.ts, so
 * changing one there without changing nginx.conf fails here.
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

  it('lets the page talk to this site, the Umami collection endpoint and the lead API, and nowhere else', () => {
    expect(policy().get('connect-src')).toEqual(["'self'", UMAMI_COLLECT_ORIGIN, LEADS_API_ORIGIN]);
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
    expect(new URL(LEADS_API_ORIGIN).origin).toBe(LEADS_API_ORIGIN);
    expect(LEADS_API_ORIGIN.startsWith('https://')).toBe(true);
  });
});
