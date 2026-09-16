import { useRef, useState } from 'react';
import { Button } from './primitives/Button';
import { ProductMenu } from './ProductMenu';
import { SecurityMark } from './SecurityMark';
import { LOGIN_URL, SCHEDULE_URL } from '../config';
import { SITE_LINKS } from '../navigation';
import './SiteNav.css';

const PRODUCT_LINK = SITE_LINKS.find((link) => link.label === 'Product')!;
const FLAT_LINKS = SITE_LINKS.filter((link) => link.label !== 'Product');

export function SiteNav({ scheduleHref = SCHEDULE_URL }: { scheduleHref?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productPinned, setProductPinned] = useState(false);
  const [productHovered, setProductHovered] = useState(false);
  const productButton = useRef<HTMLButtonElement>(null);
  const productOpen = productPinned || productHovered;

  const closeProduct = () => {
    setProductPinned(false);
    setProductHovered(false);
  };

  const linkLabel = (label: string) => (
    <>
      {label === 'Security' && <SecurityMark />}
      <span>{label}</span>
    </>
  );

  return (
    <header className="al-nav">
      <nav className="al-nav__nav" aria-label="Primary">
        <div className="al-container al-nav__inner">
          <a className="al-nav__brand" href="/">Autolaw</a>

          <ul className="al-nav__links">
            {/* The list item is the shared interaction boundary for its link, button, and
                popover. It never becomes a control itself; the handlers only coordinate
                the real controls nested inside it. */}
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
            <li
              className="al-nav__product"
              onMouseEnter={() => setProductHovered(true)}
              onMouseLeave={() => setProductHovered(false)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) closeProduct();
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape' && productOpen) {
                  event.preventDefault();
                  closeProduct();
                  productButton.current?.focus();
                }
              }}
            >
              <span className="al-nav__product-split">
                <a href={PRODUCT_LINK.href} aria-label="Product overview">Product</a>
                <button
                  ref={productButton}
                  type="button"
                  className="al-nav__product-toggle"
                  aria-label="Product menu"
                  aria-expanded={productOpen}
                  aria-controls="product-menu"
                  onClick={() => setProductPinned((value) => !value)}
                >
                  <i aria-hidden="true" />
                </button>
              </span>
              {productOpen && <ProductMenu id="product-menu" onNavigate={closeProduct} />}
            </li>

            {FLAT_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{linkLabel(link.label)}</a>
              </li>
            ))}
          </ul>

          <div className="al-nav__actions">
            {LOGIN_URL && <a className="al-nav__login" href={LOGIN_URL}>Log in</a>}
            <Button href={scheduleHref} variant="primary" size="md" withCaret>Schedule a call</Button>
          </div>

          <button
            type="button"
            className="al-nav__toggle"
            aria-expanded={mobileOpen}
            aria-controls="nav-mobile"
            onClick={() => setMobileOpen((value) => !value)}
          >
            <span className="al-visually-hidden">{mobileOpen ? 'Close menu' : 'Open menu'}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true" width="24" height="24">
              <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="al-nav__mobile" id="nav-mobile">
            <a
              className="al-nav__mobile-overview"
              href={PRODUCT_LINK.href}
              aria-label="Product overview"
              onClick={() => setMobileOpen(false)}
            >
              Product
            </a>
            <ProductMenu mobile onNavigate={() => setMobileOpen(false)} />
            <ul className="al-nav__mobile-flat">
              {FLAT_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} onClick={() => setMobileOpen(false)}>{linkLabel(link.label)}</a>
                </li>
              ))}
            </ul>
            {LOGIN_URL && (
              <ul>
                <li><a href={LOGIN_URL}>Log in</a></li>
              </ul>
            )}
            <Button href={scheduleHref} variant="primary" size="md" withCaret>Schedule a call</Button>
          </div>
        )}
      </nav>
    </header>
  );
}
