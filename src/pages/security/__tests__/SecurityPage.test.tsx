import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { SecurityPage } from '../SecurityPage';
import { CERTIFICATIONS, CONTACT_EMAIL } from '../../../config';
import { AI_CARDS, AUDIT_CARDS, PRIVACY_CARDS, REVIEWER_COMMITMENTS, SECTION_INTROS } from '../../../data/trust';
import { renderedText } from '../../__tests__/renderedText';
import { guardHits, guardText } from './trustGuard';

/*
 * renderedText, not textContent: textContent glues adjacent elements together, which
 * removes the word boundary every \b below depends on. See the note in renderedText.ts.
 *
 * Rewritten 2026-10-03. The previous version asserted four claims that were not true:
 * an existing SOC 2 Type II report, a BAA signed on request, deletion within 90 days,
 * and a person confirming every value before it counts as a fact. Every assertion below
 * matches a statement in src/data/trust.ts, which names its evidence.
 */
const pageText = () => renderedText(screen.getByRole('main'));
const region = (name: RegExp) => within(screen.getByRole('region', { name }));

describe('SecurityPage — the Trust Center', () => {
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

  it('renders every privacy card from the trust data, with its planned items', () => {
    render(<SecurityPage />);
    const privacy = region(/does my client’s medical data stay private/i);
    PRIVACY_CARDS.forEach((c) => {
      expect(privacy.getByRole('heading', { name: c.title })).toBeInTheDocument();
      expect(privacy.getByText(c.body)).toBeInTheDocument();
      (c.commitments ?? []).forEach((x) => expect(privacy.getByText(x.text)).toBeInTheDocument());
    });
    expect(privacy.getAllByText('Planned · Q1 2027').length).toBe(2);
    expect(privacy.getByText(SECTION_INTROS.privacy.text)).toBeInTheDocument();
  });

  it('renders every model card and links to the AI and subprocessor pages', () => {
    render(<SecurityPage />);
    const model = region(/does my case train your model/i);
    AI_CARDS.forEach((c) => expect(model.getByText(c.body)).toBeInTheDocument());
    expect(model.getByText(SECTION_INTROS.model.text)).toBeInTheDocument();
    expect(model.getByRole('link', { name: /how autolaw uses ai/i })).toHaveAttribute('href', '/security/ai/');
    expect(model.getByRole('link', { name: /every subprocessor/i })).toHaveAttribute('href', '/security/subprocessors/');
  });

  it('states retention without a deletion window', () => {
    render(<SecurityPage />);
    const privacy = region(/does my client’s medical data stay private/i);
    expect(privacy.getByRole('heading', { name: /retention and deletion/i })).toBeInTheDocument();
    expect(pageText()).not.toMatch(/\b\d+\s+days\s+of\s+an\s+account/i);
  });

  it('shows the badges from config rather than hardcoded copy', () => {
    render(<SecurityPage />);
    const badges = within(screen.getByRole('list', { name: 'Audits and agreements' }));
    expect(CERTIFICATIONS.length).toBeGreaterThan(0);
    CERTIFICATIONS.forEach((c) => {
      expect(badges.getByText(c.label)).toBeInTheDocument();
      expect(badges.getByText(c.detail)).toBeInTheDocument();
    });
  });

  it('routes a reviewer to a person for the Trust Pack', () => {
    render(<SecurityPage />);
    const main = within(screen.getByRole('main'));
    const emailName = new RegExp(`email ${CONTACT_EMAIL.replace(/[.]/g, '\\.')}`, 'i');
    expect(main.getByRole('link', { name: emailName })).toHaveAttribute('href', expect.stringContaining(`mailto:${CONTACT_EMAIL}`));
    expect(main.getByRole('link', { name: /schedule a call/i })).toHaveAttribute('href', '/schedule-call/');
    expect(main.getAllByText(/Trust Pack/).length).toBeGreaterThan(1);
    expect(main.getByText(REVIEWER_COMMITMENTS[0].text)).toBeInTheDocument();
  });

  it('frames privilege, disclosure, and costs as questions and points to current State Bar guidance', () => {
    render(<SecurityPage />);
    const ethics = region(/what should I tell my client/i);
    expect(ethics.getByRole('heading', { name: /could this affect confidentiality or privilege/i })).toBeInTheDocument();
    expect(ethics.getByRole('heading', { name: /when should I tell my client/i })).toBeInTheDocument();
    expect(ethics.getByRole('heading', { name: /may AI costs be passed through/i })).toBeInTheDocument();
    expect(ethics.getByText(/questions to take to your firm’s ethics counsel/i)).toBeInTheDocument();
    expect(ethics.getByRole('link', { name: /state bar.*practical guidance/i })).toHaveAttribute(
      'href',
      expect.stringMatching(/^https:\/\/www\.calbar\.ca\.gov\//),
    );
  });

  it('keeps the early-access illustration controls unchanged', () => {
    render(<SecurityPage />);
    const illustrations = region(/how does the illustration pilot keep the evidence in charge/i);
    expect(illustrations.getByText('Early access')).toBeInTheDocument();
    expect(illustrations.getByText(/refuses to start when the record is too thin/i)).toBeInTheDocument();
    expect(illustrations.getByText(/hash-verifies the locked exhibit/i)).toBeInTheDocument();
    expect(illustrations.getByText(/re-inspects each render/i)).toBeInTheDocument();
    expect(illustrations.getByText(/parks a failed render for attorney review/i)).toBeInTheDocument();
  });
});

describe('SecurityPage — audits and agreements', () => {
  it('never claims HIPAA certification or compliance', () => {
    render(<SecurityPage />);
    const forbidden = [
      /HIPAA[\s-]?certified/i,
      /HIPAA[\s-]?certification/i,
      /HIPAA[\s-]?compliant/i,
      /HIPAA[\s-]?compliance/i,
      /certified[\s\S]{0,20}HIPAA/i,
    ];
    expect(forbidden.filter((re) => re.test(pageText())).map(String)).toEqual([]);
  });

  it('says no HIPAA certifying body exists and dates the business associate agreement', () => {
    render(<SecurityPage />);
    const certs = region(/what has been audited/i);
    AUDIT_CARDS.forEach((c) => expect(certs.getByText(c.body)).toBeInTheDocument());
    expect(certs.getByText(/no certifying body for HIPAA/i)).toBeInTheDocument();
  });

  it('describes SOC 2 as in preparation, never as a report that exists', () => {
    render(<SecurityPage />);
    const text = pageText();
    expect(text).toMatch(/preparing for its SOC 2 audit/i);
    expect(text).not.toMatch(/SOC\s*2\s*Type\s*II/i);
    expect(text).not.toMatch(/report is available/i);
  });
});

describe('SecurityPage — vocabulary not yet verified', () => {
  it('uses none of it, and no NDA-only detail', () => {
    render(<SecurityPage />);
    const text = guardText(screen.getByRole('main'));
    expect(text.length).toBeGreaterThan(1500);
    expect(guardHits(text)).toEqual([]);
  });

  it('names MFA, SSO and incident response only inside a planned item', () => {
    render(<SecurityPage />);
    expect(pageText()).toMatch(/Multi-factor authentication/);
    expect(pageText()).toMatch(/incident-response plan/);
    expect(guardHits(guardText(screen.getByRole('main')))).toEqual([]);
  });
});
