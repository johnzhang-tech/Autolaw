import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { PlatformPage } from '../PlatformPage';
import { PLATFORM, PLATFORM_ADDS } from '../../../data/product';
import { CONTACT_SALES_URL, PRICING_URL, SECURITY_URL } from '../../../config';
import { renderedText } from '../../__tests__/renderedText';

/*
 * The page for a firm that wants the whole product rather than a report at a time.
 *
 * It exists because case-app's `reports_tier` is a restriction, not an add-on —
 * reports-tier-routes.ts is an allowlist and everything outside it returns 403 — so the
 * site was selling the cut-down tier as though it were the offer, and the full product
 * had one sentence on the pricing page.
 *
 * Two things this page must never do. It must not name a price or a pricing structure,
 * because there is no subscription billing in case-app at all and every platform tenant
 * is provisioned by hand. And it must not advertise a feature the product does not have:
 * the inclusion list is derived from FEATURES rather than typed, so it cannot drift.
 */

describe('PlatformPage', () => {
  it('lists what the platform adds, derived from the product', () => {
    render(<PlatformPage />);
    const adds = screen.getByTestId('platform-adds');
    expect(within(adds).getAllByRole('listitem')).toHaveLength(PLATFORM_ADDS.length);
    PLATFORM_ADDS.forEach((feature) => {
      expect(within(adds).getByRole('link', { name: new RegExp(feature.name, 'i') })).toHaveAttribute(
        'href',
        `/product/${feature.slug}/`,
      );
    });
  });

  it('names the firm-wide pieces that run under every feature', () => {
    render(<PlatformPage />);
    const strip = screen.getByTestId('platform-strip');
    PLATFORM.forEach((item) => expect(strip).toHaveTextContent(item.name));
  });

  /*
   * Said out loud rather than quietly implied. A reports-tier firm already has Ask AL,
   * scoped to reading and citing the case, so listing it as something the platform
   * "adds" would be the easy lie — and the first one a trial user would catch.
   */
  it('is honest that Ask AL is in both tiers', () => {
    const { container } = render(<PlatformPage />);
    expect(renderedText(container)).toMatch(/ask al/i);
    expect(within(screen.getByTestId('platform-adds')).queryByText(/^Ask AL$/)).toBeNull();
  });

  it('names no price and no pricing structure', () => {
    const { container } = render(<PlatformPage />);
    const text = renderedText(container);
    expect(text).not.toMatch(/\$\s?\d/);
    expect(text).not.toMatch(
      /priced per|\bper seat\b|\bper user\b|\bper month\b|\bper year\b|annual (?:licen[cs]e|contract|subscription|minimum)/i,
    );
  });

  it('routes an enquiry that already says what it is about', () => {
    render(<PlatformPage />);
    const main = screen.getByRole('main');
    expect(within(main).getAllByRole('link', { name: /talk to sales/i })[0]).toHaveAttribute(
      'href',
      CONTACT_SALES_URL,
    );
  });

  it('offers the smaller tier and the security answer without a call', () => {
    render(<PlatformPage />);
    const main = screen.getByRole('main');
    expect(within(main).getByRole('link', { name: /per report|pricing/i })).toHaveAttribute(
      'href',
      PRICING_URL,
    );
    expect(within(main).getByRole('link', { name: /trust center|security/i })).toHaveAttribute(
      'href',
      SECURITY_URL,
    );
  });
});
