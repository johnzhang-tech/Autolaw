import { PageShell } from '../PageShell';
import { PageHero } from '../PageHero';
import { Section } from '../../components/primitives/Section';
import { Button } from '../../components/primitives/Button';
import { PRICING_URL, SCHEDULE_URL } from '../../config';
import { FEATURE_BY_ID } from '../../data/product';
import {
  CHRONOLOGY_SAMPLE,
  FICTIONAL_NOTICE,
  HOWELL_SAMPLE,
  QME_SAMPLE,
  SAMPLE_CARDS,
  howellTotals,
  usd,
  type Cite,
} from '../../data/sampleReports';
import './SampleReportsPage.css';

const PRACTICE_LABEL: Record<'PI' | 'WC', string> = {
  PI: 'Personal injury',
  WC: 'Workers’ compensation',
};

/**
 * "Northside Orthopedics · p. 412". One element, so it reads as one line.
 *
 * Document and page, matching citationText() in case-app exactly. The quoted text above
 * it is the snippet, which is the only finer locator the product has.
 */
function Citation({ cite }: { cite: Cite }) {
  return (
    <p className="al-sample__cite">
      {cite.document} &middot; p.&nbsp;{cite.page}
    </p>
  );
}

export function SampleReportsPage() {
  const totals = howellTotals(HOWELL_SAMPLE.rows);

  return (
    <PageShell>
      <PageHero
        eyebrow="Sample reports"
        title="Read the work product before you talk to anyone."
        intro={
          <>
            These are reports, not screenshots of a dashboard. Follow a citation, find the
            contradiction we flagged, and see what the report says when a record is missing.
          </>
        }
      >
        {/*
          Above the samples, not beneath them. A disclaimer a reader meets after they have
          already taken the material for a real client's file has done nothing.
        */}
        <div className="al-sample__notice" data-testid="fictional-notice">
          <p className="al-sample__noticeLead">{FICTIONAL_NOTICE.heading}</p>
          <p className="al-sample__noticeBody">{FICTIONAL_NOTICE.body}</p>
        </div>
      </PageHero>

      <Section id="samples" heading="What is on this page">
        <ul className="al-sample__cards">
          {SAMPLE_CARDS.map((card) => {
            const feature = FEATURE_BY_ID.get(card.featureId);
            return (
              <li key={`${card.featureId}-${card.caseName}`}>
                <article className="al-sample__card">
                  <div className="al-sample__cardHead">
                    <p className="al-sample__practice">{PRACTICE_LABEL[card.practice]}</p>
                    <p className="al-sample__case">{card.caseName} &middot; fictional</p>
                  </div>
                  <div className="al-sample__cardBody">
                    <h3 className="al-sample__cardTitle">{feature?.name ?? card.featureId}</h3>
                    <dl className="al-sample__facts">
                      <div>
                        <dt>Built from</dt>
                        <dd>{card.builtFrom}</dd>
                      </div>
                      <div>
                        <dt>Produced</dt>
                        <dd>{card.produced}</dd>
                      </div>
                      <div>
                        <dt>Flagged</dt>
                        <dd>{card.flags}</dd>
                      </div>
                    </dl>
                    <a className="al-sample__cardLink" href={card.href}>
                      Read the extract
                    </a>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section
        id="chronology"
        heading="Inside the chronology"
        intro={`Entries from the fictional ${CHRONOLOGY_SAMPLE.caseName} file, exactly as the report sets them out.`}
      >
        <div className="al-sample__split">
          <aside className="al-sample__aside">
            <h3>What went in</h3>
            <ul className="al-sample__inputs">
              {CHRONOLOGY_SAMPLE.inputs.map((input) => (
                <li key={input.source}>
                  {input.source} &mdash; {input.pages}&nbsp;pp.
                </li>
              ))}
            </ul>
            <h3>Report sections</h3>
            <ol className="al-sample__sections">
              {CHRONOLOGY_SAMPLE.sections.map((section) => (
                <li key={section}>{section}</li>
              ))}
            </ol>
          </aside>

          <div className="al-sample__stream">
            {CHRONOLOGY_SAMPLE.entries.map((entry) => (
              <div key={entry.cite.page} className="al-sample__entry">
                <p className="al-sample__entryHead">
                  <span className="al-sample__date">{entry.date}</span>
                  <span className="al-sample__event">{entry.event}</span>
                </p>
                <blockquote className="al-sample__quote">{entry.quote}</blockquote>
                <Citation cite={entry.cite} />
              </div>
            ))}

            {CHRONOLOGY_SAMPLE.conflicts.map((conflict) => (
              <div key={conflict.summary} className="al-sample__conflict">
                <h3 className="al-sample__flagLabel">Two records disagree</h3>
                <p className="al-sample__flagBody">{conflict.summary}</p>
                {conflict.statements.map((statement) => (
                  <div key={statement.cite.page} className="al-sample__statement">
                    <blockquote className="al-sample__quote">{statement.quote}</blockquote>
                    <Citation cite={statement.cite} />
                  </div>
                ))}
              </div>
            ))}

            {CHRONOLOGY_SAMPLE.gaps.map((gap) => (
              <div key={gap.needed} className="al-sample__gap">
                <h3 className="al-sample__flagLabel">Not in the file</h3>
                <p className="al-sample__flagBody">{gap.summary}</p>
                <p className="al-sample__needed">
                  <strong>Needed:</strong> {gap.needed}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section
        id="howell"
        heading="Inside the Howell analysis"
        intro="The same fictional file, reconciled provider by provider. Each figure names the bill it was read from."
      >
        {/*
          Focusable so keyboard users can scroll the table horizontally, which makes it an
          interactive control and so needs a role and a name of its own. Same WCAG 2.1.1
          technique as the comparison scroller in src/sections/Trust.tsx; the lint rule
          below does not know the pattern and treats "region" as always non-interactive.
        */}
        <div
          className="al-sample__tableWrap"
          data-testid="howell-table-scroller"
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          role="region"
          aria-label="Medical specials table, scrollable"
        >
          <table className="al-sample__table">
            <caption className="al-visually-hidden">
              Medical specials by provider, fictional case
            </caption>
            <thead>
              <tr>
                <th scope="col">Provider</th>
                <th scope="col" className="al-sample__num">Billed</th>
                <th scope="col" className="al-sample__num">Paid</th>
                <th scope="col" className="al-sample__num">Adjusted</th>
                <th scope="col" className="al-sample__num">Outstanding</th>
                <th scope="col">Source</th>
              </tr>
            </thead>
            <tbody>
              {HOWELL_SAMPLE.rows.map((row) => (
                <tr key={row.provider}>
                  <th scope="row">{row.provider}</th>
                  <td className="al-sample__num">{usd(row.billedCents)}</td>
                  <td className="al-sample__num">{usd(row.paidCents)}</td>
                  <td className="al-sample__num">{usd(row.adjustedCents)}</td>
                  <td className="al-sample__num">{usd(row.outstandingCents)}</td>
                  <td className="al-sample__source">{row.source}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Total</th>
                <td className="al-sample__num">{usd(totals.billedCents)}</td>
                <td className="al-sample__num">{usd(totals.paidCents)}</td>
                <td className="al-sample__num">{usd(totals.adjustedCents)}</td>
                <td className="al-sample__num">{usd(totals.outstandingCents)}</td>
                <td className="al-sample__source">{HOWELL_SAMPLE.rows.length} providers indexed</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="al-sample__conflict al-sample__conflict--standalone">
          <h3 className="al-sample__flagLabel">{HOWELL_SAMPLE.flag.heading}</h3>
          <p className="al-sample__flagBody">{HOWELL_SAMPLE.flag.body}</p>
        </div>

        <p className="al-sample__boundary">{HOWELL_SAMPLE.boundary}</p>
      </Section>

      <Section
        id="qme"
        heading="Inside the QME analysis"
        intro={`The findings the ${QME_SAMPLE.caseName} evaluation turns on, and the questions it leaves open.`}
      >
        <div className="al-sample__stream">
          {QME_SAMPLE.findings.map((finding) => (
            <div key={finding.label} className="al-sample__entry">
              <p className="al-sample__entryHead">
                <span className="al-sample__date">{finding.label}</span>
              </p>
              <blockquote className="al-sample__quote">{finding.quote}</blockquote>
              <Citation cite={finding.cite} />
            </div>
          ))}

          <div className="al-sample__gap">
            <h3 className="al-sample__flagLabel">Unresolved medical-legal questions</h3>
            <ul className="al-sample__questions">
              {QME_SAMPLE.openQuestions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section id="samples-cta" heading="Now see it on one of your own files.">
        <p className="al-sample__closing">
          A thirty-minute call sets up your firm&rsquo;s workspace and runs the first report on
          a real matter, so the next thing you read is your own case rather than ours.
        </p>
        <div className="al-sample__closingCtas">
          <Button href={SCHEDULE_URL} variant="primary" size="lg" withCaret>
            Schedule a call
          </Button>
          <Button href={PRICING_URL} variant="secondary" size="lg">
            See pricing
          </Button>
        </div>
      </Section>
    </PageShell>
  );
}
