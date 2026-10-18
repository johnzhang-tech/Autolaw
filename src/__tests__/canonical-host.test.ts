import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The site answers to more hostnames than the one it advertises.
 *
 * `www.autolaw.ai` is the name every page declares in <link rel="canonical"> and og:url,
 * and the only one a visitor should ever see. But the Cloud Run service behind it is also
 * reachable at `autolaw-<project>.<region>.run.app`, and every `gcloud run deploy --tag`
 * preview revision adds another hostname serving byte-identical HTML. Those are real,
 * public, crawlable copies of the site competing with the brand for its own name — which
 * is how the apex ended up pointing at a run.app URL in the first place.
 *
 * nginx.conf answers that with a `map $host $robots_tag` whose only empty value — and so
 * the only host that receives no X-Robots-Tag — is the canonical one. Everything else is
 * served normally and told not to be indexed.
 *
 * What this file guards is the join between the two halves: the host nginx privileges and
 * the host the pages claim. Either can be edited without the other, both look correct in
 * isolation, and nothing at runtime complains if they disagree — the site just quietly
 * asks Google not to index itself, or stops suppressing the hostname it meant to hide.
 *
 * The background, and the DNS-side half that lives outside this repo, are in
 * docs/superpowers/specs/2026-10-18-apex-canonical-host-design.md.
 */

const ROOT = process.cwd();
const nginxConf = () => readFileSync(join(ROOT, 'nginx.conf'), 'utf8');

/** Every HTML file the build ships, read out of vite.config.ts rather than listed here. */
const htmlEntries = (): string[] => {
  const config = readFileSync(join(ROOT, 'vite.config.ts'), 'utf8');
  const inputs = config.slice(config.indexOf('rollupOptions'));
  return [...inputs.matchAll(/__dirname,\s*['"]([^'"]+\.html)['"]/g)].map((m) => join(ROOT, m[1]));
};

/** The host in every <link rel="canonical"> across those pages. */
const declaredHosts = (): string[] => {
  const hosts = new Set<string>();
  for (const file of htmlEntries()) {
    const html = readFileSync(file, 'utf8');
    for (const m of html.matchAll(/<link\s+rel="canonical"\s+href="https:\/\/([^/"]+)/g)) {
      hosts.add(m[1]);
    }
  }
  return [...hosts];
};

/** The `map $host $robots_tag { ... }` body, as host → header-value pairs. */
const robotsMap = (): Array<[string, string]> => {
  const block = nginxConf().match(/map\s+\$host\s+\$robots_tag\s*\{([^}]*)\}/);
  if (!block) return [];
  return [...block[1].matchAll(/^\s*(\S+)\s+"([^"]*)"\s*;/gm)].map((m) => [m[1], m[2]]);
};

describe('canonical host', () => {
  /*
   * Runs first because every assertion below reads through one of these two parsers. A
   * regex that stops matching — someone renames the variable, reformats the map, switches
   * vite.config.ts to a helper that builds the input map — would hand the rest of this
   * file an empty list to assert nothing about, and the suite would go green on a config
   * it never read.
   */
  it('can still read the map and the pages it is checking', () => {
    expect(robotsMap().length).toBeGreaterThan(1);
    expect(htmlEntries().length).toBeGreaterThan(1);
    expect(declaredHosts().length).toBeGreaterThan(0);
  });

  it('serves every page under one declared host', () => {
    expect(declaredHosts()).toEqual(['www.autolaw.ai']);
  });

  it('exempts exactly the host the pages declare, and no other', () => {
    const exempt = robotsMap()
      .filter(([host, value]) => host !== 'default' && value === '')
      .map(([host]) => host);
    expect(exempt).toEqual(declaredHosts());
  });

  it('asks robots away from every other host', () => {
    const fallback = robotsMap().find(([host]) => host === 'default');
    expect(fallback?.[1]).toContain('noindex');
  });

  /*
   * `map` is only valid in the http context. conf.d/default.conf is included inside it, so
   * a map at the top of the file is fine — but moved inside `server {` it is a config error
   * and nginx refuses to start, which is a failed deploy rather than a bad page.
   */
  it('declares the map above the server block', () => {
    const conf = nginxConf();
    const server = conf.search(/^server\s*\{/m);
    expect(server).toBeGreaterThan(-1);
    expect(conf.indexOf('map $host $robots_tag')).toBeLessThan(server);
  });

  /*
   * An add_header inside a location replaces every add_header inherited from the server
   * block, so a header declared down there would take the whole security set with it on
   * the paths it covers. nginx.conf says this at the top of its header block; this holds
   * X-Robots-Tag to it.
   */
  it('adds the header at server level, with the other security headers', () => {
    const conf = nginxConf();
    const header = conf.indexOf('add_header X-Robots-Tag');
    // Anchored to a directive at the start of a line, not the bare word: the comment above
    // this header block explains the add_header-in-a-location rule, and matching the prose
    // rather than the block put this assertion's cutoff before the headers it guards.
    const firstLocation = conf.search(/^\s*location\s/m);
    expect(header).toBeGreaterThan(-1);
    expect(firstLocation).toBeGreaterThan(-1);
    expect(header).toBeLessThan(firstLocation);
    expect(conf).toMatch(/add_header X-Robots-Tag \$robots_tag always;/);
  });
});
