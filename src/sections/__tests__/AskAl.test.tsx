import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AskAl } from '../AskAl';
import { ASK_AL_QA, CITATION_KINDS } from '../../data/demoCase';

describe('AskAl', () => {
  it('opens on the first question with its cited answer', () => {
    render(<AskAl />);
    expect(screen.getByRole('heading', { level: 2, name: /ask the file, not the model/i })).toBeInTheDocument();
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((t) => t.textContent)).toEqual(ASK_AL_QA.map((q) => q.question));
    const answer = screen.getByTestId('askal-answer');
    ASK_AL_QA[0].answer.forEach((s) => expect(answer).toHaveTextContent(s.text));
    expect(screen.getAllByTestId('askal-chip')).toHaveLength(ASK_AL_QA[0].citations.length);
  });

  it('names a real citation kind, document, and page on every chip', () => {
    render(<AskAl />);
    screen.getAllByTestId('askal-chip').forEach((chip, i) => {
      const c = ASK_AL_QA[0].citations[i];
      expect(CITATION_KINDS).toContain(c.kind);
      expect(chip).toHaveTextContent(c.kind);
      expect(chip).toHaveTextContent(c.document);
      expect(chip).toHaveTextContent(`pg. ${c.page}`);
    });
  });

  it('opens a citation card with document, page, excerpt, and review status', async () => {
    const user = userEvent.setup();
    render(<AskAl />);
    await user.click(screen.getAllByTestId('askal-chip')[1]);
    const card = screen.getByTestId('askal-card');
    const c = ASK_AL_QA[0].citations[1];
    expect(within(card).getByText(c.document)).toBeInTheDocument();
    expect(within(card).getByText(`page ${c.page}`)).toBeInTheDocument();
    expect(within(card).getByText(c.excerpt)).toBeInTheDocument();
    expect(within(card).getByText(c.reviewStatus)).toBeInTheDocument();
    expect(screen.getAllByTestId('askal-chip')[1]).toHaveAttribute('aria-expanded', 'true');
  });

  it('refuses the settlement question with no chips', async () => {
    const user = userEvent.setup();
    render(<AskAl />);
    await user.click(screen.getByRole('tab', { name: /settlement value/i }));
    expect(screen.getByTestId('askal-answer')).toHaveTextContent(/not in my context/i);
    expect(screen.queryAllByTestId('askal-chip')).toEqual([]);
    expect(screen.queryByTestId('askal-card')).not.toBeInTheDocument();
  });

  it('moves between questions with the arrow keys and keeps one tab stop', async () => {
    const user = userEvent.setup();
    render(<AskAl />);
    screen.getAllByRole('tab')[0].focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getAllByRole('tab')[1]).toHaveFocus();
    expect(screen.getAllByRole('tab').filter((t) => t.tabIndex === 0)).toHaveLength(1);
  });

  it('promises nothing from the roadmap', () => {
    const { container } = render(<AskAl />);
    expect(container.textContent).not.toMatch(/suggested questions|streaming|generate documents|compute action/i);
    expect(container.textContent).toMatch(/sample data/i);
  });
});
