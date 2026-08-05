import { CONTACT_EMAIL, LOGIN_URL } from '../config';
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
          <li><a href="#transformation">How it works</a></li>
          <li><a href="#products">Product</a></li>
          <li><a href="#solutions">Solutions</a></li>
          <li><a href="#trust">Trust</a></li>
          <li><a href={LOGIN_URL}>Log in</a></li>
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
