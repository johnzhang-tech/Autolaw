import { SECURITY_URL, ABOUT_URL } from './config';

/**
 * The site's four destinations, in nav order. Root-relative so they work from the
 * standalone pages, where a bare "#story" would resolve to nothing. Nav and footer both
 * read this list, so a destination cannot be removed from one and linger in the other.
 */
export const SITE_LINKS: ReadonlyArray<{ href: string; label: string }> = [
  { href: '/#story-arrives', label: 'Product' },
  { href: '/#solutions', label: 'Solutions' },
  { href: SECURITY_URL, label: 'Security' },
  { href: ABOUT_URL, label: 'About' },
];
