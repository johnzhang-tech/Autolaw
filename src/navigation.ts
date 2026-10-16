import { SECURITY_URL, ABOUT_URL, BLOG_URL } from './config';

/**
 * The site's five destinations, in nav order. Root-relative so they work from the
 * standalone pages, where a bare "#product" would resolve to nothing. Nav and footer both
 * read this list, so a destination cannot be removed from one and linger in the other.
 *
 * Blog sits after Security and before About: it is the one destination a visitor might
 * reach for before they are ready to talk to anyone, and About is where that interest
 * ends rather than where it starts.
 */
export const SITE_LINKS: ReadonlyArray<{ href: string; label: string }> = [
  { href: '/#product', label: 'Product' },
  { href: '/#solutions', label: 'Solutions' },
  { href: SECURITY_URL, label: 'Security' },
  { href: BLOG_URL, label: 'Blog' },
  { href: ABOUT_URL, label: 'About' },
];
