import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SiteNav } from '../SiteNav';
import { LOGIN_URL, SCHEDULE_URL } from '../../config';

const config = vi.hoisted(() => ({ askAlEnabled: true }));

vi.mock('../../config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../config')>();
  return {
    ...actual,
    get ASK_AL_ENABLED() {
      return config.askAlEnabled;
    },
  };
});

beforeEach(() => {
  config.askAlEnabled = true;
});

describe('SiteNav', () => {
  it('uses a split Product control and keeps the other destinations flat', () => {
    render(<SiteNav />);
    const nav = screen.getByRole('navigation', { name: /primary/i });

    expect(within(nav).getByRole('link', { name: 'Product overview' })).toHaveAttribute('href', '/#product');
    expect(within(nav).getByRole('button', { name: 'Product menu' })).toHaveAttribute('aria-expanded', 'false');
    expect(within(nav).getByRole('link', { name: 'Solutions' })).toHaveAttribute('href', '/#solutions');
    expect(within(nav).getByRole('link', { name: 'Security' })).toHaveAttribute('href', '/security/');
    expect(within(nav).getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about/');
    expect(within(nav).getByRole('link', { name: /log in/i })).toHaveAttribute('href', LOGIN_URL);
    expect(within(nav).getByRole('link', { name: /schedule a call/i })).toHaveAttribute('href', SCHEDULE_URL);
    expect(within(nav).getByTestId('security-mark')).toHaveAttribute('aria-hidden', 'true');
  });

  it('opens the Product menu on click and exposes routed features in phase order', async () => {
    const user = userEvent.setup();
    render(<SiteNav />);
    const button = screen.getByRole('button', { name: 'Product menu' });

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    const menu = document.getElementById('product-menu')!;
    expect(within(menu).getByTestId('product-icon-intake')).toBeInTheDocument();
    expect(menu).toBeInTheDocument();
    expect(within(menu).getAllByRole('link', { name: /Medical Chronologies/i })[0]).toHaveAttribute(
      'href',
      '/product/medical-chronologies/',
    );
    expect(within(menu).getByText('Discovery Responses')).toBeInTheDocument();
    expect(within(menu).queryByRole('link', { name: /Discovery Responses/i })).not.toBeInTheDocument();

    const pre = within(menu).getByRole('heading', { name: 'Pre-Litigation' });
    const litigation = within(menu).getByRole('heading', { name: 'Litigation' });
    expect(pre.compareDocumentPosition(litigation) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('opens on hover and closes after the pointer leaves', async () => {
    const user = userEvent.setup();
    render(<SiteNav />);
    const button = screen.getByRole('button', { name: 'Product menu' });
    const productItem = button.closest('li')!;

    await user.hover(productItem);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    await user.unhover(productItem);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on Escape and returns focus to the Product menu button', async () => {
    const user = userEvent.setup();
    render(<SiteNav />);
    const button = screen.getByRole('button', { name: 'Product menu' });

    await user.click(button);
    await user.keyboard('{Escape}');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveFocus();
  });

  it('closes when focus leaves the Product control and menu', async () => {
    const user = userEvent.setup();
    render(<SiteNav />);
    const button = screen.getByRole('button', { name: 'Product menu' });

    await user.click(button);
    fireEvent.blur(button, { relatedTarget: screen.getByRole('link', { name: 'About' }) });
    await waitFor(() => expect(button).toHaveAttribute('aria-expanded', 'false'));
  });

  it('renders the mobile phase lists already expanded inside the drawer', async () => {
    const user = userEvent.setup();
    const { container } = render(<SiteNav />);
    const toggle = container.querySelector<HTMLButtonElement>('[aria-controls="nav-mobile"]')!;

    await user.click(toggle);
    const drawer = document.getElementById('nav-mobile')!;
    expect(within(drawer).getByRole('heading', { name: 'Pre-Litigation' })).toBeInTheDocument();
    expect(within(drawer).getByRole('heading', { name: 'Litigation' })).toBeInTheDocument();
    expect(within(drawer).getByRole('link', { name: 'Product overview' })).toHaveAttribute('href', '/#product');
    expect(within(drawer).getByRole('link', { name: /log in/i })).toHaveAttribute('href', LOGIN_URL);
    expect(within(drawer).queryByRole('button', { name: /product/i })).not.toBeInTheDocument();
    expect(within(drawer).getByText('Deposition Review')).toBeInTheDocument();
    expect(within(drawer).queryByRole('link', { name: /Deposition Review/i })).not.toBeInTheDocument();
  });

  it('removes Ask AL from desktop and mobile product lists with the kill switch', async () => {
    config.askAlEnabled = false;
    const user = userEvent.setup();
    const { container } = render(<SiteNav />);
    await user.click(screen.getByRole('button', { name: 'Product menu' }));
    expect(within(document.getElementById('product-menu')!).queryByText('Ask AL')).not.toBeInTheDocument();

    const toggle = container.querySelector<HTMLButtonElement>('[aria-controls="nav-mobile"]')!;
    await user.click(toggle);
    expect(within(document.getElementById('nav-mobile')!).queryByText('Ask AL')).not.toBeInTheDocument();
  });

  it('uses the approved existing Autolaw login destination', () => {
    expect(LOGIN_URL).toBe('https://case-app-1055716306475.us-central1.run.app/login');
  });
});
