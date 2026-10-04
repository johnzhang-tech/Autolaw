import type { TrustCard } from '../../data/trust';

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
      {card.commitments && card.commitments.length > 0 && (
        <ul className="al-secp__planned" aria-label={`Planned: ${card.title}`}>
          {card.commitments.map((c) => (
            <li key={c.text}>
              <span className="al-secp__quarter">{c.quarter}</span>
              <span>{c.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
