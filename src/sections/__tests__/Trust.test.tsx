import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Trust } from '../Trust';
import { CUSTOMER_LOGOS } from '../../config';

describe('Trust', () => {
  it('renders no customer logo wall while no permissioned assets exist', () => {
    expect(CUSTOMER_LOGOS).toHaveLength(0);
    render(<Trust />);
    expect(screen.queryByTestId('logo-wall')).not.toBeInTheDocument();
    expect(screen.queryByText(/trusted by/i)).not.toBeInTheDocument();
  });

  it('states the control claims in plain language', () => {
    render(<Trust />);
    expect(screen.getByText(/autolaw does not train on your data/i)).toBeInTheDocument();
    // Re-pointed from "tenant isolation" — vendor vocabulary that names a lease to the
    // attorney reading it. Same control, stated as what it does.
    expect(screen.getByText(/no other firm can see your cases/i)).toBeInTheDocument();
    expect(screen.getByText(/auditable access/i)).toBeInTheDocument();
    expect(screen.getByText(/human confirmation required/i)).toBeInTheDocument();
  });

  it('puts the comparison table in its own scroll container', () => {
    render(<Trust />);
    expect(screen.getByTestId('comparison-scroller')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
