import { CHAPTERS, type ChapterIndex } from './chapters';
import './Story.css';

/**
 * Progress and the keyboard path in one. Eight links — the hero plus seven chapters —
 * with hidden labels, so a screen reader hears "3. Both records stay visible" and a
 * sighted reader sees a dot. A group, not a <nav>: the page has one navigation landmark
 * and this is not it.
 */
export function ChapterList({ active }: { active: ChapterIndex }) {
  const items: Array<{ href: string; label: string; index: ChapterIndex }> = [
    { href: '#story', label: 'Start: the case as it is', index: 0 },
    ...CHAPTERS.map((c) => ({ href: `#${c.id}`, label: `${c.index}. ${c.heading}`, index: c.index })),
  ];
  return (
    <div className="al-chapters" role="group" aria-label="Story chapters">
      <ol>
        {items.map((it) => (
          <li key={it.href}>
            <a href={it.href} aria-current={active === it.index ? 'step' : undefined}>
              <span className="al-visually-hidden">{it.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
