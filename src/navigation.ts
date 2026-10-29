import { SECURITY_URL, ABOUT_URL, BLOG_URL, PRICING_URL } from './config';

/**
 * The site's destinations, in nav order. Root-relative so they work from the standalone
 * pages, where a bare "#product" would resolve to nothing. Nav and footer both read this
 * list, so a destination cannot be removed from one and linger in the other.
 *
 * Reports and Pricing sit directly after Product because they answer the two questions a
 * stranger arrives with — what do I get, and what does it cost — and the site answered
 * neither until now. Reports points at the home page band rather than a page of its own:
 * the band is the index, and each card already routes to a feature page that goes deeper.
 *
 * Solutions keeps its place after them. It answers "is this built for my practice",
 * which only matters once someone knows what is on offer.
 *
 * Blog sits after Security and before About: it is the one destination a visitor might
 * reach for before they are ready to talk to anyone, and About is where that interest
 * ends rather than where it starts.
 */
export const SITE_LINKS: ReadonlyArray<{ href: string; label: string }> = [
  { href: '/#product', label: 'Product' },
  { href: '/#reports', label: 'Reports' },
  { href: PRICING_URL, label: 'Pricing' },
  { href: '/#solutions', label: 'Solutions' },
  { href: SECURITY_URL, label: 'Security' },
  { href: BLOG_URL, label: 'Blog' },
  { href: ABOUT_URL, label: 'About' },
];
