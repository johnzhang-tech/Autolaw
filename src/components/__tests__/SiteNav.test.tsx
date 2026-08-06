import { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SiteNav, NavMenu } from '../SiteNav';
import { LOGIN_URL, SCHEDULE_URL, RESOURCE_MENU, type NavMenuItem } from '../../config';

/**
 * NavMenu is controlled by SiteNav so that opening one menu closes the other. This is the
 * smallest thing that can hold that state, so the menu's own behaviour can be tested with
 * item lists the shipped config does not have — including an empty one, and including
 * enough items for the arrow keys to have somewhere to go.
 */
function Harness({ items, label = 'Resources' }: { items: ReadonlyArray<NavMenuItem>; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <ul>
      <NavMenu
        id="test"
        label={label}
        items={items}
        open={open}
        onToggle={() => setOpen((o) => !o)}
        onClose={() => setOpen(false)}
      />
    </ul>
  );
}

const THREE: NavMenuItem[] = [
  { label: 'Security', href: '/security/', description: 'Controls and data handling' },
  { label: 'Documentation', href: '/docs/' },
  { label: 'Changelog', href: '/changelog/' },
];

describe('NavMenu', () => {
  /*
   * The guard. Autolaw has no blog, no webinars, and no case studies, so a menu whose
   * array is empty must not exist at all — no trigger, no panel, nothing to click onto a
   * "coming soon". Removing `if (items.length === 0) return null` from NavMenu fails this.
   */
  it('renders nothing at all when its config array is empty', () => {
    const { container } = render(<Harness items={[]} />);
    expect(container.querySelector('ul')).toBeEmptyDOMElement();
    expect(screen.queryByRole('button', { name: /resources/i })).not.toBeInTheDocument();
  });

  it('renders a trigger, and its items only once opened', async () => {
    const user = userEvent.setup();
    render(<Harness items={THREE} />);

    const trigger = screen.getByRole('button', { name: /resources/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: /security/i })).not.toBeInTheDocument();

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const panel = document.getElementById(trigger.getAttribute('aria-controls')!);
    expect(panel).not.toBeNull();
    expect(within(panel!).getAllByRole('link')).toHaveLength(3);
    expect(screen.getByRole('link', { name: /security/i })).toHaveAttribute('href', '/security/');
  });

  it('closes on Escape and puts focus back on the trigger', async () => {
    const user = userEvent.setup();
    render(<Harness items={THREE} />);
    const trigger = screen.getByRole('button', { name: /resources/i });

    await user.click(trigger);
    screen.getByRole('link', { name: /documentation/i }).focus();
    await user.keyboard('{Escape}');

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('opens with ArrowDown from the trigger and moves through items with the arrow keys', async () => {
    const user = userEvent.setup();
    render(<Harness items={THREE} />);
    screen.getByRole('button', { name: /resources/i }).focus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('link', { name: /security/i })).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('link', { name: /documentation/i })).toHaveFocus();

    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('link', { name: /security/i })).toHaveFocus();

    // Wrapping, so the keyboard never dead-ends at either edge of a short list.
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('link', { name: /changelog/i })).toHaveFocus();
  });

});

describe('SiteNav', () => {
  it('leads with Product and lists the sections in the owner’s order', () => {
    render(<SiteNav />);
    const nav = screen.getByRole('navigation', { name: /primary/i });
    const labels = within(nav)
      .getAllByRole('listitem')
      .map((li) => (li.textContent ?? '').trim());
    expect(labels).toEqual(['Product', 'Solution', 'How it works', 'Resources', 'About']);
  });

  it('points every section link at a section that the page actually has', () => {
    render(<SiteNav />);
    const nav = screen.getByRole('navigation', { name: /primary/i });
    const hrefs = within(nav)
      .getAllByRole('link')
      .map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['#top', '#products', '#solutions', '#transformation', LOGIN_URL, SCHEDULE_URL]);
  });

  /*
   * The nav's button is the sales-assisted half of the split. "Analyze one case" is still
   * on the page — it leads the hero and closes the page — but it is no longer what the bar
   * asks for, and a nav carrying both would be asking twice.
   */
  it('makes Schedule a call the nav’s primary button', () => {
    render(<SiteNav />);
    const nav = screen.getByRole('navigation', { name: /primary/i });
    const cta = within(nav).getByRole('link', { name: /schedule a call/i });
    expect(cta).toHaveAttribute('href', SCHEDULE_URL);
    expect(cta).toHaveClass('al-btn--primary');
    expect(within(nav).queryByRole('link', { name: /analyze one case/i })).not.toBeInTheDocument();
  });

  it('keeps only one menu open at a time', async () => {
    const user = userEvent.setup();
    render(<SiteNav />);
    const resources = screen.getByRole('button', { name: /resources/i });
    const about = screen.getByRole('button', { name: /^about$/i });

    await user.click(resources);
    expect(resources).toHaveAttribute('aria-expanded', 'true');

    await user.click(about);
    expect(about).toHaveAttribute('aria-expanded', 'true');
    expect(resources).toHaveAttribute('aria-expanded', 'false');
  });

  /* The listener that does this lives in SiteNav, since it is the thing that knows which
     menu is open — so it is asserted here rather than against NavMenu alone. */
  it('closes an open menu when a pointer lands outside it', async () => {
    const user = userEvent.setup();
    render(
      <>
        <SiteNav />
        <button type="button">Elsewhere</button>
      </>
    );
    const trigger = screen.getByRole('button', { name: /resources/i });

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(screen.getByRole('button', { name: 'Elsewhere' }));
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('reaches Security through the Resources menu, where Trust used to be a top-level link', async () => {
    const user = userEvent.setup();
    render(<SiteNav />);
    expect(screen.queryByRole('link', { name: /^trust$/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /resources/i }));
    expect(screen.getByRole('link', { name: /security/i })).toHaveAttribute('href', '/security/');
  });

  /*
   * Below 860px the popovers are gone and the drawer lists each menu already expanded.
   * jsdom does no layout, so what is asserted is the structure: the drawer holds the menu
   * items as plain links, with no second disclosure to open first.
   */
  it('renders the menus as expanded sections inside the mobile drawer', async () => {
    const user = userEvent.setup();
    const { container } = render(<SiteNav />);

    /*
     * Reached through aria-controls rather than by its name. The toggle is display:none at
     * this width, and accname returns the empty string for a hidden element — so
     * getByRole('button', { name: /open menu/i, hidden: true }) matches nothing, which is
     * a confusing failure to inherit later.
     */
    await user.click(container.querySelector<HTMLButtonElement>('[aria-controls="nav-mobile"]')!);

    const drawer = document.getElementById('nav-mobile')!;
    expect(within(drawer).queryAllByRole('button')).toHaveLength(0);
    expect(within(drawer).getByText('Resources')).toBeInTheDocument();
    for (const item of RESOURCE_MENU) {
      expect(within(drawer).getByRole('link', { name: item.label })).toHaveAttribute('href', item.href);
    }
    expect(within(drawer).getByRole('link', { name: /schedule a call/i })).toHaveAttribute('href', SCHEDULE_URL);
  });
});
