import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  ATTRIBUTION_KEYS,
  attributionFrom,
  captureAttribution,
  describeLinkClick,
  installClickTracking,
  startPageAnalytics,
  storedAttribution,
  track,
} from '../measure';
import { UMAMI_WEBSITE_ID } from '../config';

/*
 * Marketing analytics on a site whose visitors are law firms.
 *
 * The risk here is not an undercount, it is a leak. Everything this module can ever send
 * is either a fixed event name from a closed union or a value read off the query string,
 * so the guards below are about what it refuses: keys outside the allowlist, values long
 * enough to be carrying something, and any payload that is not a scalar. A case name, a
 * client name, or a document title must not be able to reach a marketing endpoint even
 * if somebody later appends one to a link.
 *
 * The module is inert until a build supplies an Umami website id. Unset, which is how
 * these tests run by default, nothing loads and nothing is sent; the "Umami" block at the
 * bottom rebuilds the module with an id to show what changes when one is set.
 */

beforeEach(() => {
  /* Un-stub first: the storage-unavailable test leaves a throwing stub in place, and
     clearing before restoring would blow up in the next test's setup rather than its body. */
  vi.unstubAllGlobals();
  sessionStorage.clear();
});

describe('attribution', () => {
  it('keeps the campaign parameters and drops everything else', () => {
    const attribution = attributionFrom(
      '?utm_source=bar_assoc&utm_medium=email&client=Rivera&case_id=9912',
    );
    expect(attribution).toEqual({ utm_source: 'bar_assoc', utm_medium: 'email' });
  });

  /*
   * The specific leak worth failing on. A link shared inside a firm could carry anything
   * in the query string, and an allowlist that matched on prefix would happily forward
   * utm_campaign=Rivera_v_Cascade_settlement_docs.
   */
  it('never keeps a key outside the allowlist, however it is spelled', () => {
    const attribution = attributionFrom(
      '?utm_source_extra=x&xutm_medium=y&UTM_CAMPAIGN_NOTE=z&patient=Okonkwo',
    );
    expect(Object.keys(attribution)).toEqual([]);
  });

  it('truncates a value long enough to be carrying something else', () => {
    const attribution = attributionFrom(`?utm_campaign=${'a'.repeat(400)}`);
    expect(attribution.utm_campaign?.length).toBeLessThanOrEqual(128);
  });

  it('round-trips through session storage', () => {
    captureAttribution('?utm_source=referral&utm_campaign=spring');
    expect(storedAttribution()).toEqual({ utm_source: 'referral', utm_campaign: 'spring' });
  });

  /*
   * First touch wins. A visitor who arrives from a bar-association newsletter, reads the
   * samples, then comes back from a bookmark should still be attributed to the
   * newsletter — so a later visit with no parameters must not erase the first one.
   */
  it('keeps the first attribution rather than the most recent empty one', () => {
    captureAttribution('?utm_source=newsletter');
    captureAttribution('');
    expect(storedAttribution()).toEqual({ utm_source: 'newsletter' });
  });

  it('survives storage being unavailable', () => {
    vi.stubGlobal('sessionStorage', {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('denied');
      },
    });
    expect(() => captureAttribution('?utm_source=x')).not.toThrow();
    expect(storedAttribution()).toEqual({});
  });

  it('allowlists only campaign and referral keys, never anything case-shaped', () => {
    expect([...ATTRIBUTION_KEYS]).toEqual([
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'ref',
    ]);
  });
});

describe('track', () => {
  /*
   * A tracker that some other script put on the page is still not ours to feed. With no
   * website id the module must not reach for window.umami at all.
   */
  it('does nothing, and throws nothing, while no website id is configured', () => {
    expect(UMAMI_WEBSITE_ID).toBeNull();
    const sink = vi.fn();
    vi.stubGlobal('umami', { track: sink });
    expect(() => track('pricing_viewed')).not.toThrow();
    expect(sink).not.toHaveBeenCalled();
  });

  /*
   * Asserted on the payload rather than on the transport, because the transport does not
   * exist yet and the rule has to hold whichever one is chosen later.
   */
  it('refuses a property that is not a scalar', () => {
    expect(() => track('cta_clicked', { label: 'Schedule a call', position: 2 })).not.toThrow();
    expect(() =>
      // @ts-expect-error — the union forbids this at compile time; this asserts runtime too.
      track('cta_clicked', { records: ['Rivera', 'Okonkwo'] }),
    ).toThrow(/scalar/i);
  });

  it('refuses a property value long enough to be a case name or a document title', () => {
    expect(() => track('cta_clicked', { label: 'x'.repeat(200) })).toThrow(/too long/i);
  });
});

