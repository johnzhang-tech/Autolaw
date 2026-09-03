import { PageShell } from './PageShell';
import { PageHero } from './PageHero';
import { CONTACT_EMAIL, type LegalSection } from '../config';
import './LegalPage.css';

interface Props { title: string; eyebrow: string; sections: ReadonlyArray<LegalSection> }

/**
 * A legal document from an owner slot. An empty slot is stated as what it is — not
 * published here yet — with the address that answers in the meantime. No template text.
 */
export function LegalPage({ title, eyebrow, sections }: Props) {
  return (
    <PageShell>
      <PageHero eyebrow={eyebrow} title={title} />
      <div id="legal-intro"></div>
      <section className="al-container al-legal" id="legal-content" role="region" aria-label={title}>
        {sections.length === 0 ? (
          <div id="legal-notice">
            <p className="al-legal__unpublished">
              This document is not yet published here. Ask for the current version at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we will send it.
            </p>
          </div>
        ) : (
          sections.map((s, i) => (
            <section key={s.heading} id={`legal-section-${i}`} className="al-legal__section" aria-labelledby={`legal-${s.heading.replace(/\W+/g, '-').toLowerCase()}`}>
              <h2 id={`legal-${s.heading.replace(/\W+/g, '-').toLowerCase()}`}>{s.heading}</h2>
              {s.paragraphs.map((p, j) => <p key={j}>{p}</p>)}
            </section>
          ))
        )}
      </section>
    </PageShell>
  );
}
