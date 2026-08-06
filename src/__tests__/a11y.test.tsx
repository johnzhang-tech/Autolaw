import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import App from '../App';
import { CHRONOLOGY, BODY_REGIONS } from '../data/demoCase';

describe('page accessibility', () => {
  it('has exactly one h1', () => {
    render(<App />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('offers a skip link as the first focusable element', () => {
    render(<App />);
    const skip = screen.getByRole('link', { name: /skip to content/i });
    expect(skip).toHaveAttribute('href', '#main');
  });

  it('labels every section landmark', () => {
    render(<App />);
    const regions = screen.getAllByRole('region');
    regions.forEach((r) => expect(r).toHaveAccessibleName());
  });

  /*
   * As written in the plan this asserts nothing today: CUSTOMER_LOGOS is empty, so the
   * page renders zero <img> elements and the loop body never runs. It is kept because it
   * starts working the moment a logo is added, and the static scan below covers the gap
   * in the meantime.
   */
  it('gives every image an alt attribute', () => {
    const { container } = render(<App />);
    container.querySelectorAll('img').forEach((img) => {
      expect(img).toHaveAttribute('alt');
    });
  });

  it('declares alt on every img in the source, rendered or not', () => {
    const walk = (dir: string, out: string[] = []): string[] => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) walk(full, out);
        else if (/\.tsx?$/.test(entry.name) && !full.includes('__tests__')) out.push(full);
      }
      return out;
    };

    const tags = walk(join(process.cwd(), 'src')).flatMap((file) =>
      [...readFileSync(file, 'utf8').matchAll(/<img\b[^>]*>/g)].map((m) => ({ file, tag: m[0] }))
    );
    const missing = tags.filter(({ tag }) => !/\balt\s*=/.test(tag));
    expect(missing.map(({ file, tag }) => `${file}: ${tag}`)).toEqual([]);
  });

  it('exposes a single main landmark', () => {
    render(<App />);
    expect(screen.getAllByRole('main')).toHaveLength(1);
  });
});

/*
 * The plan's steps 3-5 were written as manual browser passes. jsdom cannot replace a
 * human at a keyboard, but the parts that are structural rather than visual — what is
 * in the tab sequence, in what order, and with what tabindex — are exactly the parts
 * that regress silently. Those are asserted below. What is left to a human is recorded
 * honestly in the comments on each block.
 */

/** Everything the browser puts in the sequential focus order, in document order. */
const FOCUSABLE = 'a[href], area[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]';

function focusStops(root: ParentNode): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) => (el.getAttribute('tabindex') ?? '0') !== '-1'
  );
}

/*
 * Assertions below compare DOM nodes as booleans rather than with toContain/toEqual.
 * Chai builds an assertion's message eagerly even when it passes, and inspecting a
 * React-rendered DOM node walks its __reactProps$ payload — which trips React's dev-mode
 * "`key` is not a prop" getters and fills the run with warnings that mean nothing.
 */
const describeEl = (el: Element) =>
  `<${el.tagName.toLowerCase()}${el.id ? ` id="${el.id}"` : ''}> ${(el.textContent ?? '').trim().slice(0, 40)}`;

