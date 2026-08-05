import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Section } from '../Section';

describe('Section', () => {
  it('labels the landmark with its own heading', () => {
    render(<Section id="trust" heading="Why not a chatbot">body</Section>);
    expect(screen.getByRole('region', { name: 'Why not a chatbot' })).toBeInTheDocument();
  });

  it('never points aria-labelledby at a heading that does not render', () => {
    const { container } = render(<Section id="trust">body</Section>);
    const section = container.querySelector('section')!;
    const target = section.getAttribute('aria-labelledby');

    // Either no reference at all, or one that resolves to a real element.
    // A dangling reference yields an empty accessible name, which silently drops
    // the section out of role="region" — passing a landmark test while unlabelled.
    if (target !== null) {
      expect(document.getElementById(target)).not.toBeNull();
    }
  });

  it('renders eyebrow and intro when given', () => {
    render(
      <Section id="x" eyebrow="Trust" heading="H" intro="Lead copy.">
        body
      </Section>
    );
    expect(screen.getByText('Trust')).toBeInTheDocument();
    expect(screen.getByText('Lead copy.')).toBeInTheDocument();
  });

  it('marks navy sections so inverse focus rings apply', () => {
    const { container } = render(<Section id="x" heading="H" tone="navy">body</Section>);
    expect(container.querySelector('section')).toHaveClass('al-sec--navy', 'al-on-navy');
  });
});
