import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AskPreview, typeOut } from '../states/AskPreview';
import { ASK_AL_PREVIEW, CITATION_KINDS } from '../../data/demoCase';

afterEach(() => vi.useRealTimers());

describe('AskPreview', () => {
  it('types the question in, then shows the whole answer with numbered markers', () => {
    vi.useFakeTimers();
    render(<AskPreview />);
    act(() => { vi.advanceTimersByTime(2000); });
    expect(screen.getByTestId('ask-question')).toHaveTextContent(ASK_AL_PREVIEW.question);
    const answer = screen.getByTestId('ask-answer');
    ASK_AL_PREVIEW.answer.forEach((s) => expect(answer).toHaveTextContent(s.text));
    expect(answer.querySelectorAll('sup')).toHaveLength(2);
  });

  it('renders one chip per citation, each naming a kind the product has, a document, and a page', () => {
    vi.useFakeTimers();
    render(<AskPreview />);
    act(() => { vi.advanceTimersByTime(2000); });
    const chips = screen.getAllByTestId('ask-chip');
    expect(chips).toHaveLength(ASK_AL_PREVIEW.chips.length);
    chips.forEach((chip, i) => {
      const c = ASK_AL_PREVIEW.chips[i];
      expect(CITATION_KINDS).toContain(c.kind);
      expect(chip).toHaveTextContent(c.kind);
      expect(chip).toHaveTextContent(c.document);
      expect(chip).toHaveTextContent(`pg. ${c.page}`);
    });
  });

  it('uses the name the application uses, and promises nothing from the roadmap', () => {
    render(<AskPreview />);
    expect(screen.getByText(/^Ask AL$/)).toBeInTheDocument();
    const text = screen.getByTestId('state-ask').textContent ?? '';
    expect(text).not.toMatch(/suggested questions|streaming|generate documents|compute action/i);
  });

  it('shows the full question and the answer already in, with no timers advanced, when animate is false', () => {
    render(<AskPreview animate={false} />);
    expect(screen.getByTestId('ask-question')).toHaveTextContent(ASK_AL_PREVIEW.question);
    expect(screen.getByTestId('ask-answer')).toHaveClass('is-in');
  });

  it('typeOut stops ticking once cancelled', () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    const cancel = typeOut('abcdef', 60, spy);
    act(() => { vi.advanceTimersByTime(15); });
    const callsAtCancel = spy.mock.calls.length;
    cancel();
    act(() => { vi.advanceTimersByTime(500); });
    expect(callsAtCancel).toBeLessThan(6);
    expect(spy.mock.calls.length).toBe(callsAtCancel);
  });
});
