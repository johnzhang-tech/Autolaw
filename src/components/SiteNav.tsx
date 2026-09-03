import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Button } from './primitives/Button';
import { LOGIN_URL, SCHEDULE_URL, RESOURCE_MENU, ABOUT_MENU, type NavMenuItem } from '../config';
import './SiteNav.css';

/*
 * Product leads. The information architecture states what the thing is before it argues
 * about who it is for or how it works, which is the order the owner asked for.
 */
/*
 * Root-relative, not bare fragments. The nav and footer render on /security/, /about/,
 * and /schedule-call/ too, where "#products" resolves to nothing on the current page and
 * the link silently does nothing. "/#products" navigates home and then scrolls.
 */
const LINKS = [
  { href: '/#products', label: 'Product' },
  { href: '/#solutions', label: 'Solution' },
  { href: '/#transformation', label: 'How it works' },
];

/*
 * Both menus come from config, and both are allowed to be empty. "Trust" used to be a
 * top-level link; it now lives in Resources as Security, pointing at a real page.
 */
const MENUS = [
  { id: 'resources', label: 'Resources', items: RESOURCE_MENU },
  { id: 'about', label: 'About', items: ABOUT_MENU },
];

const panelId = (id: string) => `nav-menu-${id}`;

interface NavMenuProps {
  /** Identifies the menu to the parent, and names its panel element. */
  id: string;
  label: string;
  items: ReadonlyArray<NavMenuItem>;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}

/**
 * One dropdown. Controlled by the parent so that opening this one closes the other —
 * two open panels overlapping each other is the tell of a menu nobody tested.
 *
 * Not a hover menu: hover opens nothing on a touch screen and cannot be reached from a
 * keyboard, so this is a disclosure driven by click and by the arrow keys. Plain links
 * inside, not role="menu" — APG reserves the menu roles for application menus, and a
 * screen reader reading these as links is what a visitor actually wants here.
 */
