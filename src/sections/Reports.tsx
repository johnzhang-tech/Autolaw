import { Section } from '../components/primitives/Section';
import { ProductIcon } from '../components/ProductIcon';
import {
  AVAILABILITY_LABEL,
  FEATURE_BY_ID,
  ORDERABLE_REPORTS,
  type ReportPracticeArea,
} from '../data/product';
import { PRICING_URL } from '../config';
import { track } from '../measure';
import { sampleHref } from '../data/sampleReports';
import './Reports.css';

/**
 * Keyed on membership, not on the array's spelling.
 *
 * This was a Record looked up by `[...practiceAreas].join(',')`, so an entry written
 * ['WC', 'PI'] missed every key and rendered an empty span — with noUncheckedIndexedAccess
 * off, TypeScript types the miss as string and says nothing. The ordering convention was
 * documented in a comment in product.ts, which is the weakest enforcement available.
 */
export function practiceLabel(areas: ReadonlyArray<ReportPracticeArea>): string {
  const pi = areas.includes('PI');
  const wc = areas.includes('WC');
  if (pi && wc) return 'Personal injury & workers’ compensation';
  if (pi) return 'Personal injury';
  if (wc) return 'Workers’ compensation';
  throw new Error('A report must offer at least one practice area');
}

/**
 * The three reports a firm can order, pulled out of the fourteen-card product grid.
 *
 * Product shows everything the platform does, weighted evenly, which is right for a
 * visitor who already knows what Autolaw is and wrong for one who does not: the three
 * things actually on sale were indistinguishable from the eleven that are not. This band
 * sits above it and answers "what can I buy" before the grid answers "what else is there".
 *
 * Live reports carry no availability label, following the rule in data/product.ts: the
 * absence of a label is the claim. The illustration pilot renders beneath the cards
 * rather than among them, because it is the one early-access feature complete enough to
 * be mistaken for something orderable.
 */
export function Reports() {
  const pilot = FEATURE_BY_ID.get('illustrations');

  return (
    <Section
      id="reports"
      eyebrow="Reports"
      heading="Three reports, built from the records you already have."
      intro="Each one is built from the case file and nothing else. Dates, diagnoses, restrictions and dollar figures carry the page they were read from, and the report tells you how much of it is cited — so you know what you can lean on, and what is still yours to check."
    >
      <ul className="al-reports__cards" data-testid="report-cards">
        {ORDERABLE_REPORTS.map((report) => (
          <li key={report.featureId} className="al-reports__card" data-testid="report-card">
            <div className="al-reports__cardHead">
              <ProductIcon featureId={report.featureId} icon={report.feature.icon} size="card" />
              <span className="al-reports__practice">
                {practiceLabel(report.practiceAreas)}
              </span>
            </div>

            <h3 className="al-reports__name">{report.feature.name}</h3>
            <p className="al-reports__problem">{report.problem}</p>

            <ul className="al-reports__deliverables">
              {report.deliverables.map((deliverable) => (
                <li key={deliverable} data-testid="deliverable">
                  {deliverable}
                </li>
              ))}
            </ul>

            <div className="al-reports__cardFoot">
              {report.boundary && <p className="al-reports__boundary">{report.boundary}</p>}
              {/*
                Beside the delegated cta_clicked rather than instead of it: that records
                every link on the page, this records which report a visitor chose and
                which way they went to find out about it.
              */}
              <a
                className="al-reports__link"
                href={`/product/${report.feature.slug}/`}
                onClick={() =>
                  track('report_card_selected', {
                    report: report.featureId,
                    destination: 'feature',
                  })
                }
              >
                What is in this report
              </a>
              <a
                className="al-reports__link"
                href={sampleHref(report.featureId)}
                onClick={() =>
                  track('report_card_selected', { report: report.featureId, destination: 'sample' })
                }
              >
                Read a sample
              </a>
            </div>
          </li>
        ))}
      </ul>

      {pilot && pilot.availability !== 'live' && (
        <div className="al-reports__pilot" data-testid="pilot">
          <span className="al-reports__badge" data-testid="availability">
            {AVAILABILITY_LABEL[pilot.availability]}
          </span>
          <div className="al-reports__pilotBody">
            <h3 className="al-reports__pilotName">{pilot.name}</h3>
            <p>
              Diagrams drawn from the facts already in the record, carrying the same page
              citations as everything else. In pilot with a small number of firms, and not
              yet something a firm can order.
            </p>
          </div>
        </div>
      )}

      <p className="al-reports__pricing">
        Reports are bought in packs and drawn down per case.{' '}
        <a href={PRICING_URL}>See pricing</a>.
      </p>
    </Section>
  );
}
