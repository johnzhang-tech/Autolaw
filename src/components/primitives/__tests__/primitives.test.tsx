import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';
import { Chip } from '../Chip';

describe('Button', () => {
  it('renders an anchor when given href', () => {
    render(<Button href="https://example.com">Analyze one case</Button>);
    const el = screen.getByRole('link', { name: /analyze one case/i });
    expect(el).toHaveAttribute('href', 'https://example.com');
  });

  it('renders a button element when given onClick', () => {
    render(<Button onClick={() => {}}>Go</Button>);
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
  });

  it('applies the variant class', () => {
    render(<Button href="#" variant="inverse">X</Button>);
    expect(screen.getByRole('link')).toHaveClass('al-btn--inverse');
  });
});

describe('Chip', () => {
  it('renders its label and tone', () => {
    render(<Chip tone="conflict">2 sources conflict</Chip>);
    const el = screen.getByText('2 sources conflict');
    expect(el).toHaveClass('al-chip--conflict');
  });
});
