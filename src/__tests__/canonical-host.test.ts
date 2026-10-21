import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The site answers to more hostnames than the two it is served on.
 *
 * Two of them are ours: the apex `autolaw.ai` and `www.autolaw.ai`, each with its own Cloud
 * Run domain mapping, both serving the same pages. `www.autolaw.ai` is the one every page
 * names in <link rel="canonical"> and og:url, and that tag is what tells a search engine
 * the two are one site rather than two.
 *
 * The rest are not ours to advertise. The service is also reachable at
 * `autolaw-<project>.<region>.run.app`, and every `gcloud run deploy --tag` preview adds
 * another hostname serving byte-identical HTML — real, public, crawlable copies competing
 * with the brand for its own name, which is how the apex ended up pointing at a run.app URL
 * in the first place. `map $host $robots_tag` in nginx.conf leaves our hosts alone and
 * sends noindex to everything else.
 *
 * What this file guards is the join between the two halves: the hosts nginx treats as ours
 * and the host the pages claim. Either can be edited without the other, both look correct
 * in isolation, and nothing at runtime complains if they disagree — the site just quietly
 * asks Google not to index itself, or stops suppressing the hostname it meant to hide.
 *
 * The exemption is derived from the canonical tag rather than listed, so adding a host to
 * nginx.conf that the pages do not claim fails here rather than shipping.
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

/** The hosts nginx leaves un-noindexed: the map keys whose value is the empty string. */
const exemptHosts = (): string[] =>
  robotsMap()
    .filter(([host, value]) => host !== 'default' && value === '')
    .map(([host]) => host)
    .sort();

/**
 * The hosts this site is served on, derived rather than listed: the canonical host the
 * pages declare, plus the apex it sits under. Deriving it means a host added to nginx.conf
 * that no page claims fails this file instead of quietly becoming indexable.
 */
const servedHosts = (): string[] => {
  const canonical = declaredHosts();
  return [...new Set(canonical.flatMap((host) => [host.replace(/^www\./, ''), host]))].sort();
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

  it('exempts exactly the hosts this site is served on', () => {
    expect(exemptHosts()).toEqual(servedHosts());
  });

  /*
   * The specific mistake worth failing on. Exempting a run.app hostname would read as a
   * harmless convenience — it stops a preview looking odd in a crawl test — and would
   * silently hand the service URL permission to compete with the brand, which is the entire
   * thing this map exists to prevent.
   */
  it('never exempts a Cloud Run hostname', () => {
    expect(exemptHosts().filter((host) => /\.run\.app$/i.test(host))).toEqual([]);
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
