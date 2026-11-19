import { CANONICAL_HOST, UMAMI_SCRIPT_URL, UMAMI_WEBSITE_ID } from './config';

/**
 * Conversion measurement for the public site.
 *
 * Two rules shape every line of this file, and both come from who the visitors are.
 *
 * The first is that nothing confidential may reach a marketing endpoint. A visitor here
 * is a law firm, and the things they handle — client names, case captions, provider
 * names, document titles — must never travel to a third party because somebody appended
 * one to a link or passed the wrong variable to `track`. So the event name comes from a
 * closed union, properties are scalars with a length ceiling, and attribution is an
 * allowlist of exact keys rather than a prefix match. Anything else throws in
 * development rather than being quietly forwarded.
 *
 * The second is that measurement is off unless a build says otherwise. The vendor is
 * Umami Cloud, chosen because it sets no cookie and does not identify the visitor, and it
 * is switched on only by a website id in the build config (src/config.ts says where).
 * Without one, `track` is a no-op in production and a console line in development, and no
 * script is loaded. `loadTracker` and `deliver` below are the only code that knows Umami
 * exists; everything above them is the same whichever vendor is behind them.
 */

/**
 * Every event the public site emits. A closed union so that a typo is a compile error
 * and the full list of what we collect can be read in one place — which is the list that
 * goes in a privacy policy.
 */
export type AnalyticsEvent =
  | 'landing_viewed'
  | 'report_card_selected'
  | 'sample_viewed'
  | 'sample_downloaded'
  | 'pricing_viewed'
  | 'cta_clicked'
  | 'schedule_started';

export type AnalyticsProps = Record<string, string | number | boolean>;

/**
 * Exact keys, never a prefix test. `utm_campaign` is kept and `utm_campaign_note` is not,
 * because a prefix match would forward whatever someone decided to append.
 *
 * `gclid` and the other click ids are deliberately absent: they are vendor identifiers
 * for a vendor we do not use, and adding one is a decision to be taken with the privacy
 * policy open.
 */
export const ATTRIBUTION_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'ref',
] as const;

export type AttributionKey = (typeof ATTRIBUTION_KEYS)[number];
export type Attribution = Partial<Record<AttributionKey, string>>;

/** Long enough for a real campaign name, short enough that nothing else fits. */
const MAX_VALUE_LENGTH = 128;
const STORAGE_KEY = 'al.attribution';

/**
 * Storage access that cannot throw.
 *
 * Safari in private browsing, a locked-down enterprise profile, and a browser with site
 * data blocked all make sessionStorage throw on access rather than return null. A
 * marketing nicety must never be the reason a page fails to render, so every path
 * through this module treats storage as optional.
 */
function safeStorage(): Storage | null {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  } catch {
    return null;
  }
}

/** The allowlisted parameters in a query string, truncated. Pure; does not touch storage. */
export function attributionFrom(search: string): Attribution {
  const params = new URLSearchParams(search);
  const out: Attribution = {};
  for (const key of ATTRIBUTION_KEYS) {
    const value = params.get(key);
    if (value) out[key] = value.slice(0, MAX_VALUE_LENGTH);
  }
  return out;
}

/**
 * Records where this visit came from, first touch wins.
 *
 * A visitor who arrives from a bar-association newsletter, reads the samples, and comes
 * back later from a bookmark is still a newsletter visitor — so a later navigation with
 * no parameters must not overwrite the first one with nothing.
 */
export function captureAttribution(search: string = typeof location === 'undefined' ? '' : location.search): Attribution {
  const found = attributionFrom(search);
  const store = safeStorage();
  if (!store) return found;

  try {
    const existing = storedAttribution();
    if (Object.keys(existing).length > 0 || Object.keys(found).length === 0) return existing;
    store.setItem(STORAGE_KEY, JSON.stringify(found));
  } catch {
    /* Storage refused. The visit is still served; only the attribution is lost. */
  }
  return found;
}