describe('click tracking', () => {
  /*
   * One delegated listener rather than an onClick threaded through Button and every
   * caller. Buttons on this site are anchors, the CTAs are spread over seven components,
   * and a per-call handler would mean a measurement change touching every one of them —
   * and silently missing the next CTA somebody adds.
   */
  it('describes a click on a link', () => {
    document.body.innerHTML = '<a href="/pricing/">See pricing</a>';
    const link = document.querySelector('a')!;
    expect(describeLinkClick(link)).toEqual({ label: 'See pricing', href: '/pricing/' });
  });

  /* The caret inside a Button is the actual event target, not the anchor. */
  it('resolves a click on something inside a link', () => {
    document.body.innerHTML = '<a href="/x/">Go <i class="caret"></i></a>';
    expect(describeLinkClick(document.querySelector('i'))).toEqual({ label: 'Go', href: '/x/' });
  });

  /*
   * The leak this module exists to prevent, caught in review before a provider was ever
   * named. /schedule-call/ composes the visitor's answers into a mailto: URL and renders
   * it as the primary button, so the raw href carries their name and firm well inside any
   * length cap. The scheme is the only part of such a link worth recording.
   */
  it('records the scheme of a mailto link and never its payload', () => {
    document.body.innerHTML =
      '<a href="mailto:hello@autolaw.ai?subject=Call%20request&body=Your%20name%3A%20Jane%20Hollingsworth%0AFirm%3A%20Hollingsworth%20and%20Reed">Send the message</a>';
    const click = describeLinkClick(document.querySelector('a'));
    expect(click).toEqual({ label: 'Send the message', href: 'mailto:' });
    expect(JSON.stringify(click)).not.toMatch(/Hollingsworth/);
  });

  it('keeps the path of an http link and drops what the visitor typed', () => {
    document.body.innerHTML =
      '<a href="/schedule-call/?practice=pi&name=Jane#form">Schedule a call</a>';
    expect(describeLinkClick(document.querySelector('a'))?.href).toBe('/schedule-call/');
  });

  it('ignores a click that is not on a link', () => {
    document.body.innerHTML = '<p>Not a link</p>';
    expect(describeLinkClick(document.querySelector('p'))).toBeNull();
  });

  it('truncates a label rather than sending whatever the link contains', () => {
    document.body.innerHTML = `<a href="/x/">${'y'.repeat(300)}</a>`;
    expect(describeLinkClick(document.querySelector('a'))!.label.length).toBeLessThanOrEqual(128);
  });

  it('emits one event per link click and stops when uninstalled', () => {
    const emit = vi.fn();
    document.body.innerHTML = '<a href="/pricing/">See pricing</a><p>text</p>';
    /* jsdom cannot navigate and logs a "Not implemented" error when an anchor's default
       action runs. The listener under test is passive, so cancelling the default changes
       nothing about it and keeps the suite output clean. */
    const swallow = (event: Event) => event.preventDefault();
    document.addEventListener('click', swallow);
    const stop = installClickTracking(document, emit);

    document.querySelector('a')!.click();
    expect(emit).toHaveBeenCalledWith('cta_clicked', { label: 'See pricing', href: '/pricing/' });

    (document.querySelector('p') as HTMLElement).click();
    expect(emit).toHaveBeenCalledTimes(1);

    stop();
    document.querySelector('a')!.click();
    expect(emit).toHaveBeenCalledTimes(1);
    document.removeEventListener('click', swallow);
  });
});

describe('startPageAnalytics', () => {
  it('records attribution, emits the page view, and starts listening', () => {
    const emit = vi.fn();
    document.body.innerHTML = '<a href="/pricing/">See pricing</a>';
    const swallow = (event: Event) => event.preventDefault();
    document.addEventListener('click', swallow);

    const stop = startPageAnalytics('pricing_viewed', {
      search: '?utm_source=newsletter',
      emit,
    });

    expect(storedAttribution()).toEqual({ utm_source: 'newsletter' });
    expect(emit).toHaveBeenCalledWith('pricing_viewed', {});
    document.querySelector('a')!.click();
    expect(emit).toHaveBeenCalledTimes(2);

    stop();
    document.removeEventListener('click', swallow);
  });

  it('still captures attribution on a page with no view event of its own', () => {
    const emit = vi.fn();
    const stop = startPageAnalytics(undefined, { search: '?utm_campaign=spring', emit });
    expect(storedAttribution()).toEqual({ utm_campaign: 'spring' });
    expect(emit).not.toHaveBeenCalled();
    stop();
  });
});

