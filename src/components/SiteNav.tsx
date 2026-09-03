import { useState } from 'react';
import { Button } from './primitives/Button';
import { LOGIN_URL, SCHEDULE_URL } from '../config';
import { SITE_LINKS } from '../navigation';
import './SiteNav.css';

/**
 * Four links and one button. The dropdowns are gone: Resources held one item and About
 * held one item, and a menu that opens onto a single link is a menu nobody needed.
 */
export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="al-nav">
      <nav className="al-nav__nav" aria-label="Primary">
        <div className="al-container al-nav__inner">
          <a className="al-nav__brand" href="/">Autolaw</a>

          <ul className="al-nav__links">
            {SITE_LINKS.map((l) => (
              <li key={l.href}><a href={l.href}>{l.label}</a></li>
            ))}
          </ul>

          <div className="al-nav__actions">
            {LOGIN_URL && <a className="al-nav__login" href={LOGIN_URL}>Log in</a>}
            <Button href={SCHEDULE_URL} variant="primary" size="md" withCaret>Schedule a call</Button>
          </div>

          <button
            type="button"
            className="al-nav__toggle"
            aria-expanded={open}
            aria-controls="nav-mobile"
            onClick={() => setOpen(!open)}
          >
            <span className="al-visually-hidden">{open ? 'Close menu' : 'Open menu'}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true" width="24" height="24">
              <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          </button>
        </div>

        {open && (
          <div className="al-nav__mobile" id="nav-mobile">
            <ul>
              {SITE_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
                </li>
              ))}
            </ul>
            {LOGIN_URL && (
              <ul>
                <li><a href={LOGIN_URL}>Log in</a></li>
              </ul>
            )}
            <Button href={SCHEDULE_URL} variant="primary" size="md" withCaret>Schedule a call</Button>
          </div>
        )}
      </nav>
    </header>
  );
}