export function storedAttribution(): Attribution {
  const store = safeStorage();
  if (!store) return {};
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    const out: Attribution = {};
    for (const key of ATTRIBUTION_KEYS) {
      const value = (parsed as Record<string, unknown>)[key];
      if (typeof value === 'string') out[key] = value.slice(0, MAX_VALUE_LENGTH);
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * Throws rather than sanitising.
 *
 * A property that is the wrong shape means a caller passed something it should not have,
 * and quietly dropping it would hide that until the day the check is loosened. Failing
 * in development is how the mistake gets found while someone is looking at it.
 */
function assertScalarProps(props: AnalyticsProps): void {
  for (const [key, value] of Object.entries(props)) {
    const type = typeof value;
    if (type !== 'string' && type !== 'number' && type !== 'boolean') {
      throw new TypeError(`analytics: "${key}" must be a scalar, received ${type}`);
    }
    if (type === 'string' && (value as string).length > MAX_VALUE_LENGTH) {
      throw new RangeError(
        `analytics: "${key}" is too long at ${(value as string).length} characters; nothing that size belongs in an event`,
      );
    }
  }
}

/** The part of Umami's tracker this module calls: `umami.track(name, data?)`. */
interface UmamiTracker {
  track(event: string, data?: AnalyticsProps): unknown;
}

/**
 * Events sent before the tracker has loaded, held until it does.
 *
 * The tracker is a script fetched from another host, so it arrives after the entry module
 * has run — and the entry module is what emits the page view. Without this, landing_viewed
 * and pricing_viewed would be lost on nearly every visit, which is every funnel's first
 * step. With it they are sent, in order, as soon as window.umami exists.
 *
 * Bounded and earliest-first: a page emits its view and perhaps a click or two before a
 * tracker that is going to load has loaded, so ten is generous, and a tracker that stalls
 * without ever erroring cannot grow this for the life of the tab. The view is first and is
 * the one worth keeping. A visitor who leaves before the tracker arrives takes the held
 * events with them, which is the right outcome for a visit that never finished loading.
 */
const MAX_HELD = 10;
const held: Array<[AnalyticsEvent, AnalyticsProps]> = [];
/* Blocked, offline, or refused by the CSP: nothing will be delivered, so nothing is held. */
let trackerFailed = false;

function umami(): UmamiTracker | null {
  try {
    const candidate = (window as Window & { umami?: UmamiTracker }).umami;
    return candidate && typeof candidate.track === 'function' ? candidate : null;
  } catch {
    return null;
  }
}

/*
 * Never the page's problem. The tracker catches its own network errors today, but it
 * returns a promise, and a later version that let one reject would otherwise surface as an
 * unhandled rejection on a law firm's screen.
 */
function send(tracker: UmamiTracker, event: AnalyticsEvent, props: AnalyticsProps): void {
  try {
    const result = Object.keys(props).length > 0 ? tracker.track(event, props) : tracker.track(event);
    if (result instanceof Promise) result.catch(() => {});
  } catch {
    /* Analytics never gets in the way of what the visitor was doing. */
  }
}

function releaseHeld(): void {
  const tracker = umami();
  if (!tracker) return;
  for (const [event, props] of held.splice(0)) send(tracker, event, props);
}

function trackerUnavailable(): void {
  trackerFailed = true;
  held.length = 0;
}

/**
 * Adds Umami's tracker to the page, once, when a website id is configured.
 *
 * Every attribute is a privacy setting. data-domains counts visits on the canonical host
 * only, so a Cloud Run preview or a local build sends nothing. data-do-not-track honours a
 * browser that asks. data-exclude-search and data-exclude-hash send page addresses — and
 * the referrer, which the tracker normalises the same way — without their query string or
 * fragment, for the reason safeHref below gives: a query says what someone typed. Error
 * and performance reporting are left at their default of off, so no stack trace or timing
 * data leaves the page. Campaign tags still arrive, through the allowlist above, as
 * properties of each event.
 */
export function loadTracker(doc: Document = document): void {
  if (!UMAMI_WEBSITE_ID) return;
  try {
    if (doc.querySelector('script[data-website-id]')) return;
    const script = doc.createElement('script');
    script.src = UMAMI_SCRIPT_URL;
    script.defer = true;
    script.dataset.websiteId = UMAMI_WEBSITE_ID;
    script.dataset.domains = CANONICAL_HOST;
    script.dataset.doNotTrack = 'true';
    script.dataset.excludeSearch = 'true';
    script.dataset.excludeHash = 'true';
    /* A script that loads but defines no tracker is as unavailable as one that fails. */
    script.addEventListener('load', () => (umami() ? releaseHeld() : trackerUnavailable()));
    script.addEventListener('error', trackerUnavailable);
    doc.head.appendChild(script);
  } catch {
    trackerUnavailable();
  }
}

/** The only place a provider is spoken to. */
function deliver(event: AnalyticsEvent, props: AnalyticsProps): void {
  if (!UMAMI_WEBSITE_ID) {
    if (import.meta.env?.DEV) console.debug('[analytics:inert]', event, props);
    return;
  }
  const tracker = umami();
  if (tracker) {
    /* window.umami exists from the moment the script runs, a tick before its load event. */
    releaseHeld();
    send(tracker, event, props);
    return;
  }
  if (!trackerFailed && held.length < MAX_HELD) held.push([event, props]);
}

export function track(event: AnalyticsEvent, props: AnalyticsProps = {}): void {
  assertScalarProps(props);
  deliver(event, { ...storedAttribution(), ...props });
}

export interface LinkClick {
  label: string;
  href: string;
}

/**
 * The link a click landed on, or null.
 *
 * `closest` rather than a direct tag check because the thing actually clicked is usually
 * inside the anchor — the caret span in a Button, the icon in a card — and a handler that
 * only recognised the anchor itself would miss most real clicks while appearing to work
 * in a test that clicked the anchor directly.
 */
export function describeLinkClick(target: EventTarget | null): LinkClick | null {
  if (!(target instanceof Element)) return null;
  const link = target.closest('a[href]');
  if (!link) return null;
  return {
    label: (link.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_VALUE_LENGTH),
    href: safeHref(link.getAttribute('href') ?? ''),
  };
}

/**
 * The destination of a link, with everything that is not a destination removed.
 *
 * A length cap is not a privacy control, and this is where that nearly went wrong.
 * /schedule-call/ composes the visitor's answers into a mailto: URL and renders it as the
 * primary button — so the raw href reads
 * `mailto:hello@autolaw.ai?subject=...&body=Your%20name%3A%20Jane%20...`, and the first
 * 128 characters of it contain the visitor's name and the start of their firm. Recording
 * that would have sent a named lead to a marketing endpoint from a module whose whole
 * purpose is to make that impossible.
 *
 * So: a non-http scheme is recorded as the scheme alone, and an http(s) href keeps its
 * path and loses its query and fragment. A path says where someone went, which is the
 * question. A query says what they typed, which is not.
 */
function safeHref(raw: string): string {
  const href = raw.trim();
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(href)?.[1]?.toLowerCase();
  if (scheme && scheme !== 'http' && scheme !== 'https') return `${scheme}:`;
  return href.split('#')[0].split('?')[0].slice(0, MAX_VALUE_LENGTH);
}

/**
 * One listener for every call to action on the page, installed once per entry point.
 *
 * The alternative — an onClick on Button, passed down from each of the seven components
 * that render one — would make a measurement change touch all of them and would silently
 * miss the next CTA somebody adds. Delegation means a new link is measured the moment it
 * renders.
 *
 * `emit` is injectable so the behaviour can be tested without a provider, and the
 * listener is passive and non-capturing so it cannot interfere with the navigation.
 */
export function installClickTracking(
  root: Document = document,
  emit: (event: AnalyticsEvent, props: AnalyticsProps) => void = track,
): () => void {
  const onClick = (event: Event) => {
    const link = describeLinkClick(event.target);
    if (link) emit('cta_clicked', { ...link });
  };
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}

/**
 * Everything an entry point needs, in one call.
 *
 * Attribution is captured on every page rather than only the home page, because a
 * visitor arriving from a bar-association newsletter is as likely to land on a product
 * page or the samples as on the root. A page with no view event of its own still calls
 * this, for exactly that reason.
 *
 * It is also where the tracker is loaded, so every entry point that measures anything
 * loads it, and src/__tests__/measure.test.ts checks that every page the build ships calls
 * this.
 *
 * Returns a disposer so a test can stop listening; entry points do not need it, since
 * the listener dies with the document.
 */
export function startPageAnalytics(
  view?: AnalyticsEvent,
  opts: {
    search?: string;
    root?: Document;
    emit?: (event: AnalyticsEvent, props: AnalyticsProps) => void;
  } = {},
): () => void {
  const emit = opts.emit ?? track;
  const root = opts.root ?? document;
  loadTracker(root);
  captureAttribution(opts.search ?? (typeof location === 'undefined' ? '' : location.search));
  if (view) emit(view, {});
  return installClickTracking(root, emit);
}
