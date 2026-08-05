import type { ReactNode } from 'react';
import './Chip.css';

type Tone = 'verified' | 'conflict' | 'blocker' | 'unreviewed' | 'uncited';

export function Chip({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`al-chip al-chip--${tone}`}>
      {tone !== 'blocker' && tone !== 'uncited' && <i className="al-chip__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
