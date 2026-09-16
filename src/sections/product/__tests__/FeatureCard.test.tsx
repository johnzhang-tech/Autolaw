import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeatureCard } from '../FeatureCard';
import type { Feature } from '../../../data/product';

const live: Feature = {
  id: 'demo', name: 'Medical Chronologies', line: 'One dated treatment story.',
  practice: 'both', phases: ['pre-lit'], availability: 'live',
  detail: ['Every visit in order.', 'Each entry cites its page.'], output: 'Word export',
};

const soon: Feature = { ...live, id: 'soon', name: 'Discovery Responses', availability: 'coming-next', output: 'Not yet available' };
const wcOnly: Feature = { ...live, id: 'wc', name: 'QME/AME Deep Analysis', practice: 'WC' };

describe('FeatureCard', () => {
  it('shows the name and the sales line before anything is opened', () => {
    render(<FeatureCard feature={live} practice="PI" />);
    expect(screen.getByRole('button', { name: /medical chronologies/i })).toBeInTheDocument();
    expect(screen.getByText('One dated treatment story.')).toBeInTheDocument();
  });

  it('keeps the detail collapsed until asked', () => {
    render(<FeatureCard feature={live} practice="PI" />);
    expect(screen.getByRole('button', { name: /medical chronologies/i })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Every visit in order.')).not.toBeInTheDocument();
  });

  it('opens and closes on click, and reports it', async () => {
    const user = userEvent.setup();
    render(<FeatureCard feature={live} practice="PI" />);
    const toggle = screen.getByRole('button', { name: /medical chronologies/i });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Every visit in order.')).toBeInTheDocument();
    expect(screen.getByText('Word export')).toBeInTheDocument();
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('labels a feature that is not live, and never labels one that is', () => {
    const { unmount } = render(<FeatureCard feature={soon} practice="PI" />);
    expect(screen.getByText('Coming next')).toBeInTheDocument();
    unmount();
    render(<FeatureCard feature={live} practice="PI" />);
    expect(screen.queryByText('Coming next')).not.toBeInTheDocument();
    expect(screen.queryByText('Early access')).not.toBeInTheDocument();
  });

  it('badges a feature that belongs to one practice only', () => {
    render(<FeatureCard feature={wcOnly} practice="PI" />);
    expect(screen.getByText('Workers’ comp')).toBeInTheDocument();
  });

  it('swaps in the practice-specific line when the visitor is on that practice', () => {
    const ledger: Feature = { ...live, id: 'ledger', line: 'PI line.', wcLine: 'WC line.' };
    const { unmount } = render(<FeatureCard feature={ledger} practice="WC" />);
    expect(screen.getByText('WC line.')).toBeInTheDocument();
    unmount();
    render(<FeatureCard feature={ledger} practice="PI" />);
    expect(screen.getByText('PI line.')).toBeInTheDocument();
  });
});