/*
 * Umami, once a build supplies a website id.
 *
 * config.ts reads the id when the module is evaluated, which is build time in production.
 * Each test here stubs the variable and imports a fresh copy of measure.ts, so the state
 * the module keeps (the queue, whether the tracker failed) starts empty every time.
 */
describe('Umami', () => {
  const TEST_ID = '0b5e2f8c-1d3a-4c6e-9f70-2a4b6c8d0e1f';
  const SCRIPT = 'script[src="https://cloud.umami.is/script.js"]';

  async function measureWith(id: string) {
    vi.stubEnv('VITE_UMAMI_WEBSITE_ID', id);
    vi.resetModules();
    return import('../measure');
  }

  const tracker = () => document.head.querySelector<HTMLScriptElement>(SCRIPT);

  /* What the tracker does on load: define window.umami, then fire the load event. */
  function trackerLoads(track = vi.fn()) {
    vi.stubGlobal('umami', { track });
    tracker()!.dispatchEvent(new Event('load'));
    return track;
  }

  afterEach(() => {
    document.head.querySelectorAll('script').forEach((s) => s.remove());
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('loads nothing when the id is unset or is not a website id', async () => {
    for (const id of ['', 'not-an-id', `${TEST_ID}"><script>`, '0b5e2f8c1d3a4c6e9f702a4b6c8d0e1f']) {
      const m = await measureWith(id);
      const stop = m.startPageAnalytics('landing_viewed', { emit: vi.fn() });
      stop();
      expect(tracker(), `id ${JSON.stringify(id)}`).toBeNull();
    }
  });

  /*
   * Every attribute is a privacy setting, not a preference. data-domains keeps a preview,
   * the run.app host, or a copy of the site from counting as visits to www.autolaw.ai.
   * do-not-track honours a browser that asks. exclude-search keeps page addresses free of
   * query strings, which is where a pasted link would carry anything typed into it, and
   * exclude-hash does the same for fragments. Error and performance reporting stay off: a
   * stack trace is not something a marketing tool needs from a law firm's browser.
   */
  it('loads the tracker once per page, with every privacy setting on', async () => {
    const m = await measureWith(TEST_ID);
    m.loadTracker();
    m.loadTracker();
    expect(document.head.querySelectorAll(SCRIPT)).toHaveLength(1);
    const script = tracker()!;
    expect({ ...script.dataset }).toEqual({
      websiteId: TEST_ID,
      domains: 'www.autolaw.ai',
      doNotTrack: 'true',
      excludeSearch: 'true',
      excludeHash: 'true',
    });
    expect(script.async || script.defer).toBe(true);
  });

  it('is loaded by every page entry', async () => {
    const m = await measureWith(TEST_ID);
    const stop = m.startPageAnalytics(undefined, { emit: vi.fn() });
    expect(tracker()).not.toBeNull();
    stop();
  });

  /*
   * The tracker arrives asynchronously, and the page view is emitted as the entry module
   * runs, so landing_viewed is nearly always sent before window.umami exists. Dropping it
   * would undercount the one event every funnel starts from. It is held until the tracker
   * loads and then sent, in order, with whatever came after it.
   */
  it('holds events sent before the tracker loads and delivers them in order', async () => {
    const m = await measureWith(TEST_ID);
    m.loadTracker();
    m.track('landing_viewed');
    m.track('cta_clicked', { label: 'Schedule a call', href: '/schedule-call/' });
    const send = trackerLoads();
    expect(send.mock.calls).toEqual([
      ['landing_viewed'],
      ['cta_clicked', { label: 'Schedule a call', href: '/schedule-call/' }],
    ]);
    m.track('pricing_viewed');
    expect(send).toHaveBeenLastCalledWith('pricing_viewed');
    expect(send).toHaveBeenCalledTimes(3);
  });

  it('sends the visit’s campaign attribution with each event', async () => {
    const m = await measureWith(TEST_ID);
    m.startPageAnalytics(undefined, { search: '?utm_source=bar_assoc&client=Rivera', emit: vi.fn() });
    const send = trackerLoads();
    m.track('report_card_selected', { report: 'chronology', destination: 'sample' });
    expect(send).toHaveBeenCalledWith('report_card_selected', {
      utm_source: 'bar_assoc',
      report: 'chronology',
      destination: 'sample',
    });
    expect(JSON.stringify(send.mock.calls)).not.toMatch(/Rivera/);
  });

  /*
   * Bounded, so a tracker that never loads and never errors (a stalled request, a proxy
   * that swallows it) cannot grow a list for the life of the tab. Ten is several times what
   * a page emits before a tracker that does load has arrived. The earliest are kept: the
   * page view is first, and it is the one that matters.
   */
  it('holds at most ten events, keeping the earliest', async () => {
    const m = await measureWith(TEST_ID);
    m.loadTracker();
    m.track('landing_viewed');
    for (let i = 0; i < 30; i += 1) m.track('cta_clicked', { label: `link ${i}`, href: '/x/' });
    const send = trackerLoads();
    expect(send).toHaveBeenCalledTimes(10);
    expect(send.mock.calls[0]).toEqual(['landing_viewed']);
  });

  /*
   * A content blocker, a network failure, or a CSP that does not list the host all end in
   * the script's error event. Nothing can be delivered after that, so nothing is kept.
   */
  it('drops what it was holding, and holds nothing more, when the tracker fails', async () => {
    const m = await measureWith(TEST_ID);
    m.loadTracker();
    m.track('landing_viewed');
    tracker()!.dispatchEvent(new Event('error'));
    m.track('pricing_viewed');
    const send = vi.fn();
    vi.stubGlobal('umami', { track: send });
    tracker()!.dispatchEvent(new Event('load'));
    expect(send).not.toHaveBeenCalled();
  });

  it('never throws into the page when the tracker does', async () => {
    const m = await measureWith(TEST_ID);
    m.loadTracker();
    trackerLoads(
      vi.fn(() => {
        throw new Error('tracker broke');
      }),
    );
    expect(() => m.track('pricing_viewed')).not.toThrow();
  });

  it('swallows a rejected send rather than leaving an unhandled rejection', async () => {
    const m = await measureWith(TEST_ID);
    m.loadTracker();
    const rejected = Promise.reject(new Error('offline'));
    const caught = vi.spyOn(rejected, 'catch');
    trackerLoads(vi.fn(() => rejected));
    m.track('pricing_viewed');
    expect(caught).toHaveBeenCalled();
    await rejected.catch(() => {});
  });

  /* The guards hold whichever transport is behind them. */
  it('still refuses a non-scalar or over-long property with a tracker on the page', async () => {
    const m = await measureWith(TEST_ID);
    m.loadTracker();
    const send = trackerLoads();
    // @ts-expect-error — the union forbids this at compile time; this asserts runtime too.
    expect(() => m.track('cta_clicked', { records: ['Rivera'] })).toThrow(/scalar/i);
    expect(() => m.track('cta_clicked', { label: 'x'.repeat(200) })).toThrow(/too long/i);
    expect(send).not.toHaveBeenCalled();
  });
});

describe('page entries', () => {
  const ROOT = process.cwd();
  const entries = (): string[] => {
    const config = readFileSync(join(ROOT, 'vite.config.ts'), 'utf8');
    const inputs = config.slice(config.indexOf('rollupOptions'));
    return [...inputs.matchAll(/__dirname,\s*['"]([^'"]+\.html)['"]/g)].map((m) => m[1]);
  };

  /*
   * The tracker is loaded by startPageAnalytics, so a page whose entry module forgets to
   * call it is a page no visit is ever counted on — and nothing else would notice.
   */
  it('start analytics from every page the build ships', () => {
    const pages = entries();
    expect(pages.length).toBeGreaterThan(20);
    const missing = pages.filter((page) => {
      const html = readFileSync(join(ROOT, page), 'utf8');
      const entry = /<script type="module" src="\/([^"]+)"/.exec(html)?.[1];
      return !entry || !/startPageAnalytics\(/.test(readFileSync(join(ROOT, entry), 'utf8'));
    });
    expect(missing).toEqual([]);
  });

  /*
   * Umami handles a click on any element carrying data-umami-event in the capture phase,
   * and on a link it cancels the navigation to send the event first. Every event on this
   * site goes through track() instead, so the attribute has no reason to appear.
   */
  it('use no data-umami-event attribute', () => {
    const walk = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
        d.isDirectory() ? (d.name === '__tests__' ? [] : walk(join(dir, d.name))) : [join(dir, d.name)],
      );
    const files = [...entries().map((page) => join(ROOT, page)), ...walk(join(ROOT, 'src')), ...walk(join(ROOT, 'product')), ...walk(join(ROOT, 'blog'))];
    const offenders = files.filter((f) => /\.(tsx?|html)$/.test(f) && readFileSync(f, 'utf8').includes('data-umami-event'));
    expect(files.length).toBeGreaterThan(50);
    expect(offenders).toEqual([]);
  });
});
