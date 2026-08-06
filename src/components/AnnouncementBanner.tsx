import { useState } from 'react';
import { ANNOUNCEMENT } from '../config';
import './AnnouncementBanner.css';

/*
 * Session storage, not a cookie: an announcement is not worth a consent banner, and a
 * dismissal that survives the browser being closed is a dismissal nobody can undo.
 *
 * The stored value is the announcement text, so dismissing one does not swallow the next.
 * Both accessors are wrapped because sessionStorage throws outright in some privacy modes
 * — a strip at the top of the page must never be the reason the site fails to render.
 */
const STORAGE_KEY = 'al-announcement-dismissed';

function readDismissed(): string | null {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeDismissed(text: string) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, text);
  } catch {
    /* Dismissal is then a session-of-one; the close still works for this pageview. */
  }
}

interface Props {
  /**
   * Defaults to config. Passed explicitly only by tests, which have to be able to render
   * both states — the shipped one is null, so nothing else would ever exercise the strip.
   */
  announcement?: { text: string; href: string } | null;
}

export function AnnouncementBanner({ announcement = ANNOUNCEMENT }: Props = {}) {
  const [dismissed, setDismissed] = useState(() => readDismissed() === announcement?.text);

  /*
   * Null renders nothing. There is no default announcement and no placeholder copy: an
   * invented "now certified" strip is a claim, and the whole point of this rebuild is
   * that the site only makes claims that are true.
   */
  if (!announcement || dismissed) return null;

  return (
    <div className="al-banner al-on-navy">
      <div className="al-container al-banner__inner">
        <a className="al-banner__link" href={announcement.href}>
          {announcement.text}
          <i className="al-banner__caret" aria-hidden="true" />
        </a>
        <button
          type="button"
          className="al-banner__close"
          onClick={() => {
            writeDismissed(announcement.text);
            setDismissed(true);
          }}
        >
          <span className="al-visually-hidden">Dismiss announcement</span>
          <svg viewBox="0 0 16 16" aria-hidden="true" width="16" height="16">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          </svg>
        </button>
      </div>
    </div>
  );
}
