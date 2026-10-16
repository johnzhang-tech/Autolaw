import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Wordmark } from '../Wordmark';
import { SiteNav } from '../SiteNav';
import { SiteFooter } from '../SiteFooter';

describe('Wordmark', () => {
  /*
   * One text node, no whitespace inside it. A mark split across elements with a space
   * between them is read aloud as "Auto" "Law" — two words — and copies out of the page
   * the same way. The capital L is the mark; it must survive being read.
   */
  it('is the single word AutoLaw, as text rather than an image', () => {
    const { container } = render(<Wordmark />);
    const mark = container.querySelector('.al-wordmark')!;
    expect(mark.textContent).toBe('AutoLaw');
    expect(container.querySelector('img, svg')).toBeNull();
  });

  it('takes an extra class so each surface can size it', () => {
    const { container } = render(<Wordmark className="al-nav__brand-mark" />);
    expect(container.querySelector('.al-wordmark')).toHaveClass('al-nav__brand-mark');
  });
});

describe('the wordmark in place', () => {
  it('sits at the top left of the nav and links home', () => {
    render(<SiteNav />);
    const nav = screen.getByRole('navigation', { name: /primary/i });
    const home = within(nav).getByRole('link', { name: /autolaw home/i });

    expect(home).toHaveAttribute('href', '/');
    expect(home.textContent).toBe('AutoLaw');
    /* First in the nav's own DOM order — the mark is the first thing in the header. */
    expect(nav.querySelector('a')).toBe(home);
  });

  it('appears once more in the footer, and not as a second home link', () => {
    render(<SiteFooter />);
    const footer = screen.getByRole('contentinfo');

    expect(within(footer).getAllByText('AutoLaw')).toHaveLength(1);
    expect(within(footer).queryByRole('link', { name: /autolaw home/i })).not.toBeInTheDocument();
  });
});
