import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stage, InlineState } from '../Stage';
import type { ChapterIndex } from '../chapters';

const STATE_FOR: Record<ChapterIndex, string> = {
  0: 'signals', 1: 'arrival', 2: 'chronology', 3: 'chronology', 4: 'chronology',
  5: 'ask', 6: 'review', 7: 'output',
};

describe('Stage', () => {
  it('renders exactly one state per chapter', () => {
    for (const chapter of [0, 1, 2, 3, 4, 5, 6, 7] as ChapterIndex[]) {
      const { unmount } = render(<Stage chapter={chapter} />);
      expect(screen.getByTestId('stage')).toHaveAttribute('data-chapter', String(chapter));
      expect(screen.getAllByTestId(/^state-/)).toHaveLength(1);
      expect(screen.getByTestId(`state-${STATE_FOR[chapter]}`)).toBeInTheDocument();
      unmount();
    }
  });

  it('is a labelled region that is never hidden from assistive tech', () => {
    render(<Stage chapter={3} />);
    const stage = screen.getByRole('region', { name: /demonstration/i });
    expect(stage).not.toHaveAttribute('aria-hidden');
  });

  it('describes the signal panel as one image with the counts in its name', () => {
    render(<Stage chapter={0} />);
    expect(screen.getByRole('img', { name: /3 missing records/i })).toBeInTheDocument();
  });

  it('marks every state as sample data', () => {
    for (const chapter of [0, 1, 2, 5, 6, 7] as ChapterIndex[]) {
      const { unmount } = render(<Stage chapter={chapter} />);
      expect(screen.getAllByText(/sample data/i).length).toBeGreaterThan(0);
      unmount();
    }
  });

  it('animates only when asked, and never inline', () => {
    const { unmount } = render(<Stage chapter={1} />);
    expect(screen.getByTestId('stage')).toHaveClass('al-stage--live');
    unmount();
    render(<InlineState chapter={1} />);
    expect(screen.getByTestId('stage')).not.toHaveClass('al-stage--live');
  });
});
