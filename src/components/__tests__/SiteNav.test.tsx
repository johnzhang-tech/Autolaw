import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SiteNav } from '../SiteNav';
import { LOGIN_URL, SCHEDULE_URL } from '../../config';
import { SITE_LINKS } from '../../navigation';

describe('SiteNav', () => {
  it('lists Product, Solutions, Security, About as plain links, in that order', () => {
    render(<SiteNav />);
    const nav = screen.getByRole('navigation', { name: /primary/i });
    const links = within(nav).getAllByRole('link');
    expect(links.map((a) => a.textContent?.trim())).toEqual(['Autolaw', 'Product', 'Solutions', 'Security', 'About', 'Schedule a call']);
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/', ...SITE_LINKS.map((l) => l.href), SCHEDULE_URL]);
    expect(within(nav).queryAllByRole('button', { expanded: false })).toEqual([]);
  });

  it('points Product at the story and Solutions at the practice section', () => {
    expect(SITE_LINKS.find((l) => l.label === 'Product')?.href).toBe('/#story');
    expect(SITE_LINKS.find((l) => l.label === 'Solutions')?.href).toBe('/#solutions');
  });

  it('renders no login link while LOGIN_URL is unset', () => {
    expect(LOGIN_URL).toBeNull();
    render(<SiteNav />);
    expect(screen.queryByRole('link', { name: /log in/i })).not.toBeInTheDocument();
  });

  it('makes Schedule a call the nav’s primary button', () => {
    render(<SiteNav />);
    const cta = within(screen.getByRole('navigation', { name: /primary/i })).getByRole('link', { name: /schedule a call/i });
    expect(cta).toHaveClass('al-btn--primary');
  });

  it('opens a drawer on the mobile toggle that carries the same links and the CTA', async () => {
    const user = userEvent.setup();
    // Reached through aria-controls rather than by its name. The toggle is display:none at
    // this (desktop) jsdom width, so getByRole with a name filter can never see it — the
    // element is a legitimate role="button" candidate, but the accessible-name algorithm
    // returns "" for anything hidden by CSS, `hidden: true` or not.
    const { container } = render(<SiteNav />);
    const toggle = container.querySelector<HTMLButtonElement>('[aria-controls="nav-mobile"]')!;
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const drawer = document.getElementById('nav-mobile')!;
    expect(within(drawer).getAllByRole('link').map((a) => a.textContent?.trim())).toEqual([...SITE_LINKS.map((l) => l.label), 'Schedule a call']);
  });
});
