import { CONTACT_EMAIL, LOGIN_URL, SCHEDULE_URL, RESOURCE_MENU, ABOUT_MENU } from '../config';
import './SiteFooter.css';

/*
 * One flat list, in the nav's order, and the page destinations come from the same two
 * config arrays the dropdowns read. That is the point: if a menu item is removed because
 * its page is not real, it cannot go on living down here as a link nobody re-checks.
 *
 * The mailto lives here and nowhere else. The closing CTA used to carry an "Email us"
 * button beside the trial; a link that opens a mail client is a footer link, not a
 * conversion path, and the schedule page is what replaced it up there.
 */
const SECTION_LINKS = [
  { href: '/#products', label: 'Product' },
  { href: '/#solutions', label: 'Solution' },
  { href: '/#story-arrives', label: 'How it works' },
];

export function SiteFooter() {
  return (
    <footer className="al-footer">
      <div className="al-container al-footer__inner">
        <div>
          <p className="al-footer__brand">Autolaw</p>
          <p className="al-footer__tag">Case intelligence for personal injury and workers&rsquo; compensation.</p>
        </div>
        <ul className="al-footer__links">
          {[...SECTION_LINKS, ...RESOURCE_MENU, ...ABOUT_MENU].map((l) => (
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
