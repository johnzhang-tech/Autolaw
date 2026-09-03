import { CONTACT_EMAIL, LOGIN_URL, SCHEDULE_URL } from '../config';
import { SITE_LINKS } from '../navigation';
import './SiteFooter.css';

export function SiteFooter() {
  return (
    <footer className="al-footer">
      <div className="al-container al-footer__inner">
        <div>
          <p className="al-footer__brand">Autolaw</p>
          <p className="al-footer__tag">Case intelligence for personal injury and workers&rsquo; compensation.</p>
        </div>
        <ul className="al-footer__links">
          {SITE_LINKS.map((l) => (
            <li key={l.href}><a href={l.href}>{l.label}</a></li>
          ))}
          <li><a href={SCHEDULE_URL}>Schedule a call</a></li>
          {LOGIN_URL && <li><a href={LOGIN_URL}>Log in</a></li>}
          <li><a href={`mailto:${CONTACT_EMAIL}`}>Contact</a></li>
        </ul>
      </div>
      <div className="al-container al-footer__legal">
        <span>&copy; {new Date().getFullYear()} Autolaw.ai</span>
        <span>All rights reserved</span>
      </div>
    </footer>
  );
}
