import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeatureCard } from '../FeatureCard';
import type { Feature } from '../../../data/product';

const live = {
  id: 'medical-chronologies',
  name: 'Medical Chronologies',
  icon: 'chronology',
  line: 'One dated treatment story.',
  practice: 'both',
  phases: ['pre-lit'],
  availability: 'live',
  detail: ['Every visit in order.', 'Each entry cites its page.'],
  output: 'Word export',
  slug: 'medical-chronologies',
} as Feature & { icon: 'chronology' };

const comingNext: Feature = {
  ...live,
  id: 'discovery-responses',
  name: 'Discovery Responses',
  availability: 'coming-next',
  output: 'Not yet available',
  slug: undefined,
};

describe('FeatureCard', () => {
  it('makes a routed feature one clear destination', () => {
    render(<FeatureCard feature={live} practice="PI" />);

    expect(screen.getByRole('link', { name: /medical chronologies/i })).toHaveAttribute(
      'href',
      '/product/medical-chronologies/',
    );
    expect(screen.getByText('One dated treatment story.')).toBeInTheDocument();
    expect(screen.getByTestId('product-icon-medical-chronologies')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not leak page detail or output into the home card', () => {
    render(<FeatureCard feature={live} practice="PI" />);

    expect(screen.queryByText('Every visit in order.')).not.toBeInTheDocument();
    expect(screen.queryByText('Word export')).not.toBeInTheDocument();
  });

  it('keeps a coming-next feature visible, labelled, and inert', () => {
    const { container } = render(<FeatureCard feature={comingNext} practice="PI" />);

    expect(screen.getByText('Discovery Responses')).toBeInTheDocument();
    expect(screen.getByText('Coming next')).toBeInTheDocument();
    expect(container.querySelector('[data-availability="coming-next"] a')).toBeNull();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('labels early access without weakening the destination', () => {
    render(
      <FeatureCard
        feature={{
          ...live,
          id: 'illustrations',
          name: 'Accident & Injury Illustrations',
          availability: 'early-access',
          slug: 'accident-and-injury-illustrations',
        }}
        practice="PI"
      />,
    );

    expect(screen.getByText('Early access')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /accident & injury illustrations/i })).toHaveAttribute(
      'href',
      '/product/accident-and-injury-illustrations/',
    );
  });

  it('badges a feature that belongs to one practice only', () => {
    render(<FeatureCard feature={{ ...live, practice: 'WC' }} practice="PI" />);
    expect(screen.getByText('Workers’ comp')).toBeInTheDocument();
  });

  it('uses the WC-specific line when the visitor chose workers’ compensation', () => {
    const ledger = { ...live, line: 'PI line.', wcLine: 'WC line.' };
    const { unmount } = render(<FeatureCard feature={ledger} practice="WC" />);
    expect(screen.getByText('WC line.')).toBeInTheDocument();

    unmount();
    render(<FeatureCard feature={ledger} practice="PI" />);
    expect(screen.getByText('PI line.')).toBeInTheDocument();
  });
});
