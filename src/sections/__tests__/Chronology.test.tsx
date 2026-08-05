import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Chronology } from '../Chronology';

describe('Chronology', () => {
  it('shows the first event detail on mount', () => {
    render(<Chronology />);
    // Scoped to the detail panel: the first event's provider and source are the same
    // string, so an unscoped query matches the spine label too — and would pass even
    // if the detail panel were showing the wrong event.
    const detail = screen.getByTestId('chronology-detail');
    expect(within(detail).getByText(/employer incident report/i)).toBeInTheDocument();
  });

  it('reveals document, page and the cited sentence when an event is selected', async () => {
    const user = userEvent.setup();
    render(<Chronology />);
    await user.click(screen.getByRole('button', { name: /qme evaluation/i }));

    const detail = screen.getByTestId('chronology-detail');
    expect(within(detail).getByText(/QME report — Dr\. A\. Reyes/)).toBeInTheDocument();
    expect(within(detail).getByText('page 14')).toBeInTheDocument();
    expect(
      within(detail).getByText(/4mm disc protrusion at L4–L5/)
    ).toBeInTheDocument();
  });

  it('surfaces a conflict without resolving it', async () => {
    const user = userEvent.setup();
    render(<Chronology />);
    await user.click(screen.getByRole('button', { name: /released to modified duty/i }));

    const detail = screen.getByTestId('chronology-detail');
    expect(within(detail).getByText(/unresolved conflict/i)).toBeInTheDocument();
    expect(within(detail).getByText(/does not pick a winner/i)).toBeInTheDocument();
  });

  it('flags a record that is referenced but never produced', async () => {
    const user = userEvent.setup();
    render(<Chronology />);
    await user.click(screen.getByRole('button', { name: /MRI lumbar spine/i }));

    const detail = screen.getByTestId('chronology-detail');
    expect(within(detail).getByText(/referenced but never produced/i)).toBeInTheDocument();
    expect(within(detail).getByRole('button', { name: /draft records request/i })).toBeInTheDocument();
  });

  it('marks exactly one event as selected', async () => {
    const user = userEvent.setup();
    render(<Chronology />);
    await user.click(screen.getByRole('button', { name: /qme evaluation/i }));

    const selected = screen.getAllByRole('button', { expanded: true });
    expect(selected).toHaveLength(1);
    expect(selected[0]).toHaveAccessibleName(/qme evaluation/i);
  });
});
