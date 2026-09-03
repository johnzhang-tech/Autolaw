import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Conversion } from '../Conversion';
import { PracticeProvider } from '../../practice/PracticeContext';
import { PRACTICE_CLOSING } from '../../data/demoCase';

describe('Conversion', () => {
  it('closes for PI by default, pointing the call at the PI practice', () => {
    render(<PracticeProvider><Conversion /></PracticeProvider>);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(PRACTICE_CLOSING.PI.heading);
    expect(screen.getByRole('link', { name: /schedule a call/i })).toHaveAttribute('href', PRACTICE_CLOSING.PI.href);
    expect(screen.queryByRole('link', { name: /analyze one/i })).not.toBeInTheDocument();
  });

  it('follows the shared practice choice', () => {
    render(<PracticeProvider initial="WC"><Conversion /></PracticeProvider>);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(PRACTICE_CLOSING.WC.heading);
    expect(screen.getByRole('link', { name: /schedule a call/i })).toHaveAttribute('href', PRACTICE_CLOSING.WC.href);
  });

  it('lets the visitor switch practice here without scrolling back up', async () => {
    const user = userEvent.setup();
    render(<PracticeProvider><Conversion /></PracticeProvider>);
    await user.click(screen.getByRole('button', { name: /workers/i }));
    expect(screen.getByRole('button', { name: /workers/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(PRACTICE_CLOSING.WC.heading);
  });
});
