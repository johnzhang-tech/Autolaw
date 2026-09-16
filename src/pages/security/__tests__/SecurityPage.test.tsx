import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { SecurityPage } from '../SecurityPage';
import { CERTIFICATIONS } from '../../../config';
import { CITATION_KINDS } from '../../../data/demoCase';
import { renderedText } from '../../__tests__/renderedText';

/*
 * renderedText, not textContent: textContent glues adjacent elements together, which
 * removes the word boundary every \b below depends on. See the note in renderedText.ts —
 * this exact mistake made the About page's sibling guard unable to fail.
 */
const pageText = () => renderedText(screen.getByRole('main'));

describe('SecurityPage — the controls it claims', () => {
  it('answers the firm’s three questions first, in order', () => {
    render(<SecurityPage />);
    const headings = [...screen.getByRole('main').querySelectorAll('section h2')]
      .map((heading) => heading.textContent?.trim());

    expect(headings.slice(0, 3)).toEqual([
      'Does my client’s medical data stay private?',
      'Does my case train your model?',
      'What should I tell my client?',
    ]);
  });

  it('states every control on the verified list', () => {
    render(<SecurityPage />);
    const main = within(screen.getByRole('main'));

    // Tenant isolation, in the language an attorney uses rather than the language a
    // vendor uses — and specifically that the rule is server-side.
    expect(main.getByText(/belongs to exactly one firm/i)).toBeInTheDocument();
    // Server-side, stated as the contrast that makes it meaningful — the section intro
    // says it too, so this is matched on the sentence only the control card carries.
    expect(
      main.getByText(/enforced on our servers — not by hiding things in the browser/i)
    ).toBeInTheDocument();

    // Auditable access
    expect(main.getByText(/who opened which document, and when, is recorded and reviewable/i)).toBeInTheDocument();

    // No training on case content
    expect(main.getByText(/never used to train or fine-tune any model/i)).toBeInTheDocument();

    // Human confirmation, and the legal reason for it
    expect(main.getByText(/someone at your firm confirms it before it counts as a fact/i)).toBeInTheDocument();
    expect(main.getByText(/statute-of-limitations and jurisdictional consequences/i)).toBeInTheDocument();

    // Conflicts and uncited findings
    expect(main.getByText(/both stay visible, each with its own date and source/i)).toBeInTheDocument();
    expect(main.getByText(/stays visibly separate from findings that cite one/i)).toBeInTheDocument();

    // Dropbox
    expect(main.getByText(/connects to Dropbox/i)).toBeInTheDocument();
  });

  it('shows the certification badges from config rather than hardcoded copy', () => {
    render(<SecurityPage />);
    // Scoped to the badge list: the same labels appear again in the certifications
    // section below, and an unscoped query would pass on either one.
    const badges = within(screen.getByRole('list', { name: 'Attestations and safeguards' }));
    expect(CERTIFICATIONS.length).toBeGreaterThan(0);
    CERTIFICATIONS.forEach((c) => {
      expect(badges.getByText(c.label)).toBeInTheDocument();
      expect(badges.getByText(c.detail)).toBeInTheDocument();
    });
  });

  it('states retention as the in-app policy states it, and nothing more specific', () => {
    render(<SecurityPage />);
    const data = within(screen.getByRole('region', { name: /does my client’s medical data stay private/i }));
    expect(data.getByRole('heading', { name: /retention/i })).toBeInTheDocument();
    expect(data.getByText(/deleted within 90 days of an account ending/i)).toBeInTheDocument();
  });

  it('lists the seven citation kinds as the form grounding takes', () => {
    render(<SecurityPage />);
    const limits = within(screen.getByRole('region', { name: /does my case train your model/i }));
    CITATION_KINDS.forEach((k) => expect(limits.getByText(k)).toBeInTheDocument());
  });

  it('routes a reviewer to a person, for the report and for a BAA', () => {
    render(<SecurityPage />);
    const main = within(screen.getByRole('main'));
    expect(main.getByRole('link', { name: /email hello@autolaw\.ai/i })).toHaveAttribute(
      'href',
      expect.stringContaining('mailto:hello@autolaw.ai')
    );
    expect(main.getByRole('link', { name: /schedule a call/i })).toHaveAttribute('href', '/schedule-call/');
  });

  it('frames privilege, disclosure, and costs as questions and points to current State Bar guidance', () => {
    render(<SecurityPage />);
    const ethics = within(screen.getByRole('region', { name: /what should I tell my client/i }));

    expect(ethics.getByRole('heading', { name: /could this affect confidentiality or privilege/i })).toBeInTheDocument();
    expect(ethics.getByRole('heading', { name: /when should I tell my client/i })).toBeInTheDocument();
    expect(ethics.getByRole('heading', { name: /may AI costs be passed through/i })).toBeInTheDocument();
    expect(ethics.getByRole('link', { name: /state bar.*practical guidance/i })).toHaveAttribute(
      'href',
      expect.stringMatching(/^https:\/\/www\.calbar\.ca\.gov\//),
    );
    expect(ethics.getByText(/questions to take to your firm’s ethics counsel/i)).toBeInTheDocument();
  });

  it('states the early-access illustration controls without an accuracy percentage', () => {
    render(<SecurityPage />);
    const illustrations = within(screen.getByRole('region', { name: /how does the illustration pilot keep the evidence in charge/i }));

    expect(illustrations.getByText('Early access')).toBeInTheDocument();
    expect(illustrations.getByText(/refuses to start when the record is too thin/i)).toBeInTheDocument();
    expect(illustrations.getByText(/re-inspects each render/i)).toBeInTheDocument();
    expect(illustrations.getByText(/parks a failed render for attorney review/i)).toBeInTheDocument();
    expect(illustrations.getByText(/hash-verifies the locked exhibit/i)).toBeInTheDocument();
  });
});

describe('SecurityPage — the HIPAA wording', () => {
  /*
   * The single most dangerous sentence on this page is the one that puts HIPAA next to
   * SOC 2 as if they were the same kind of thing. SOC 2 Type II is an audited attestation
   * by an outside firm. HIPAA has no certifying body at all — so "HIPAA certified" is a
   * claim nobody on earth can issue, and the reviewer reading this page is exactly the
   * person who knows that. Getting it wrong does not just overstate one control; it tells
   * them the rest of the page was written by someone who does not know the difference.
   */
  it('never claims HIPAA certification or compliance', () => {
    render(<SecurityPage />);
    const forbidden = [
      /HIPAA[\s-]?certified/i,
      /HIPAA[\s-]?certification/i,
      /HIPAA[\s-]?compliant/i,
      /HIPAA[\s-]?compliance/i,
      /certified[\s\S]{0,20}HIPAA/i,
    ];
    const hits = forbidden.filter((re) => re.test(pageText()));
    expect(hits.map(String)).toEqual([]);
  });

  it('says outright that no HIPAA certifying body exists, and offers a BAA instead', () => {
    render(<SecurityPage />);
    const main = within(screen.getByRole('main'));
    expect(main.getByText(/no certifying body for HIPAA/i)).toBeInTheDocument();
    expect(main.getByText(/business associate agreement, signed on request/i)).toBeInTheDocument();
    // And it says so *as a difference from* the SOC 2 claim above it, not as a footnote.
    expect(main.getByText(/not the same kind of thing as the SOC/i)).toBeInTheDocument();
  });

  it('claims SOC 2 Type II as the audited attestation it is, available under NDA', () => {
    render(<SecurityPage />);
    const certs = within(screen.getByRole('region', { name: /what we have been audited against/i }));
    expect(certs.getByText(/an audited attestation, issued\s+by an outside firm/i)).toBeInTheDocument();
    expect(certs.getByText(/report is available under NDA/i)).toBeInTheDocument();
  });
});

/*
 * The guard that matters most, and the one to extend rather than route around.
 *
 * Everything on /security/ has to be a control that already exists in case-app. The
 * failure mode is not malice, it is helpfulness: the next person to touch this page will
 * feel the gap where a reviewer expects an encryption standard or a retention window, and
 * will fill it with the industry-standard answer because it is almost certainly true. It
 * is still a claim nobody verified, on the one page a buyer's reviewer reads adversarially.
 *
 * So the vocabulary of unverified claims is banned outright. If one of these becomes real
 * — an actual retention policy, an actual pen-test cadence — delete its line here in the
 * same commit that adds the copy, and the deletion is the record that someone checked.
 *
 * retention and the 90-day window were removed on 2026-09-03: the in-app privacy policy §6
 * states them, so they are now on the verified list.
 */
const UNVERIFIED: Array<[string, RegExp]> = [
  ['encryption specifics', /\bencrypt/i],
  ['transport or storage crypto', /\bTLS\b|\bAES\b|\bat rest\b|\bin transit\b/i],
  ['penetration testing', /\bpen(etration)?[\s-]?test/i],
  ['named sub-processors', /\bsub[\s-]?processor/i],
  ['a hosting provider or region', /\bAWS\b|\bGoogle Cloud\b|\bAzure\b|\bdata residency\b|\bregion\b/i],
  ['service levels', /\bSLA\b|\buptime\b|\b99\.\d/],
  ['other frameworks', /\bISO[\s-]?27001\b|\bGDPR\b|\bCCPA\b|\bPCI\b|\bFedRAMP\b/i],
  ['authentication features', /\bSSO\b|\bsingle sign[\s-]?on\b|\bMFA\b|\btwo[\s-]?factor\b|\brole[\s-]?based\b/i],
  ['backup or recovery', /\bbackup|\bdisaster recovery\b/i],
  ['incident commitments', /\bincident response\b|\bbreach notification\b/i],
  ['staffing controls', /\bbackground check|\bsecurity training\b/i],
  ['marketing absolutes', /\bbank[\s-]?level\b|\bmilitary[\s-]?grade\b|\bunhackable\b|\b100% secure\b/i],
  ['illustration overclaims', /medically\s+validated|expert[- ]reviewed|court[- ]admissible|clinician[- ]approved|\b3D\b|surgical[- ]procedure|(?:illustration.{0,100}\b\d+(?:\.\d+)?%|\b\d+(?:\.\d+)?%.{0,100}illustration)/i],
];

describe('SecurityPage — claims not on the verified list', () => {
  it('makes none of them', () => {
    render(<SecurityPage />);
    const text = pageText();
    // Non-vacuity: an empty page would satisfy every rule below.
    expect(text.length).toBeGreaterThan(1500);

    const found = UNVERIFIED.filter(([, re]) => re.test(text)).map(
      ([what, re]) => `${what} — matched ${re} in "${text.match(re)?.[0]}"`
    );
    expect(found).toEqual([]);
  });

  it('answers the gap with the report rather than with a number', () => {
    render(<SecurityPage />);
    // The reviewer's next question has a destination, and it is the NDA'd report — not an
    // invented specific, and not silence.
    expect(within(screen.getByRole('main')).getAllByText(/under NDA/i).length).toBeGreaterThan(1);
  });
});