describe('keyboard reachability', () => {
  /*
   * Not verified here: that the focus ring is *visible* once focus lands. jsdom does no
   * painting and no :focus-visible matching, so contrast of the teal ring on both the
   * light and navy surfaces still needs a human in a browser.
   */
  it('puts every control named in the manual pass on the tab sequence, and each takes focus', () => {
    const { container } = render(<App />);
    const stops = focusStops(container);

    const reachable = (el: Element) => {
      expect(stops.includes(el as HTMLElement), `${describeEl(el)} is not a focus stop`).toBe(true);
      (el as HTMLElement).focus();
      expect(el).toHaveFocus();
    };

    // Skip link
    reachable(screen.getByRole('link', { name: /skip to content/i }));

    /*
     * The counts below are exact on purpose. Looping over whatever the role query
     * returns is not enough: the failure this is guarding against is a control quietly
     * becoming a <div onClick>, and that control simply drops out of the query — the
     * loop then passes over a shorter list and reports nothing.
     */

    // Nav links: brand, four section links, log in, and the header CTA
    const nav = screen.getByRole('navigation', { name: /primary/i });
    const navLinks = within(nav).getAllByRole('link');
    expect(navLinks.length).toBe(7);
    navLinks.forEach(reachable);

    // CTAs, wherever they appear
    screen.getAllByRole('link', { name: /analyze one case/i }).forEach(reachable);
    // "Email us" since the secondary CTA is a mailto:, not a scheduling link.
    reachable(screen.getByRole('link', { name: /email us/i }));

    // Chronology events — every one, not just the selected one
    const events = screen.getAllByRole('button', { expanded: false })
      .concat(screen.getAllByRole('button', { expanded: true }));
    expect(events.length).toBe(CHRONOLOGY.length);
    events.forEach(reachable);

    // Body explorer regions
    const regions = screen.getAllByRole('button', { pressed: false })
      .concat(screen.getAllByRole('button', { pressed: true }));
    expect(regions.length).toBe(BODY_REGIONS.length);
    regions.forEach(reachable);

    // Practice tabs: roving tabindex means only the selected one is a stop, but both
    // must be able to hold focus once an arrow key moves to them.
    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBe(2);
    expect(tabs.filter((t) => stops.includes(t)).length).toBe(1);
    tabs.forEach((t) => {
      t.focus();
      expect(t).toHaveFocus();
    });

    // Comparison scroller — focusable so a keyboard user can scroll it
    reachable(screen.getByTestId('comparison-scroller'));

    // Footer links: four section links, log in, and contact
    const footer = screen.getByRole('contentinfo');
    const footerLinks = within(footer).getAllByRole('link');
    expect(footerLinks.length).toBe(6);
    footerLinks.forEach(reachable);
  });

  it('makes the skip link the first stop in document order', () => {
    const { container } = render(<App />);
    const first = focusStops(container)[0];
    const skip = screen.getByRole('link', { name: /skip to content/i });
    expect(first === skip, `first focus stop is ${describeEl(first)}`).toBe(true);
  });

  it('uses no positive tabindex, so the tab order follows the document', () => {
    const { container } = render(<App />);
    const positive = [...container.querySelectorAll('[tabindex]')].filter(
      (el) => Number(el.getAttribute('tabindex')) > 0
    );
    expect(positive.map((el) => el.outerHTML.slice(0, 80))).toEqual([]);
  });

  /*
   * Arrow-key movement itself is covered by PracticeSolutions.test.tsx and
   * BodyExplorer.test.tsx. What is asserted here is the invariant those interactions
   * depend on: a tablist must expose exactly one tab stop, or Tab lands inside the
   * widget twice and the arrow keys stop being the way you move.
   */
  it('keeps exactly one practice tab in the tab sequence as selection moves', async () => {
    const user = userEvent.setup();
    render(<App />);
    const inSequence = () => screen.getAllByRole('tab').filter((t) => t.tabIndex === 0);

    expect(inSequence()).toHaveLength(1);
    expect(inSequence()[0]).toHaveAccessibleName(/personal injury/i);

    await user.click(screen.getByRole('tab', { name: /workers/i }));

    expect(inSequence()).toHaveLength(1);
    expect(inSequence()[0]).toHaveAccessibleName(/workers/i);
  });
});

