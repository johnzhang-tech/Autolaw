import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnnouncementBanner } from '../AnnouncementBanner';
import { ANNOUNCEMENT } from '../../config';

/** What a real one would look like. It is written here, in a test, and nowhere else. */
const EXAMPLE = { text: 'Autolaw is now SOC 2 Type II certified', href: '/security/' };

describe('AnnouncementBanner', () => {
  beforeEach(() => sessionStorage.clear());

  /*
   * Removing the `!announcement` guard from the component fails this: with nothing to
   * render it reads announcement.text and throws.
   *
   * The ANNOUNCEMENT assertion is the deliberate part. The site ships with no
   * announcement, because an invented one is a claim, and this is the line that has to be
   * changed on purpose the day a real one exists.
   */
  it('renders nothing with the shipped configuration', () => {
    expect(ANNOUNCEMENT).toBeNull();
    const { container } = render(<AnnouncementBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when handed null', () => {
    const { container } = render(<AnnouncementBanner announcement={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the announcement as a link when there is one', () => {
    render(<AnnouncementBanner announcement={EXAMPLE} />);
    expect(screen.getByRole('link', { name: new RegExp(EXAMPLE.text, 'i') }))
      .toHaveAttribute('href', EXAMPLE.href);
  });

  it('gives the dismiss control an accessible name', () => {
    render(<AnnouncementBanner announcement={EXAMPLE} />);
    expect(screen.getByRole('button', { name: /dismiss announcement/i })).toBeInTheDocument();
  });

  it('hides on dismiss and stays hidden for the rest of the session', async () => {
    const user = userEvent.setup();
    const { container, unmount } = render(<AnnouncementBanner announcement={EXAMPLE} />);

    await user.click(screen.getByRole('button', { name: /dismiss announcement/i }));
    expect(container).toBeEmptyDOMElement();

    // A fresh mount is a new pageview within the same session.
    unmount();
    const again = render(<AnnouncementBanner announcement={EXAMPLE} />);
    expect(again.container).toBeEmptyDOMElement();
  });

  /*
   * sessionStorage rather than a cookie, and keyed by the text: dismissing one
   * announcement must not swallow the next one.
   */
  it('does not carry a dismissal over to a different announcement', async () => {
    const user = userEvent.setup();
    const first = render(<AnnouncementBanner announcement={EXAMPLE} />);
    await user.click(screen.getByRole('button', { name: /dismiss announcement/i }));
    first.unmount();

    const next = { text: 'Autolaw now reads deposition transcripts', href: '/product/' };
    render(<AnnouncementBanner announcement={next} />);
    expect(screen.getByRole('link', { name: new RegExp(next.text, 'i') })).toBeInTheDocument();
  });
});