export function NavMenu({ id, label, items, open, onToggle, onClose }: NavMenuProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  /** Where to land when a key, rather than a click, is what opened the panel. */
  const focusOnOpen = useRef<'first' | 'last' | null>(null);

  useEffect(() => {
    if (!open || focusOnOpen.current === null) return;
    // Indexed off `items`, not off the ref array, which can still hold entries from a
    // longer previous list.
    const target = itemRefs.current[focusOnOpen.current === 'first' ? 0 : items.length - 1];
    focusOnOpen.current = null;
    target?.focus();
  }, [open]);

  /*
   * The guard this whole component exists for. A menu with no items renders nothing at
   * all — not a disabled trigger, not a panel saying "coming soon". Autolaw has no blog,
   * no webinars, and no case studies; a dropdown that opens onto that admission is the
   * same credibility failure as the fabricated customer logos, and costs the same trust.
   */
  if (items.length === 0) return null;

  const focusAt = (i: number) => {
    const n = items.length;
    itemRefs.current[((i % n) + n) % n]?.focus();
  };

  const closeToTrigger = () => {
    onClose();
    triggerRef.current?.focus();
  };

  function onTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'Escape') {
      if (!open) return;
      e.preventDefault();
      onClose(); // Focus is already on the trigger; nothing to restore.
      return;
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const where = e.key === 'ArrowDown' ? 'first' : 'last';
    if (open) {
      focusAt(where === 'first' ? 0 : items.length - 1);
      return;
    }
    // The panel is not mounted yet, so the effect above does the focusing once it is.
    focusOnOpen.current = where;
    onToggle();
  }

  function onItemKeyDown(e: KeyboardEvent<HTMLAnchorElement>, i: number) {
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); focusAt(i + 1); break;
      case 'ArrowUp': e.preventDefault(); focusAt(i - 1); break;
      case 'Home': e.preventDefault(); focusAt(0); break;
      case 'End': e.preventDefault(); focusAt(items.length - 1); break;
      case 'Escape': e.preventDefault(); closeToTrigger(); break;
      // Tabbing past the last item leaves the panel behind; close it, but let the
      // browser move focus wherever it was going.
      default: break;
    }
  }

  return (
    /*
     * Closing on focusout rather than on Tab. A `case 'Tab': onClose()` in the item handler
     * fired on every Tab, not only past the last item, so the panel unmounted underneath a
     * keyboard user moving from item one to item two — latent only because both menus
     * currently ship a single item. focusout also covers Shift+Tab back off the trigger,
     * which the key handler never saw. relatedTarget is null when focus leaves the document
     * entirely (window blur), and the panel should stay put for that.
     */
    <li
      className="al-nav__menu"
      data-menu={id}
      data-open={open || undefined}
      onBlur={(e) => {
        if (!open) return;
        const next = e.relatedTarget as Node | null;
        if (next && !e.currentTarget.contains(next)) onClose();
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className="al-nav__trigger"
        aria-expanded={open}
        aria-controls={panelId(id)}
        onClick={onToggle}
        onKeyDown={onTriggerKeyDown}
      >
        {label}
        <i className="al-nav__chev" aria-hidden="true" />
      </button>

      {open && (
        <div className="al-nav__panel" id={panelId(id)}>
          <ul>
            {items.map((item, i) => (
              <li key={item.href}>
                <a
                  ref={(el) => { itemRefs.current[i] = el; }}
                  href={item.href}
                  onClick={onClose}
                  onKeyDown={(e) => onItemKeyDown(e, i)}
                >
                  <span className="al-nav__panel-label">{item.label}</span>
                  {item.description && <span className="al-nav__panel-desc">{item.description}</span>}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  /*
   * Click-outside. Scoped to the open menu's own wrapper rather than to the whole bar, so
   * pressing the other trigger closes this panel on mousedown and the click that follows
   * opens that one — one gesture, one open menu.
   */
  useEffect(() => {
    if (openMenu === null) return;
    const onMouseDown = (e: globalThis.MouseEvent) => {
      const wrapper = navRef.current?.querySelector(`[data-menu="${openMenu}"]`);
      if (wrapper && !wrapper.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [openMenu]);

  const toggleMenu = (id: string) => setOpenMenu((prev) => (prev === id ? null : id));

  /*
   * Below 860px the popovers are gone entirely — the drawer lists each menu as an already
   * expanded section instead. A popover inside a drawer is two layers of disclosure for
   * one link, and on a phone the second one is where people give up.
   */
  const drawerMenus = MENUS.filter((m) => m.items.length > 0);

  return (
    /*
     * <header> is the site banner; the <nav> inside it is the navigation landmark.
     * Keeping them as two elements rather than one is what gives screen-reader users a
     * banner to skip past — the skip link implies a region to skip, and collapsing the
     * two would leave the page with none.
     */
    <header className="al-nav">
      <nav className="al-nav__nav" aria-label="Primary" ref={navRef}>
        <div className="al-container al-nav__inner">
          <a className="al-nav__brand" href="/">Autolaw</a>

          <ul className="al-nav__links">
            {LINKS.map((l) => (
              <li key={l.href}><a href={l.href}>{l.label}</a></li>
            ))}
            {MENUS.map((m) => (
              <NavMenu
                key={m.id}
                id={m.id}
                label={m.label}
                items={m.items}
                open={openMenu === m.id}
                onToggle={() => toggleMenu(m.id)}
                onClose={() => setOpenMenu(null)}
              />
            ))}
          </ul>

          <div className="al-nav__actions">
            {LOGIN_URL && <a className="al-nav__login" href={LOGIN_URL}>Log in</a>}
            {/* Sales-assisted, not self-serve: the trial CTA leads the hero, and the bar
                carries the other half of the pair. */}
            <Button href={SCHEDULE_URL} variant="primary" size="md" withCaret>Schedule a call</Button>
          </div>

          <button
            type="button"
            className="al-nav__toggle"
            aria-expanded={open}
            aria-controls="nav-mobile"
            onClick={() => setOpen(!open)}
          >
            <span className="al-visually-hidden">{open ? 'Close menu' : 'Open menu'}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true" width="24" height="24">
              <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          </button>
        </div>

        {open && (
          <div className="al-nav__mobile" id="nav-mobile">
            <ul>
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
                </li>
              ))}
            </ul>

            {drawerMenus.map((m) => (
              <div key={m.id} className="al-nav__mobile-group">
                <p className="al-nav__mobile-label" id={`nav-mobile-${m.id}`}>{m.label}</p>
                <ul aria-labelledby={`nav-mobile-${m.id}`}>
                  {m.items.map((item) => (
                    <li key={item.href}>
                      <a href={item.href} onClick={() => setOpen(false)}>{item.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {LOGIN_URL && (
              <ul>
                <li><a href={LOGIN_URL}>Log in</a></li>
              </ul>
            )}
            <Button href={SCHEDULE_URL} variant="primary" size="md" withCaret>Schedule a call</Button>
          </div>
        )}
      </nav>
    </header>
  );
}
