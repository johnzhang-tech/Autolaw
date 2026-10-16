import './Wordmark.css';

/**
 * The AutoLaw wordmark.
 *
 * Set in Source Serif 4 — the family the site already loads for record text — rather
 * than shipped as an image. A bitmap mark blurs on a retina display, needs a second file
 * for the navy surfaces, and cannot be selected or searched; type stays sharp at every
 * size and takes its colour from whatever it sits on.
 *
 * The capital L is the whole idea: "Auto" is the technology, "Law" is the authority, and
 * one word carries both. It is a single text node, so a screen reader and a copy-paste
 * both get "AutoLaw" rather than two fragments.
 *
 * The name is styled here only. Body copy, page titles and the trust pages still write
 * "Autolaw"; changing those is a brand decision with SEO and legal-wording consequences,
 * not a styling one.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className ? `al-wordmark ${className}` : 'al-wordmark'}>AutoLaw</span>
  );
}
