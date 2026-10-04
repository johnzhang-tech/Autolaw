import { PageShell } from '../../PageShell';
import { PageHero } from '../../PageHero';
import { Section } from '../../../components/primitives/Section';
import { SECURITY_URL } from '../../../config';
import { AI_QUESTIONS, TRUST_LAST_VERIFIED } from '../../../data/trust';
import { PlannedList } from '../TrustCardView';
import '../TrustPages.css';

/* Copy comes from src/data/trust.ts; see the note at the top of SecurityPage.tsx. */
export function AiDataUsePage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Security"
        title="How Autolaw uses AI with your files"
        intro={
          <>
            Before a firm puts client files into an AI tool, it needs to know which models see
            them, whether those models learn from them, how long copies are kept, and where a
            lawyer stays in control. ABA Formal Opinion 512 (July 2024) asks lawyers to
            understand these points before using generative AI with client information. Last
            verified {TRUST_LAST_VERIFIED}.
          </>
        }
      />
      {AI_QUESTIONS.map((q, i) => (
        <Section key={q.id} id={q.id} heading={q.question}>
          {q.answers.length > 0 && (
            <ul className="al-trustp__answers">
              {q.answers.map((a) => <li key={a.text}>{a.text}</li>)}
            </ul>
          )}
          <PlannedList
            items={q.commitments ?? []}
            label={`Planned: ${q.question}`}
            className="al-trustp__planned"
            quarterClassName="al-trustp__quarter"
          />
          {i === AI_QUESTIONS.length - 1 && (
            <a className="al-trustp__back" href={SECURITY_URL}>Back to the Trust Center</a>
          )}
        </Section>
      ))}
    </PageShell>
  );
}
