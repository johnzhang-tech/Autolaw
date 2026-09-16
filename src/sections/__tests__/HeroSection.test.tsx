import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroSection } from '../HeroSection';

describe('HeroSection', () => {
  it('carries the headline as the page’s h1', () => {
    render(<HeroSection />);
    expect(screen.getByRole('heading', { level: 1, name: /know where every fact came from/i })).toBeInTheDocument();
  });

  it('sends "See how it works" to the product section', () => {
    render(<HeroSection />);
    expect(screen.getByRole('link', { name: /see how it works/i })).toHaveAttribute('href', '/#product');
  });
});