describe('landmarks and identifiers', () => {
  it('exposes exactly one landmark of each page-level kind', () => {
    render(<App />);
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getAllByRole('banner')).toHaveLength(1);
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1);
    expect(screen.getAllByRole('navigation')).toHaveLength(1);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('makes the site header the banner, with navigation nested inside it', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toContainElement(screen.getByRole('navigation'));
  });

  /*
   * The banner is the site header, and the navigation lives inside it — the conventional
   * pairing, and what gives the skip link a region to actually skip. What is not fine is a
   * *second* banner or contentinfo appearing inside <main>, which is what happens the
   * moment anyone reaches for <header> to wrap a section.
   *
   * Worth knowing why this is asserted with .closest('main') rather than trusted to the
   * spec: HTML-AAM scopes <header>/<footer> to generic when they are inside
   * article/aside/main/nav/section, and browsers implement that — but
   * @testing-library/dom 10.4.1 does not. aria-query 5.3.0 carries the constraint
   * ("scoped to the body element"), and the role resolver drops it, building its selector
   * from element name and attributes alone. So a <header> or <footer> anywhere in this
   * tree reads as banner/contentinfo to this suite and to anything else built on the same
   * resolver. That divergence is the reason Hero is a <div>.
   */
  it('puts no banner or contentinfo landmark inside main', () => {
    render(<App />);
    const main = screen.getByRole('main');
    const nested = [...screen.queryAllByRole('banner'), ...screen.queryAllByRole('contentinfo')]
      .filter((el) => main.contains(el))
      .map((el) => el.outerHTML.slice(0, 60));
    expect(nested).toEqual([]);
  });

  /*
   * Both assertions below close the same blind spot, and it is a real one — each was
   * demonstrated by breaking the app and watching the whole suite stay green.
   *
   * Drop a Section's `id` and it loses its heading reference, loses its accessible name,
   * and therefore drops *out of* role="region" — so any test that loops over
   * getAllByRole('region') just iterates a shorter list and reports nothing. Point a nav
   * link at a section that no longer exists and nothing notices either.
   *
   * In this codebase `id` does double duty: it labels the landmark and it is the nav
   * anchor target. So one missing attribute breaks navigation and accessibility at once,
   * silently. Counting regions and resolving every in-page href is the cheap way to catch
   * it — cheaper than either bug.
   */
  it('exposes one labelled region per content section', () => {
    const { container } = render(<App />);

    /*
     * Checked by id rather than by count, so this fails with the name of whatever went
     * missing instead of an off-by-one. Hero is absent on purpose — it is a <div>, since
     * a <header> there would read as a second banner landmark.
     */
    const SECTIONS = ['transformation', 'products', 'solutions', 'trust', 'contact'];
    const unlabelled = SECTIONS.filter((id) => {
      const el = container.querySelector(`section[id="${id}"]`);
      if (!el) return true;
      const labelledBy = el.getAttribute('aria-labelledby');
      return !labelledBy || !container.querySelector(`[id="${labelledBy}"]`);
    });
    expect(unlabelled).toEqual([]);
  });

  it('resolves every in-page anchor to an element that exists', () => {
    const { container } = render(<App />);
    const anchors = [...container.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')];
    expect(anchors.length).toBeGreaterThan(5);

    const broken = anchors
      .map((a) => a.getAttribute('href')!)
      .filter((href) => href !== '#')
      .filter((href) => !container.querySelector(`[id="${href.slice(1)}"]`));

    expect([...new Set(broken)]).toEqual([]);
  });

  it('emits no duplicate element ids', () => {
    const { container } = render(<App />);
    const ids = [...container.querySelectorAll('[id]')].map((el) => el.id);
    const seen = new Set<string>();
    const duplicates = ids.filter((id) => (seen.has(id) ? true : (seen.add(id), false)));
    expect(ids.length).toBeGreaterThan(5);
    expect([...new Set(duplicates)]).toEqual([]);
  });

  /*
   * A dangling aria-labelledby is silent and destructive: the reference resolves to
   * nothing, the element ends up with an empty accessible name, and a landmark can stop
   * being exposed entirely — which is exactly the trap Section.tsx guards against.
   *
   * aria-controls is held to a weaker rule on purpose, the same one axe-core applies: a
   * collapsed disclosure or an unselected tab is allowed to name a target that is not
   * rendered yet, because aria-expanded="false" / aria-selected="false" already explains
   * the absence. An *expanded* control pointing at nothing is still a failure.
   */
  it('resolves every aria reference to an element that exists', () => {
    const { container } = render(<App />);
    const exempt = (el: Element) =>
      el.getAttribute('aria-expanded') === 'false' || el.getAttribute('aria-selected') === 'false';

    const dangling: string[] = [];
    for (const attr of ['aria-labelledby', 'aria-describedby', 'aria-controls']) {
      container.querySelectorAll(`[${attr}]`).forEach((el) => {
        if (attr === 'aria-controls' && exempt(el)) return;
        for (const id of (el.getAttribute(attr) ?? '').split(/\s+/).filter(Boolean)) {
          if (!container.querySelector(`#${CSS.escape(id)}`)) {
            dangling.push(`<${el.tagName.toLowerCase()}> ${attr}="${id}"`);
          }
        }
      });
    }
    expect(dangling).toEqual([]);
  });
});

