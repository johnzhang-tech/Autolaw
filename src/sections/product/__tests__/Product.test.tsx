import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Product } from '../Product';
import { PracticeProvider } from '../../../practice/PracticeContext';
import { FEATURES } from '../../../data/product';

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
});
