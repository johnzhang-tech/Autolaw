import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from '../Hero';
import { TRIAL_URL } from '../../config';

describe('Hero', () => {
  it('leads with the buyer outcome, not the category', () => {
    render(<Hero />);
    expect(
      screen.getByRole('heading', { level: 1, name: /turn case complexity into legal advantage/i })
    ).toBeInTheDocument();
  });

  it('points the primary CTA at the trial flow', () => {
    render(<Hero />);
    expect(screen.getByRole('link', { name: /analyze one case/i })).toHaveAttribute('href', TRIAL_URL);
  });

  it('gives the cockpit a single descriptive label rather than bare numbers', () => {
    render(<Hero />);
    const fig = screen.getByRole('img', { name: /missing records/i });
    expect(fig).toBeInTheDocument();
  });

  it('omits the walkthrough CTA until a real recording exists', () => {
    render(<Hero />);
    expect(screen.queryByRole('link', { name: /walkthrough/i })).not.toBeInTheDocument();
  });
});