/*
 * The remaining checks read the stylesheet Vite actually ships, not the source files,
 * because the source passing tells you nothing about what survived bundling and
 * minification. The build is cheap (well under a second) so it runs here rather than
 * being assumed present — build/ is gitignored, and a stale artifact would produce a
 * false pass.
 */
interface CssRule {
  prelude: string;
  body: string;
}

/**
 * Split a stylesheet — or the body of an at-rule — into its top-level rules. Brace
 * matched, so @media and @keyframes come back whole instead of being cut at their
 * first inner `}`. Assumes no braces inside strings or url(); true of this stylesheet.
 */
function topLevelRules(css: string): CssRule[] {
  const rules: CssRule[] = [];
  let prelude = '';
  for (let i = 0; i < css.length; i++) {
    if (css[i] !== '{') {
      prelude += css[i];
      continue;
    }
    let depth = 1;
    let j = i + 1;
    for (; j < css.length && depth > 0; j++) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') depth--;
    }
    rules.push({ prelude: prelude.trim(), body: css.slice(i + 1, j - 1) });
    prelude = '';
    i = j - 1;
  }
  return rules;
}

const isAtRule = (r: CssRule) => r.prelude.startsWith('@');
const isReducedMotion = (r: CssRule) =>
  /^@media/.test(r.prelude) && /prefers-reduced-motion\s*:\s*reduce/.test(r.prelude);

const selectorsOf = (r: CssRule) =>
  r.prelude.split(',').map((s) => s.replace(/\s+/g, ' ').trim());

/**
 * Every plain style rule reachable from `rules`, descending only into at-rules that
 * `into` accepts. @keyframes bodies are skipped — their `0%`/`to` blocks are step
 * definitions, not selectors.
 */
function styleRules(rules: CssRule[], into: (r: CssRule) => boolean = () => true): CssRule[] {
  return rules.flatMap((r) => {
    if (/^@keyframes/.test(r.prelude)) return [];
    if (isAtRule(r)) return into(r) ? styleRules(topLevelRules(r.body), into) : [];
    return [r];
  });
}

/**
 * Only the style rules *nested inside* an at-rule matching `where` — top-level rules are
 * excluded. Distinct from styleRules on purpose: asking "what does this media query
 * change?" must not be answered with the unconditional rule of the same selector, or the
 * media query could be deleted entirely and the assertion would still pass.
 */
function rulesInside(rules: CssRule[], where: (r: CssRule) => boolean): CssRule[] {
  return rules.flatMap((r) => {
    if (!isAtRule(r) || /^@keyframes/.test(r.prelude)) return [];
    const inner = topLevelRules(r.body);
    return where(r) ? styleRules(inner) : rulesInside(inner, where);
  });
}

let css = '';

