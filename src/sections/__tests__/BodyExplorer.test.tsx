import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BodyExplorer } from '../BodyExplorer';

describe('BodyExplorer', () => {
  it('opens on the lumbar region in plain English', () => {
    render(<BodyExplorer />);
    // Re-pointed from "pressing on a nerve", which was removed: no document in the demo
    // file states nerve-root compression. The plain-English layer is still what is being
    // asserted here — this phrase appears only in the lumbar region's `plain` text.
    expect(
      screen.getByText(/bulges into the opening the nerve root passes through/i)
    ).toBeInTheDocument();
  });

  it('swaps content when another region is selected', async () => {
    const user = userEvent.setup();
    render(<BodyExplorer />);
    await user.click(screen.getByRole('button', { name: /left shoulder/i }));

    const panel = screen.getByTestId('body-detail');
    expect(within(panel).getByText(/rotator cuff is partially torn/i)).toBeInTheDocument();
  });

  it('keeps an unaccepted region visible rather than hiding it', async () => {
    const user = userEvent.setup();
    render(<BodyExplorer />);
    await user.click(screen.getByRole('button', { name: /cervical spine/i }));

    const panel = screen.getByTestId('body-detail');
    // getAllByText, not getByText: the status now appears both in the plain-English
    // sentence and in the Claim status row, and a single-match query would throw.
    expect(within(panel).getAllByText(/not an accepted body part/i).length).toBeGreaterThan(0);
    expect(within(panel).getByText(/records still reference it/i)).toBeInTheDocument();
  });

  it('moves between regions with arrow keys', async () => {
    const user = userEvent.setup();
    render(<BodyExplorer />);
    const first = screen.getByRole('button', { name: /cervical spine/i });
    first.focus();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('button', { name: /left shoulder/i })).toHaveFocus();
  });

  it('cites a source on every row', async () => {
    render(<BodyExplorer />);
    const panel = screen.getByTestId('body-detail');
    const cites = within(panel).getAllByTestId('cite');
    expect(cites.length).toBeGreaterThan(0);
    cites.forEach((c) => expect(c.textContent?.trim()).not.toBe(''));
  });
});
