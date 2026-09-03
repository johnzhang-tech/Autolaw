import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Arrival } from '../states/Arrival';
import { ARRIVALS, DOCUMENT_COUNT } from '../../data/demoCase';

afterEach(() => vi.useRealTimers());

describe('Arrival', () => {
  it('renders one chip per document group, in arrival order, with counts', () => {
    render(<Arrival />);
    const chips = screen.getAllByRole('listitem');
    expect(chips.map((c) => c.textContent)).toEqual(ARRIVALS.map((g) => `${g.label}${g.count > 1 ? ` ×${g.count}` : ''}`));
  });

  it('counts up to the document total and stops there', () => {
    vi.useFakeTimers();
    render(<Arrival />);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByTestId('arrival-count')).toHaveTextContent(String(DOCUMENT_COUNT));
  });

  it('labels the list for assistive tech and names the count', () => {
    render(<Arrival />);
    expect(screen.getByRole('list', { name: /documents by type/i })).toBeInTheDocument();
    expect(screen.getByText(/documents received/i)).toBeInTheDocument();
  });
});