describe('shipped stylesheet', () => {
  beforeAll(() => {
    const root = process.cwd();
    execFileSync('npm', ['run', 'build'], { cwd: root, stdio: 'pipe' });
    const assets = join(root, 'build', 'assets');
    const sheets = readdirSync(assets).filter((f) => f.endsWith('.css'));
    expect(sheets.length).toBeGreaterThan(0);
    css = sheets.map((f) => readFileSync(join(assets, f), 'utf8')).join('\n');
  }, 120_000);

  /*
   * The reduced-motion pass the plan asks a human to do by toggling the OS setting.
   * What a human still has to confirm is that nothing *disappears* when motion is off —
   * a fade-in disabled by removing the element rather than the animation would pass here.
   */
  it('disables every animation it defines under prefers-reduced-motion', () => {
    const rules = topLevelRules(css);
    const names = [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]);

    // Guard against a vacuous pass: if the parser found no animations, the loop below
    // would assert nothing at all. al-fade is the site's only @keyframes — al-pulse went
    // with the fabricated "Live" badge, and the loop's own "defined but never used" check
    // is what stops a dead keyframe from lingering here again.
    expect(names).toEqual(expect.arrayContaining(['al-fade']));

    const disabled = new Set(
      rulesInside(rules, isReducedMotion)
        .filter((r) => /(^|;)\s*animation(-name)?\s*:\s*none\s*(;|$)/.test(r.body))
        .flatMap(selectorsOf)
    );

    for (const name of names) {
      const animating = styleRules(rules, (r) => !isReducedMotion(r))
        .filter((r) => new RegExp(`(^|;)\\s*animation(-name)?\\s*:[^;]*\\b${name}\\b`).test(r.body))
        .flatMap(selectorsOf);

      expect(animating, `@keyframes ${name} is defined but never used`).not.toEqual([]);
      const uncovered = animating.filter((s) => !disabled.has(s));
      expect(
        uncovered,
        `${uncovered.join(', ')} runs @keyframes ${name} with no prefers-reduced-motion escape`
      ).toEqual([]);
    }
  });

  /*
   * @keyframes is only half the motion surface. Every transition on the site gets its
   * duration from an --al-duration-* token, and the reduced-motion block in tokens.css
   * collapses those tokens to 1ms — which means that one block is the only thing standing
   * between a reduced-motion user and every hover and selection transition on the page.
   * A hardcoded duration would route around it silently.
   */
  it('routes every transition through a duration token the reduced-motion block collapses', () => {
    const rules = topLevelRules(css);

    const literal = styleRules(rules, (r) => !isReducedMotion(r))
      .flatMap((r) =>
        [...r.body.matchAll(/(?:^|;)\s*transition(?:-duration)?\s*:([^;]*)/g)].map((m) => ({
          selector: r.prelude,
          value: m[1],
        }))
      )
      .filter(({ value }) => /(^|[\s,(])\d*\.?\d+m?s(\s|,|$)/.test(value));
    expect(literal.map((l) => `${l.selector} { transition:${l.value} }`)).toEqual([]);

    const collapsed = rulesInside(rules, isReducedMotion)
      .filter((r) => selectorsOf(r).includes(':root'))
      .map((r) => r.body)
      .join(';');
    for (const token of ['fast', 'base', 'slow']) {
      const value = collapsed.match(new RegExp(`--al-duration-${token}\\s*:\\s*([^;}]+)`))?.[1];
      expect(value?.trim(), `--al-duration-${token} is not collapsed under reduced motion`)
        .toMatch(/^(0|0m?s|1ms)$/);
    }
  });

  /*
   * jsdom does no CSS layout, so no test here can prove the page reflows. What is
   * proved is that the breakpoints the plan claims survive into the shipped bundle —
   * a deleted or renamed media query fails this. Whether the result actually looks
   * right at 360/768/1024/1440, and whether the page avoids horizontal scroll, still
   * needs a human in a browser.
   */
  it('ships the documented layout breakpoints', () => {
    const rules = topLevelRules(css);

    const at = (maxWidth: number, selector: string) =>
      rulesInside(rules, (r) => new RegExp(`max-width\\s*:\\s*${maxWidth}px`).test(r.prelude))
        .filter((r) => selectorsOf(r).includes(selector))
        .map((r) => r.body)
        .join(';');

    /*
     * One column, written either way. A bare `1fr` is `minmax(auto, 1fr)`, so the track
     * still floors at min-content and a wide child pushes the grid past the viewport;
     * `minmax(0, 1fr)` is the same single column that is also allowed to shrink. What
     * this assertion is protecting is the collapse, not which of the two spellings a
     * given grid needs.
     */
    const ONE_COLUMN = /grid-template-columns:\s*(?:minmax\(\s*0\s*,\s*1fr\s*\)|1fr)\s*(?:;|$)/;

    expect(at(900, '.al-hero__grid')).toMatch(ONE_COLUMN);
    expect(at(520, '.al-cockpit__tiles')).toMatch(/grid-template-columns:\s*repeat\(2,\s*1fr\)/);
    expect(at(860, '.al-chron__body')).toMatch(ONE_COLUMN);
    expect(at(780, '.al-bx__body')).toMatch(ONE_COLUMN);
  });

  it('keeps the comparison table scrolling inside its own container', () => {
    const rules = topLevelRules(css);
    const decls = (selector: string) =>
      styleRules(rules)
        .filter((r) => selectorsOf(r).includes(selector))
        .map((r) => r.body)
        .join(';');

    // The wide table is what forces the scroll; the scroller is what absorbs it. Either
    // one alone puts the overflow on the page instead.
    expect(decls('.al-cmp table')).toMatch(/min-width:\s*\d+px/);
    expect(decls('.al-cmp__scroller')).toMatch(/overflow-x:\s*auto/);
  });
});
