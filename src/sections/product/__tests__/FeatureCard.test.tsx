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
const earlyAccess: Feature = { ...live, id: 'early', name: 'Accident & Injury Illustrations', availability: 'early-access' };
const tagAndBadge: Feature = { ...soon, id: 'both-parts', practice: 'WC' };

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

  it('labels an early-access feature too, not only a coming-next one', () => {
    render(<FeatureCard feature={earlyAccess} practice="PI" />);
    expect(screen.getByText('Early access')).toBeInTheDocument();
  });

  it('separates name, tag, and badge with real separators in the accessible name', () => {
    // Adjacent JSX expression children carry no whitespace text node between them, so
    // without a deliberate separator the button's accessible name runs the parts
    // together — this is the defect a reviewer caught in the first pass of this card.
    render(<FeatureCard feature={tagAndBadge} practice="PI" />);
    const toggle = screen.getByRole('button');
    expect(toggle).toHaveAccessibleName('Discovery Responses Coming next Workers’ comp');
  });

  it('does not show the output line while the card is collapsed', () => {
    render(<FeatureCard feature={live} practice="PI" />);
    expect(screen.queryByText('Word export')).not.toBeInTheDocument();
  });

  it('points aria-controls at the panel only once the panel exists', async () => {
    const user = userEvent.setup();
    render(<FeatureCard feature={live} practice="PI" />);
    const toggle = screen.getByRole('button', { name: /medical chronologies/i });
    expect(toggle).not.toHaveAttribute('aria-controls');

    await user.click(toggle);
    const panelId = toggle.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();
    expect(document.getElementById(panelId!)).toHaveClass('al-feat__panel');
  });

  it('renders the visual only in the open panel, and only when one is passed', async () => {
    const user = userEvent.setup();
    const { container, rerender } = render(
      <FeatureCard feature={live} practice="PI" visual={<div data-testid="chart">chart</div>} />,
    );
    // Collapsed: the visual does not exist yet, whatever the prop says.
    expect(container.querySelector('.al-feat__visual')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /medical chronologies/i }));
    expect(screen.getByTestId('chart')).toBeInTheDocument();
    expect(container.querySelector('.al-feat__visual')).toBeInTheDocument();

    // Same open panel (state survives the rerender), this time with no visual prop.
    rerender(<FeatureCard feature={live} practice="PI" />);
    expect(container.querySelector('.al-feat__visual')).not.toBeInTheDocument();
  });
});
