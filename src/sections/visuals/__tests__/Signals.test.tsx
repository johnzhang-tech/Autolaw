import type { ReactElement } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Signals } from '../Signals';
import { Arrival } from '../Arrival';
import { AskPreview } from '../AskPreview';
import { ChronologyState } from '../ChronologyState';
import { Review } from '../Review';
import { Output } from '../Output';
import { SIGNALS, SAMPLE_MARK } from '../../../data/demoCase';

/*
 * Both of these lived in story/Stage.test.tsx and went with it. Neither was about the
 * stage: the accessible name below is the only thing a screen-reader user gets from the
 * tile graphic, and the sample-data mark is a disclaimer on fabricated content. They were
 * lost because of which file happened to hold them, which is the wrong reason.
 */
describe('Signals', () => {
  it('describes the signal panel as one image with the counts in its name', () => {
    render(<Signals />);
    const panel = screen.getByRole('img', { name: /3 missing records/i });
    // Every count, not just the first: the tiles are decorative to a screen reader, so
    // whatever this name omits is simply not available to one.
    SIGNALS.forEach((s) => {
      expect(panel).toHaveAccessibleName(new RegExp(`${s.count} ${s.label}`, 'i'));
    });
  });
});

/*
 * Every state carries the mark itself. There is no shared wrapper that could add it, and
 * StatePanel deliberately is not one — the disclaimer belongs to the claim being made
 * inside the panel, not to the panel's chrome. So it is asserted state by state: one of
 * these losing its disclaimer is what this catches.
 */
describe('sample-data disclaimer', () => {
  const STATES: Array<[string, () => ReactElement]> = [
    ['Signals', () => <Signals />],
    ['Arrival', () => <Arrival animate={false} />],
    ['ChronologyState', () => <ChronologyState phase="connected" />],
    ['AskPreview', () => <AskPreview animate={false} />],
    ['Review', () => <Review />],
    ['Output', () => <Output />],
  ];

  it.each(STATES)('%s says its case is sample data', (_name, State) => {
    render(<State />);
    expect(screen.getAllByText(SAMPLE_MARK).length).toBeGreaterThan(0);
  });
});
