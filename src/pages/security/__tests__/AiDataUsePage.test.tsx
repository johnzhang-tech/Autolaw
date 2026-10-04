import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { AiDataUsePage } from '../ai/AiDataUsePage';
import { AI_QUESTIONS } from '../../../data/trust';
import { pageGuardHits } from './trustGuard';
import { renderedText } from '../../__tests__/renderedText';

describe('AiDataUsePage', () => {
  it('has one page heading and names the ABA opinion it answers', () => {
    render(<AiDataUsePage />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(within(screen.getByRole('main')).getByText(/ABA Formal Opinion 512/)).toBeInTheDocument();
  });

  it('asks every question as a section heading and gives every answer and commitment', () => {
    render(<AiDataUsePage />);
    AI_QUESTIONS.forEach((q) => {
      const section = within(screen.getByRole('region', { name: q.question }));
      q.answers.forEach((a) => expect(section.getByText(a.text)).toBeInTheDocument());
      (q.commitments ?? []).forEach((c) => expect(section.getByText(c.text)).toBeInTheDocument());
    });
  });

  it('uses no vocabulary that is not yet verified, and no NDA-only detail', () => {
    render(<AiDataUsePage />);
    const text = renderedText(screen.getByRole('main'));
    expect(text.length).toBeGreaterThan(1200);
    expect(pageGuardHits(screen.getByRole('main'))).toEqual([]);
  });
});
