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
    expect(within(detail).getByText(/DWC-1 claim form/i)).toBeInTheDocument();
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
    /*
     * Asserted as text, not as a button. The offer is a label here — rendering it as a
     * control made it focusable, announced as a button, and completely inert, which is
     * the opposite of what this section is arguing. What matters is that the panel offers
     * a records request instead of a page link, because there is no page to link to.
     */
    expect(within(detail).getByText(/draft records request/i)).toBeInTheDocument();
    expect(within(detail).queryByText(/^Open page/i)).not.toBeInTheDocument();
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
