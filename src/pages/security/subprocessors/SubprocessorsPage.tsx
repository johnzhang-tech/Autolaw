import { PageShell } from '../../PageShell';
import { PageHero } from '../../PageHero';
import { Section } from '../../../components/primitives/Section';
import { SECURITY_URL } from '../../../config';
import { SUBPROCESSORS, SUBPROCESSOR_CHANGES, SUBPROCESSOR_NOTICE, TRUST_LAST_VERIFIED } from '../../../data/trust';
import { PlannedList } from '../TrustCardView';
import '../TrustPages.css';

/* Copy comes from src/data/trust.ts; see the note at the top of SecurityPage.tsx. */
export function SubprocessorsPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Security"
        title="Subprocessors"
        intro={
          <>
            The vendors that process your firm’s data on Autolaw’s behalf: what each one does,
            what it receives, where, and whether its terms let it train AI models on your data.
            We add a vendor only when a feature needs it. Last verified {TRUST_LAST_VERIFIED}.
          </>
        }
      />

      <Section id="current" eyebrow="Version 1.0" heading="Current subprocessors">
        <div className="al-trustp__table-wrap">
          <table className="al-trustp__table">
            <caption>Current subprocessors</caption>
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
          OpenAI is not used. Anthropic receives no document text in our current configuration.
        </p>
      </Section>

      <Section id="changes" eyebrow="Changes" heading="How this list changes">
        <PlannedList
          items={[SUBPROCESSOR_NOTICE]}
          label="Planned: subprocessor changes"
          className="al-trustp__planned"
          quarterClassName="al-trustp__quarter"
        />
        <div className="al-trustp__table-wrap" style={{ marginTop: 'var(--al-space-4)' }}>
          <table className="al-trustp__table" style={{ minWidth: '28rem' }}>
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
