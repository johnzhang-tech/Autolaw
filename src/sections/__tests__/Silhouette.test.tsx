import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Silhouette, SIL_ORDER, HITS } from '../Silhouette';
import { BODY_REGIONS, type BodyRegion } from '../../data/demoCase';

describe('Silhouette', () => {
  it('draws every region as a named button carrying its status in words', () => {
    render(<Silhouette />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(BODY_REGIONS.length);
    buttons.forEach((b) => expect(b).toHaveAccessibleName(/accepted body part|not an accepted body part|disputed/i));
  });

  it('opens on the lumbar spine and swaps on selection', async () => {
    const user = userEvent.setup();
    render(<Silhouette />);
    const detail = screen.getByTestId('sil-detail');
    expect(within(detail).getByRole('heading', { name: /lumbar spine/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /left shoulder/i }));
    expect(within(detail).getByText(/rotator cuff is partially torn/i)).toBeInTheDocument();
  });

  it('keeps a region with no records visible and says so', async () => {
    const user = userEvent.setup();
    render(<Silhouette />);
    await user.click(screen.getByRole('button', { name: /right hand/i }));
    expect(within(screen.getByTestId('sil-detail')).getByText(/no documents reference this region/i)).toBeInTheDocument();
  });

  it('moves top to bottom with the arrow keys in the declared order', async () => {
    const user = userEvent.setup();
    render(<Silhouette />);
    screen.getByRole('button', { name: /cervical/i }).focus();
    for (let i = 1; i < SIL_ORDER.length; i++) {
      await user.keyboard('{ArrowDown}');
      const label = BODY_REGIONS.find((r) => r.key === SIL_ORDER[i])!.label;
      expect(screen.getByRole('button', { name: new RegExp(label, 'i') })).toHaveFocus();
    }
  });

  it('labels every region beside the figure, not only by colour', () => {
    render(<Silhouette />);
    BODY_REGIONS.forEach((r) => expect(screen.getAllByText(r.label).length).toBeGreaterThan(0));
  });

  it("announces each region's status exactly as its declared tone specifies", () => {
    render(<Silhouette />);
    const STATUS_BY_TONE: Record<BodyRegion['tone'], string> = {
      accepted: 'accepted body part',
      disputed: 'not an accepted body part, disputed',
      none: 'not an accepted body part, no records',
    };
    BODY_REGIONS.forEach((r) => {
      expect(screen.getByRole('button', { name: `${r.label}, ${STATUS_BY_TONE[r.tone]}` })).toBeInTheDocument();
    });
  });

  it('orders the regions by where they actually sit in the figure', () => {
    // The arrow keys claim to move top to bottom, so the declared order and the drawing
    // must agree. Asserted against HITS rather than against a second copy of the list,
    // which is what let an earlier order put the hands above the lumbar spine.
    const centres = SIL_ORDER.map((k) => HITS[k].y + HITS[k].h / 2);
    expect(centres).toEqual([...centres].sort((a, b) => a - b));
  });

  it('gives every hit target at least 24px at the smallest rendered size', () => {
    // The figure is 220 units wide and renders no narrower than 200px, so one unit is
    // at least 0.909px: a target needs 27 units to clear 24px.
    Object.values(HITS).forEach((h) => {
      expect(Math.min(h.w, h.h)).toBeGreaterThanOrEqual(27);
    });
  });

  it('cites a source on every row', () => {
    render(<Silhouette />);
    within(screen.getByTestId('sil-detail')).getAllByTestId('cite').forEach((c) => expect(c.textContent?.trim()).not.toBe(''));
  });
});
