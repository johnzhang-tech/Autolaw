import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PracticeSolutions } from '../PracticeSolutions';

describe('PracticeSolutions', () => {
  it('defaults to personal injury', () => {
    render(<PracticeSolutions />);
    expect(screen.getByRole('tab', { name: /personal injury/i })).toHaveAttribute('aria-selected', 'true');
  });

  it('swaps to workers compensation outputs, not relabelled PI copy', async () => {
    const user = userEvent.setup();
    render(<PracticeSolutions />);
    await user.click(screen.getByRole('tab', { name: /workers/i }));

    const panel = screen.getByRole('tabpanel');
    expect(within(panel).getByText(/QME\/AME vs PTP/i)).toBeInTheDocument();
    expect(within(panel).getByText(/apportionment/i)).toBeInTheDocument();
    expect(within(panel).queryByText(/demand narrative/i)).not.toBeInTheDocument();
  });

  it('moves between tabs with arrow keys', async () => {
    const user = userEvent.setup();
    render(<PracticeSolutions />);
    screen.getByRole('tab', { name: /personal injury/i }).focus();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('tab', { name: /workers/i })).toHaveFocus();
    expect(screen.getByRole('tab', { name: /workers/i })).toHaveAttribute('aria-selected', 'true');
  });

  it('shows exactly one panel at a time', async () => {
    const user = userEvent.setup();
    render(<PracticeSolutions />);
    await user.click(screen.getByRole('tab', { name: /workers/i }));
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
  });
});
