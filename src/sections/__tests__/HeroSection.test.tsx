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

  /*
   * The landmark takes its name from the h1 rather than from an aria-label, so a screen
   * reader hears what the page promises instead of the site name it just read out of the
   * banner. This asserts the name resolves — a labelledby pointing at a missing id leaves
   * the section nameless, and a nameless section is not a region at all, so the failure
   * hides from any test that only counts regions.
   */
  it('takes its landmark name from the headline', () => {
    render(<HeroSection />);
    const hero = screen.getByRole('region', { name: /know where every fact came from/i });
    expect(hero).toContainElement(screen.getByRole('heading', { level: 1 }));
  });

  it('paints the signal panel on the navy ground the states need', () => {
    const { container } = render(<HeroSection />);
    expect(container.querySelector('.al-herosec__stage')).toHaveClass('al-stage', 'al-on-navy');
  });
});
