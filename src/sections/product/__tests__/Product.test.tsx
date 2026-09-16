import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Product } from '../Product';
import { PracticeProvider } from '../../../practice/PracticeContext';
import { FEATURES } from '../../../data/product';

/*
 * ASK_AL_ENABLED is a kill switch (see src/config.ts), so the branch that fires when it
 * is pulled is exactly the one worth testing. Mocked through a getter, following the
 * pattern in ScheduleCallPage.test.tsx, so a single test can flip it without reloading
 * the module graph.
 */
const config = vi.hoisted(() => ({ askAlEnabled: true }));

vi.mock('../../../config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../config')>();
  return {
    ...actual,
    get ASK_AL_ENABLED() {
      return config.askAlEnabled;
    },
  };
});

/*
 * PracticeProvider persists the visitor's choice to sessionStorage (see
 * PracticeContext.tsx), which would otherwise leak a WC selection from the practice-line
 * test below into every render after it — same reason Solutions.test.tsx and
 * Conversion.test.tsx clear it here.
 */
beforeEach(() => {
  window.sessionStorage.clear();
  config.askAlEnabled = true;
});

const renderProduct = () => render(<PracticeProvider><Product /></PracticeProvider>);

describe('Product', () => {
  it('heads both phases with their selling line', () => {
    renderProduct();
    expect(screen.getByRole('heading', { name: 'Pre-Litigation' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Litigation' })).toBeInTheDocument();
    expect(screen.getByText('Build the file. Prove the damages. Send the demand.')).toBeInTheDocument();
  });

  it('puts each feature in every phase column it belongs to', () => {
    renderProduct();
    const pre = screen.getByTestId('column-pre-lit');
    const lit = screen.getByTestId('column-litigation');
    expect(within(pre).getByText('Demand Packages')).toBeInTheDocument();
    expect(within(lit).getByText('Case Management Summary')).toBeInTheDocument();
    expect(within(pre).getByText('Ask AL')).toBeInTheDocument();
    expect(within(lit).getByText('Ask AL')).toBeInTheDocument();
  });

  it('keeps the unbuilt features out of the phase columns', () => {
    renderProduct();
    const lit = screen.getByTestId('column-litigation');
    expect(within(lit).queryByText('Discovery Responses')).not.toBeInTheDocument();
    const next = screen.getByTestId('coming-next');
    expect(within(next).getByText('Discovery Responses')).toBeInTheDocument();
    expect(within(next).getByText('Deposition Review')).toBeInTheDocument();
  });

  it('keeps early access in the column it serves, labelled', () => {
    renderProduct();
    const lit = screen.getByTestId('column-litigation');
    expect(within(lit).getByText('Accident & Injury Illustrations')).toBeInTheDocument();
    expect(within(lit).getByText('Early access')).toBeInTheDocument();
  });

  it('renders the cross-phase strip', () => {
    renderProduct();
    const strip = screen.getByTestId('platform-strip');
    expect(within(strip).getByText('Case Files')).toBeInTheDocument();
    expect(within(strip).getByText('Attorney Review Queue')).toBeInTheDocument();
    expect(within(strip).getByText('Firm Roles & Access')).toBeInTheDocument();
  });

  it('labels every feature that is not live, wherever it renders', () => {
    renderProduct();
    FEATURES.filter((f) => f.availability !== 'live').forEach((f) => {
      screen.getAllByText(f.name).forEach((el) => {
        const card = el.closest('[data-testid="feature-card"]');
        expect(card?.getAttribute('data-availability')).not.toBe('live');
      });
    });
  });

  it('drops Ask AL from every column when the kill switch is off', () => {
    config.askAlEnabled = false;
    renderProduct();
    const pre = screen.getByTestId('column-pre-lit');
    const lit = screen.getByTestId('column-litigation');
    expect(within(pre).queryByText('Ask AL')).not.toBeInTheDocument();
    expect(within(lit).queryByText('Ask AL')).not.toBeInTheDocument();
  });

  it('shows the WC line for the Damages Ledger when the visitor is on WC', () => {
    render(<PracticeProvider initial="WC"><Product /></PracticeProvider>);
    const pre = screen.getByTestId('column-pre-lit');
    expect(
      within(pre).getByText('Reconcile the benefit printout — every TTD, PD, and medical payment — against what is owed.'),
    ).toBeInTheDocument();
    expect(
      within(pre).queryByText('Every medical bill, lien, and benefit payment in one running total.'),
    ).not.toBeInTheDocument();
  });

  /*
   * FeatureCard's own tests prove it mounts whatever `visual` it is handed once open.
   * What is only true here is the pairing: which visual belongs to which card, and that
   * each one arrives on the navy ground. A state rendered without .al-stage is white text
   * on the cream canvas, and jsdom paints nothing, so the class is the only evidence.
   */
  it.each([
    ['Medical Chronologies', 'state-chronology'],
    ['Ask AL', 'state-ask'],
    ['Case Management Summary', 'state-output'],
  ])('opens %s onto its own visual, on the navy ground', async (name, testId) => {
    const user = userEvent.setup();
    renderProduct();

    expect(screen.queryByTestId(testId)).not.toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: new RegExp(`^${name}`) })[0]);

    const visual = screen.getByTestId(testId);
    expect(visual.closest('.al-feat__visual')).toBeInTheDocument();
    expect(visual.closest('.al-stage.al-on-navy')).toBeInTheDocument();
  });

  it('opens a card with no visual onto its detail alone', async () => {
    const user = userEvent.setup();
    const { container } = renderProduct();
    await user.click(screen.getByRole('button', { name: /^Damages Ledger/ }));
    expect(screen.getByText(/Bills, liens, and benefits together/)).toBeInTheDocument();
    expect(container.querySelector('.al-feat__visual')).not.toBeInTheDocument();
    expect(container.querySelector('.al-stage')).not.toBeInTheDocument();
  });

  it('renders Pre-Litigation before Litigation in the DOM', () => {
    renderProduct();
    const pre = screen.getByRole('heading', { name: 'Pre-Litigation' });
    const lit = screen.getByRole('heading', { name: 'Litigation' });
    expect(pre.compareDocumentPosition(lit) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
