import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChronologyState, phaseFor, PHASE_EVENT } from '../ChronologyState';
import { CHRONOLOGY } from '../../../data/demoCase';
import { SCHEDULE_URL } from '../../../config';

describe('ChronologyState', () => {
  it('maps chapters 2, 3, 4 to connected, conflict, missing', () => {
    expect([phaseFor(2), phaseFor(3), phaseFor(4)]).toEqual(['connected', 'conflict', 'missing']);
    expect(CHRONOLOGY[PHASE_EVENT.conflict].title).toMatch(/modified duty/i);
    expect(CHRONOLOGY[PHASE_EVENT.missing].title).toMatch(/MRI/);
  });

  it('lists every event in date order with a document and page citation line', () => {
    render(<ChronologyState phase="connected" />);
    const events = screen.getAllByRole('button', { expanded: false }).concat(screen.getAllByRole('button', { expanded: true }));
    expect(events).toHaveLength(CHRONOLOGY.length);
    CHRONOLOGY.forEach((e) => {
      expect(screen.getByText(`${e.date} · ${e.source} · ${e.page}`)).toBeInTheDocument();
    });
  });

  it('opens the first event on connected and lets the reader select another', async () => {
    const user = userEvent.setup();
    render(<ChronologyState phase="connected" />);
    const card = screen.getByTestId('citation-card');
    // Event 0's source is the DWC-1 claim form (the demo data was corrected on 2026-08-05
    // to claim no more than its own sources say).
    expect(within(card).getByText(/DWC-1 claim form/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /qme evaluation/i }));
    expect(within(card).getByText(/4mm disc protrusion at L4–L5/)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { expanded: true })).toHaveLength(1);
  });

  it('on conflict, shows the PTP sentence on a page and the QME counterpart beneath it', () => {
    render(<ChronologyState phase="conflict" />);
    const card = screen.getByTestId('citation-card');
    expect(within(card).getByText(/may return to modified duty/)).toBeInTheDocument();
    expect(within(card).getByTestId('page-facsimile')).toBeInTheDocument();
    const counter = within(card).getByTestId('counterpart');
    expect(within(counter).getByText(/QME report — Dr\. A\. Reyes/)).toBeInTheDocument();
    expect(within(counter).getByText('page 22')).toBeInTheDocument();
    expect(within(counter).getByText(/remains temporarily totally disabled/)).toBeInTheDocument();
    expect(within(card).getByText(/does not pick a winner/i)).toBeInTheDocument();
  });

  it('on missing, names the needed document and no page to open', () => {
    render(<ChronologyState phase="missing" />);
    const card = screen.getByTestId('citation-card');
    expect(within(card).getByText(/referenced but never produced/i)).toBeInTheDocument();
    expect(within(card).getByText(/needed: imaging report/i)).toBeInTheDocument();
    expect(within(card).getByText(/needs review/i)).toBeInTheDocument();
    expect(within(card).queryByTestId('page-facsimile')).not.toBeInTheDocument();
  });

  it('follows a phase change by moving the selection, then yields to the reader again', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ChronologyState phase="connected" />);
    rerender(<ChronologyState phase="conflict" />);
    expect(screen.getByRole('button', { expanded: true })).toHaveAccessibleName(/modified duty/i);
    await user.click(screen.getByRole('button', { name: /initial evaluation/i }));
    expect(screen.getByRole('button', { expanded: true })).toHaveAccessibleName(/initial evaluation/i);
  });

  it('offers the call as the one live action while the trial is off', () => {
    render(<ChronologyState phase="connected" />);
    expect(screen.getByRole('link', { name: /on your own matter/i })).toHaveAttribute('href', SCHEDULE_URL);
    expect(screen.queryByRole('link', { name: /analyze one/i })).not.toBeInTheDocument();
  });
});
