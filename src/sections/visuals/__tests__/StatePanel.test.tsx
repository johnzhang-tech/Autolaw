import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatePanel } from '../StatePanel';
import { Signals } from '../Signals';

/*
 * A class assertion earns its place exactly here. Every state paints inverse ink, so one
 * rendered outside this panel is white text on the cream canvas — and jsdom paints
 * nothing, so no rendering test in this suite can see that. The classes are the only
 * evidence available.
 */
describe('StatePanel', () => {
  it('gives whatever it holds the navy ground and the inverse focus ring', () => {
    const { container } = render(<StatePanel><Signals /></StatePanel>);
    const panel = container.firstElementChild!;
    expect(panel).toHaveClass('al-stage', 'al-on-navy');
    expect(panel).toContainElement(screen.getByTestId('state-signals'));
  });

  /* The hero adds its own floor this way; a feature card will add nothing and get a panel
     the height of its contents. Whether the floor is on the right selector is asserted on
     the shipped stylesheet, in a11y.test.tsx. */
  it('keeps the caller’s own class alongside them', () => {
    const { container } = render(<StatePanel className="al-herosec__stage"><Signals /></StatePanel>);
    expect(container.firstElementChild).toHaveClass('al-stage', 'al-on-navy', 'al-herosec__stage');
  });
});
