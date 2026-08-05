import { useState } from 'react';
import { Button } from './primitives/Button';
import { LOGIN_URL, TRIAL_URL } from '../config';
import './SiteNav.css';

const LINKS = [
  { href: '#transformation', label: 'How it works' },
  { href: '#products', label: 'Product' },
  { href: '#solutions', label: 'Solutions' },
  { href: '#trust', label: 'Trust' },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="al-nav" aria-label="Primary">
      <div className="al-container al-nav__inner">
        <a className="al-nav__brand" href="#top">Autolaw</a>

        <ul className="al-nav__links">
          {LINKS.map((l) => (
            <li key={l.href}><a href={l.href}>{l.label}</a></li>
          ))}
        </ul>

        <div className="al-nav__actions">
          <a className="al-nav__login" href={LOGIN_URL}>Log in</a>
          <Button href={TRIAL_URL} variant="primary" size="md">Analyze one case</Button>
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
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
              </li>
            ))}
            <li><a href={LOGIN_URL}>Log in</a></li>
          </ul>
          <Button href={TRIAL_URL} variant="primary" size="md">Analyze one case</Button>
        </div>
      )}
    </nav>
  );
}
