import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Review } from '../states/Review';
import { Output } from '../states/Output';
import { REVIEW_ITEM, OUTPUT_ROWS, EXPORT_RULE } from '../../data/demoCase';

describe('Review', () => {
  it("shows one fact awaiting a person, with the queue's own labels and no live controls", () => {
    render(<Review />);
    expect(screen.getByText(REVIEW_ITEM.title)).toBeInTheDocument();
    expect(screen.getByText(REVIEW_ITEM.value)).toBeInTheDocument();
    expect(screen.getByText(`${REVIEW_ITEM.source} · ${REVIEW_ITEM.page}`)).toBeInTheDocument();
    expect(screen.getByText('Needs review')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Dismiss')).toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toEqual([]);
  });

  it('labels the confidence as extraction confidence, with the number', () => {
    render(<Review />);
    expect(screen.getByText(/extraction confidence/i)).toBeInTheDocument();
    expect(screen.getByText(`${REVIEW_ITEM.confidence}%`)).toBeInTheDocument();
  });
});

describe('Output', () => {
  it('lists the three outputs and states the export rule verbatim', () => {
    render(<Output />);
    OUTPUT_ROWS.forEach((r) => {
      expect(screen.getByText(r.label)).toBeInTheDocument();
      expect(screen.getByText(r.value)).toBeInTheDocument();
    });
    expect(screen.getByText(EXPORT_RULE)).toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toEqual([]);
  });
});
