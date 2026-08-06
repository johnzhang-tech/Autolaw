/**
 * The rendered text of a subtree, with element boundaries preserved as whitespace.
 *
 * Not `textContent`. textContent concatenates adjacent elements with nothing between
 * them, so `<b>A Person</b><span>Founder</span>` comes back as "A PersonFounder" — and
 * every \b-anchored pattern in the credibility guards silently stops matching, because
 * there is no word boundary before "Founder" any more. That was not hypothetical: the
 * About page's invented-person guard passed with a fabricated founder rendered on the
 * page, and the security page's vocabulary guard had the same blind spot.
 *
 * Joining text nodes with a space restores the boundaries the guards are written against.
 * A guard that cannot fail is worse than no guard, so this file is load-bearing.
 */
export function renderedText(root: HTMLElement): string {
  const walker = root.ownerDocument.createTreeWalker(root, 4 /* NodeFilter.SHOW_TEXT */);
  const parts: string[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    parts.push(node.textContent ?? '');
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}
