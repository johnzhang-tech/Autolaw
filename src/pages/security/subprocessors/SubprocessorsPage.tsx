import { PageShell } from '../../PageShell';
import { PageHero } from '../../PageHero';
import { Section } from '../../../components/primitives/Section';
import { SECURITY_URL } from '../../../config';
import { SUBPROCESSORS, SUBPROCESSOR_CHANGES, SUBPROCESSOR_NOTES, SUBPROCESSOR_NOTICE, TRUST_LAST_VERIFIED } from '../../../data/trust';
import { PlannedList } from '../TrustCardView';
import '../TrustPages.css';

/* Copy comes from src/data/trust.ts; see the note at the top of SecurityPage.tsx. */
export function SubprocessorsPage() {
  const latest = SUBPROCESSOR_CHANGES[SUBPROCESSOR_CHANGES.length - 1];
  return (
    <PageShell>
      <PageHero
        eyebrow="Security"
        title="Subprocessors"
        intro={
          <>
            The vendors that process your firm’s data on Autolaw’s behalf: what each one does,
            what it receives, where, and whether its terms let it train AI models on your data.
            Last verified {TRUST_LAST_VERIFIED}.
          </>
        }
      />

      <Section id="current" eyebrow={`Version ${latest.version}`} heading="Current subprocessors">
        {/*
          Focusable so keyboard users can scroll the table sideways: the standard WCAG 2.1.1
          pattern (role="region" + tabIndex={0} + a name), as in src/sections/Trust.tsx.
        */}
        <div
          className="al-trustp__table-wrap"
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          role="region"
          aria-label="Current subprocessors, scrollable"
        >
          <table className="al-trustp__table">
            <caption className="al-visually-hidden">Current subprocessors</caption>
            <thead>
              <tr>
                <th scope="col">Vendor</th>
                <th scope="col">What it does for Autolaw</th>
                <th scope="col">What it receives</th>
                <th scope="col">When</th>
                <th scope="col">Where</th>
                <th scope="col">Training on your data</th>
              </tr>
            </thead>
            <tbody>
              {SUBPROCESSORS.map((s) => (
                <tr key={s.vendor}>
                  <th scope="row">{s.vendor}</th>
                  <td>{s.purpose}</td>
                  <td>{s.receives}</td>
                  <td>{s.when}</td>
                  <td>{s.region}</td>
                  <td>{s.training}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="al-trustp__note">
          {SUBPROCESSOR_NOTES.map((n) => <span key={n.text}>{n.text} </span>)}
        </p>
      </Section>

      <Section id="changes" eyebrow="Changes" heading="How this list changes">
        <PlannedList
          items={[SUBPROCESSOR_NOTICE]}
          label="Planned: subprocessor changes"
          className="al-trustp__planned"
          quarterClassName="al-trustp__quarter"
        />
        <div
          className="al-trustp__table-wrap al-trustp__table-wrap--spaced"
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          role="region"
          aria-label="Versions of this list, scrollable"
        >
          <table className="al-trustp__table al-trustp__table--narrow">
            <caption>Versions of this list</caption>
            <thead>
              <tr>
                <th scope="col">Version</th>
                <th scope="col">Date</th>
                <th scope="col">Change</th>
              </tr>
            </thead>
            <tbody>
              {SUBPROCESSOR_CHANGES.map((c) => (
                <tr key={c.version}>
                  <th scope="row">{c.version}</th>
                  <td>{c.date}</td>
                  <td>{c.change}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <a className="al-trustp__back" href={SECURITY_URL}>Back to the Trust Center</a>
      </Section>
    </PageShell>
  );
}
