import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PracticeProvider, usePractice, PRACTICE_STORAGE_KEY } from '../PracticeContext';

function Probe() {
  const { practice, setPractice } = usePractice();
  return (
    <div>
      <output data-testid="practice">{practice}</output>
      <button type="button" onClick={() => setPractice('WC')}>wc</button>
    </div>
  );
}

beforeEach(() => window.sessionStorage.clear());

describe('PracticeContext', () => {
  it('defaults to PI', () => {
    render(<PracticeProvider><Probe /></PracticeProvider>);
    expect(screen.getByTestId('practice')).toHaveTextContent('PI');
  });

  it('shares a change with every consumer and persists it', async () => {
    const user = userEvent.setup();
    render(<PracticeProvider><Probe /><Probe /></PracticeProvider>);
    await user.click(screen.getAllByRole('button')[0]);
    expect(screen.getAllByTestId('practice').map((o) => o.textContent)).toEqual(['WC', 'WC']);
    expect(window.sessionStorage.getItem(PRACTICE_STORAGE_KEY)).toBe('WC');
  });

  it('restores a persisted choice', () => {
    window.sessionStorage.setItem(PRACTICE_STORAGE_KEY, 'WC');
    render(<PracticeProvider><Probe /></PracticeProvider>);
    expect(screen.getByTestId('practice')).toHaveTextContent('WC');
  });

  it('ignores junk in storage and survives storage that throws', () => {
    window.sessionStorage.setItem(PRACTICE_STORAGE_KEY, 'nope');
    render(<PracticeProvider><Probe /></PracticeProvider>);
    expect(screen.getByTestId('practice')).toHaveTextContent('PI');

    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    const { unmount } = render(<PracticeProvider><Probe /></PracticeProvider>);
    expect(screen.getAllByTestId('practice').at(-1)).toHaveTextContent('PI');
    act(() => { screen.getAllByRole('button').at(-1)!.click(); });
    expect(screen.getAllByTestId('practice').at(-1)).toHaveTextContent('WC');
    unmount(); get.mockRestore(); set.mockRestore();
  });

  it('falls back to PI outside a provider rather than crashing', () => {
    render(<Probe />);
    expect(screen.getByTestId('practice')).toHaveTextContent('PI');
  });
});
