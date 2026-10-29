import { beforeEach, describe, expect, it, vi } from 'vitest';
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
import { ANALYTICS_PROVIDER } from '../config';

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
 * The module is inert until ANALYTICS_PROVIDER names one. That is deliberate: the events
 * are worth defining and placing now, and choosing a vendor is a decision with privacy
 * consequences that nobody has made yet.
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
  it('does nothing, and throws nothing, while no provider is configured', () => {
    expect(ANALYTICS_PROVIDER).toBeNull();
    const sink = vi.fn();
    vi.stubGlobal('__alAnalytics', sink);
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
