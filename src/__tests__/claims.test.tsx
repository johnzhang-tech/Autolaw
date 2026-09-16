import { describe, it, expect } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ReactElement } from 'react';
import App from '../App';
import { SecurityPage } from '../pages/security/SecurityPage';
import { AboutPage } from '../pages/about/AboutPage';
import { ScheduleCallPage } from '../pages/schedule-call/ScheduleCallPage';
import { PrivacyPage } from '../pages/privacy/PrivacyPage';
import { TermsPage } from '../pages/terms/TermsPage';
import { FeaturePage } from '../pages/product/FeaturePage';
import { renderedText } from '../pages/__tests__/renderedText';
import { APP_ORIGIN, LOGIN_URL, TRIAL_ENABLED } from '../config';
import { AVAILABILITY_LABEL, FEATURES, ROUTED_FEATURES } from '../data/product';

/*
 * The claim guard. The credibility guard in credibility.test.tsx catches fabricated
 * assets — logos, stock photos, raw hosts. This one catches fabricated behaviour: a
 * sentence that says the product does something it does not do.
 *
 * Each phrase below was on the site on 2026-09-02 and was found, against case-app, to be
 * untrue. The reason is recorded beside it so the next person who wants the phrase back
 * knows what has to be true in the product first. See
 * docs/superpowers/specs/2026-09-02-autolaw-correction-release-design.md, "Claim audit".
 */
const RETIRED: ReadonlyArray<{ pattern: RegExp; reason: string }> = [
  {
    pattern: /draft(s|ed|ing)?\s+(the\s+|a\s+)?records?\s+request|records?\s+request\s+drafted/i,
    reason: 'the product lists what is needed with "Needed: {document type}"; it drafts nothing',
  },
  {
    pattern: /separate\s+products?|two\s+products|own\s+intake/i,
    reason: 'PI and WC are two template configurations on one engine; the internal spec forbids separate products',
  },
  {
    pattern: /intake\s+calls?/i,
    reason: 'Smart Intake is flag-disabled in production',
  },
  {
    pattern: /case\s+brain/i,
    reason: 'retired name; the application says "Case memory"',
  },
  {
    pattern: /\bcertified\b/i,
    reason: 'HIPAA has no certifying body, and SOC 2 is an attestation',
  },
  {
    pattern: /upload\s+(a|one)\s+(single\s+)?case\s+file/i,
    reason: 'the trial accepts one medical-legal or narrative report, not a case file',
  },
  {
    pattern: /suggested\s+questions|streaming|generate\s+documents|compute\s+action/i,
    reason: 'Ask AL roadmap items, not shipped behaviour',
  },
  {
    pattern: /medically\s+validated|expert[- ]reviewed|court[- ]admissible|clinician[- ]approved|\b3D\b|surgical[- ]procedure/i,
    reason: 'the illustration pilot has evidence controls, not medical, expert, court, 3D, or surgical validation claims',
  },
  {
    pattern: /(?:illustration.{0,100}\b\d+(?:\.\d+)?%|\b\d+(?:\.\d+)?%.{0,100}illustration)/i,
    reason: 'the illustration corpus is directional and does not support a published accuracy percentage',
  },
];

type PageFactory = () => ReactElement;

const PAGES: ReadonlyArray<[string, PageFactory]> = [
  ['home', () => <App />],
  ['security', () => <SecurityPage />],
  ['about', () => <AboutPage />],
  ['schedule-call', () => <ScheduleCallPage />],
  ['privacy', () => <PrivacyPage />],
  ['terms', () => <TermsPage />],
  ...ROUTED_FEATURES.map((feature) => [
    `product/${feature.slug}`,
    () => <FeaturePage id={feature.id} />,
  ] as [string, PageFactory]),
];

const ROOT = process.cwd();
const HTML = [
  'index.html',
  'security/index.html',
  'about/index.html',
  'schedule-call/index.html',
  'privacy/index.html',
  'terms/index.html',
  ...ROUTED_FEATURES.map((feature) => `product/${feature.slug}/index.html`),
];

function pageText(page: PageFactory): string {
  const { container } = render(page());
  const text = renderedText(container);
  cleanup();
  return text;
}

describe('claim guard', () => {
  /*
   * Non-vacuity first. A guard that scans an empty string passes forever, so the home
   * page has to render a substantial amount of text before the phrase checks mean anything.
   */
  it('renders enough text for the scan to be meaningful', () => {
    expect(pageText(() => <App />).length).toBeGreaterThan(4000);
  });

  for (const [name, page] of PAGES) {
    it(`${name} makes no retired claim`, () => {
      const text = pageText(page);
      const hits = RETIRED.filter((r) => r.pattern.test(text)).map((r) => `${r.pattern} — ${r.reason}`);
      expect(hits).toEqual([]);
    });
  }

  it('keeps every non-live feature inside a card carrying its availability label', () => {
    const { container } = render(<App />);
    const cards = [...container.querySelectorAll<HTMLElement>('[data-testid="feature-card"]')];

    FEATURES.filter((feature) => feature.availability !== 'live').forEach((feature) => {
      const matches = cards.filter((card) => card.textContent?.includes(feature.name));
      expect(matches.length, `${feature.name} has no home-page card`).toBeGreaterThan(0);
      matches.forEach((card) => {
        expect(card).toHaveTextContent(AVAILABILITY_LABEL[feature.availability]);
      });
    });
  });

  /*
   * The four HTML entries carry <title>, description, and og:description — the copy a
   * search result or a forwarded link shows before anyone reaches the page. Scanned raw,
   * because the phrases live in attributes that a rendered-text walk never sees.
   */
  for (const file of HTML) {
    it(`${file} makes no retired claim in its metadata`, () => {
      const html = readFileSync(join(ROOT, file), 'utf8');
      const hits = RETIRED.filter((r) => r.pattern.test(html)).map((r) => `${r.pattern} — ${r.reason}`);
      expect(hits).toEqual([]);
    });
  }
});

describe('dead-destination guard', () => {
  /*
   * app.autolaw.ai has no DNS record and /trial is gated off by TRIAL_SIGNUP_ENABLED on
   * case-app. While both are true, nothing on the site may link into the application:
   * a primary CTA that opens a browser error is worse than no CTA, and a "Log in" that
   * fails is the first thing an existing customer would try.
   */
  it('keeps the trial switch off and the login URL unset until the host resolves', () => {
    expect(TRIAL_ENABLED).toBe(false);
    expect(LOGIN_URL).toBeNull();
  });

  for (const [name, page] of PAGES) {
    it(`${name} links nowhere into the application while the switches are off`, () => {
      const { container } = render(page());
      const into = [...container.querySelectorAll<HTMLAnchorElement>('a[href]')]
        .map((a) => a.getAttribute('href') ?? '')
        .filter((href) => href.startsWith(APP_ORIGIN));
      expect(into).toEqual([]);
      cleanup();
    });
  }

  it('offers no trial CTA and no login link on the home page', () => {
    const { queryAllByRole } = render(<App />);
    expect(queryAllByRole('link', { name: /analyze one/i })).toEqual([]);
    expect(queryAllByRole('link', { name: /log in/i })).toEqual([]);
  });
});
