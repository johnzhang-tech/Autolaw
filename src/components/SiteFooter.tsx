import { CONTACT_EMAIL, LOGIN_URL, SAMPLE_REPORTS_URL, SCHEDULE_URL, TRIAL_ENABLED, TRIAL_URL, PRIVACY_TEXT, TERMS_TEXT, PRIVACY_URL, TERMS_URL } from '../config';
import { SITE_LINKS } from '../navigation';
import { SecurityMark } from './SecurityMark';
import { Wordmark } from './Wordmark';
import './SiteFooter.css';

export function SiteFooter({ scheduleHref = SCHEDULE_URL }: { scheduleHref?: string }) {
  const LEGAL = [PRIVACY_TEXT.length ? { href: PRIVACY_URL, label: 'Privacy' } : null, TERMS_TEXT.length ? { href: TERMS_URL, label: 'Terms' } : null].filter((l): l is { href: string; label: string } => l !== null);

  return (
    <footer className="al-footer">
      <div className="al-container al-footer__inner">
        <div>
          <p className="al-footer__brand"><Wordmark /></p>
          <p className="al-footer__tag">Case intelligence for personal injury and workers&rsquo; compensation.</p>
        </div>
        <ul className="al-footer__links">
          {SITE_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href}>
                {l.label === 'Security' && <SecurityMark />}
                <span>{l.label}</span>
              </a>
            </li>
          ))}
          {/* Footer only, not in SITE_LINKS: the nav is already seven items, and this is
              a page someone reaches for once rather than navigates by. Without it the
              samples are unreachable from the product pages, the blog and the Trust
              Center — every page a search result actually lands on. */}
          <li><a href={SAMPLE_REPORTS_URL}>Sample reports</a></li>
          <li><a href={scheduleHref}>Schedule a call</a></li>
          {LOGIN_URL && <li><a href={LOGIN_URL}>Log in</a></li>}
          {TRIAL_ENABLED && <li><a href={TRIAL_URL}>Sign up</a></li>}
          <li><a href={`mailto:${CONTACT_EMAIL}`}>Contact</a></li>
          {LEGAL.map((l) => (
            <li key={l.href}><a href={l.href}>{l.label}</a></li>
          ))}
        </ul>
      </div>
      <div className="al-container al-footer__legal">
        <span>&copy; {new Date().getFullYear()} Autolaw.ai</span>
        <span>All rights reserved</span>
      </div>
    </footer>
  );
}
