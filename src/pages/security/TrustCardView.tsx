import type { Commitment, TrustCard } from '../../data/trust';

interface PlannedListProps {
  items: ReadonlyArray<Commitment>;
  label: string;
  className?: string;
  quarterClassName?: string;
}

/**
 * Dated plans, each visibly marked "Planned" with its quarter. `data-planned` lets the page
 * guard (trustGuard.ts) set these aside: a plan may name a control that does not exist yet.
 */
export function PlannedList({ items, label, className = 'al-secp__planned', quarterClassName = 'al-secp__quarter' }: PlannedListProps) {
  if (items.length === 0) return null;
  return (
    <ul className={className} aria-label={label} data-planned="">
      {items.map((c) => (
        <li key={c.text}>
          <span className={quarterClassName}>Planned · {c.quarter}</span>
          <span>{c.text}</span>
        </li>
      ))}
    </ul>
  );
}

interface Props {
  card: TrustCard;
  tone?: 'navy';
}

/** One trust card: what is true today, then anything planned, each with its quarter. */
export function TrustCardView({ card, tone }: Props) {
  return (
    <div className={tone === 'navy' ? 'al-secp__card al-secp__card--navy' : 'al-secp__card'}>
      <h3>{card.title}</h3>
      <p>{card.body}</p>
      <PlannedList items={card.commitments ?? []} label={`Planned: ${card.title}`} />
    </div>
  );
}
