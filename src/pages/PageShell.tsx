import type { ReactNode } from 'react';
import { AnnouncementBanner } from '../components/AnnouncementBanner';
import { SiteNav } from '../components/SiteNav';
import { SiteFooter } from '../components/SiteFooter';

/**
 * The frame every standalone page shares: skip link, site banner, main landmark, footer.
 *
 * SiteNav and SiteFooter are imported rather than reimplemented so a change to either
 * reaches all four pages at once. A second copy of the nav would drift within a week and
 * the drift would be invisible — the home page and the security page would simply stop
 * offering the same routes.
 */
export function PageShell({ children, scheduleHref }: { children: ReactNode; scheduleHref?: string }) {
  return (
    <>
      <a className="al-skip" href="#main">Skip to content</a>
      {/* Site-wide means all four pages. The first real announcement's example href is
          /security/ — an announcement that showed on the home page and vanished on the
          page it pointed at would be worse than none. */}
      <AnnouncementBanner />
      <SiteNav scheduleHref={scheduleHref} />
      {/*
        tabIndex={-1} for the same reason as App.tsx: Safari does not set the
        sequential-focus starting point on a non-focusable fragment target, so without it
        the skip link scrolls the page and leaves focus in the nav.
      */}
      <main id="main" tabIndex={-1}>{children}</main>
      <SiteFooter scheduleHref={scheduleHref} />
    </>
  );
}
