import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from '../Hero';
import { SCHEDULE_URL, HOW_IT_WORKS_URL } from '../../config';

describe('Hero', () => {
  it('leads with the buyer outcome, not the category', () => {
    render(<Hero />);
    expect(
      screen.getByRole('heading', { level: 1, name: /turn case complexity into legal advantage/i })
    ).toBeInTheDocument();
  });

  /*
   * Schedule a call leads. The trial is behind TRIAL_ENABLED because /trial is gated off
   * on case-app and app.autolaw.ai does not resolve; a primary button that opens a browser
   * error is worse than no button.
   */
  it('points the primary CTA at the scheduling page', () => {
    render(<Hero />);
    const primary = screen.getByRole('link', { name: /schedule a call/i });
    expect(primary).toHaveAttribute('href', SCHEDULE_URL);
    expect(primary).toHaveClass('al-btn--primary');
    expect(screen.queryByRole('link', { name: /analyze one/i })).not.toBeInTheDocument();
  });

  it('gives the cockpit a single descriptive label rather than bare numbers', () => {
    render(<Hero />);
    const fig = screen.getByRole('img', { name: /missing records/i });
    expect(fig).toBeInTheDocument();
  });

  /*
   * The secondary control is an invitation to scroll, not a second lane. A visitor who is
   * not ready to book a call is asked to read on, which is the only other thing the page
   * can honestly offer while the trial is off.
   */
  it('offers See how it works as the secondary control', () => {
    render(<Hero />);
    const secondary = screen.getByRole('link', { name: /see how it works/i });
    expect(secondary).toHaveAttribute('href', HOW_IT_WORKS_URL);
    expect(secondary).toHaveClass('al-btn--secondary');
  });

  it('omits the walkthrough CTA until a real recording exists', () => {
    render(<Hero />);
    expect(screen.queryByRole('link', { name: /walkthrough/i })).not.toBeInTheDocument();
  });
});
