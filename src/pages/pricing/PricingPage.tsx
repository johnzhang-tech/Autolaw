import { PageShell } from '../PageShell';
import { PageHero } from '../PageHero';
import { Section } from '../../components/primitives/Section';
import { Button } from '../../components/primitives/Button';
import {
  REPORT_PACKS,
  REPORTS_FREE_REFRESH_DAYS,
  REPORTS_FREE_REFRESH_PAGE_LIMIT,
  REPORTS_ORDER_PAGE_LIMIT,
  CONTACT_SALES_URL,
  PLATFORM_URL,
  SAMPLE_REPORTS_URL,
  SCHEDULE_URL,
  SECURITY_URL,
  type ReportPack,
} from '../../config';
import { ORDERABLE_REPORTS, PLATFORM, PLATFORM_ADDS } from '../../data/product';
import './PricingPage.css';

/**
 * A pack's price, or null when nobody has read it off Stripe yet.
 *
 * `per-report` divides rather than reading a second stored figure, because storing both
 * is how a pack ends up advertising a unit price its own total contradicts. Cents are
 * shown only when the division produces them, so a round pack reads "$49" rather than
 * "$49.00".
 */
export function packPriceLabel(pack: ReportPack, mode: 'total' | 'per-report' = 'total'): string | null {
  if (pack.priceUsd === null) return null;
  const amount = mode === 'per-report' ? pack.priceUsd / pack.reports : pack.priceUsd;
  /*
   * Cents only when the division produces them. minimumFractionDigits: 0 on its own
   * renders 44.5 as "$44.5" — a malformed price, and the per-report figure is a division
   * so it is the likely one: $445 across ten reports is $44.50, not $44.5.
   */
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** "Single report" reads better than "1-report pack"; everything else is numeric. */
const packName = (pack: ReportPack) =>
  pack.reports === 1 ? 'Single report' : `${pack.reports}-report pack`;

/**
 * Copy per pack, keyed by the id in config. A pack with no entry renders its structure
 * and no blurb, following the owner-slot pattern: absence shows as absence.
 */
const PACK_COPY: Record<string, { blurb: string; points: ReadonlyArray<string> }> = {
  reports_1: {
    blurb: 'One report, one case. The way most firms start.',
    points: ['Any report your practice area offers', 'Word export with the citations intact'],
  },
  reports_5: {
    blurb: 'Enough to run a month of new matters through.',
    points: [
      'Credits shared across the whole firm',
      'Spend them on any case, on any report that case’s practice area offers',
      'No expiry date',
    ],
  },
  reports_10: {
    blurb: 'For firms running reports as standard practice.',
    points: [
      'Lowest cost per report',
      'Credits shared across the whole firm',
      'No expiry date',
    ],
  },
};

const COVERS = [
  {
    figure: REPORTS_ORDER_PAGE_LIMIT.toLocaleString('en-US'),
    body: 'pages of records in one order. An order over the limit is refused with every file and its page count listed, before a credit is spent — so no record is half-read and billed for.',
  },
  {
    figure: `${REPORTS_FREE_REFRESH_DAYS} days`,
    body: `to add late-arriving records and have the report rebuilt at no further charge, up to ${REPORTS_FREE_REFRESH_PAGE_LIMIT} more pages.`,
  },
  {
    figure: 'Word',
    body: 'export with every citation preserved, so the draft is edited in the tools the firm already uses.',
  },
  {
    figure: 'Your firm',
    body: 'only. Credits and case records belong to one firm’s workspace, and the case database and document store are scoped to it. The Trust Center sets out what is covered and what is not.',
  },
];

export const FAQ = [
  {
    q: 'What documents can be analysed?',
    a: 'Medical records and bills, QME, AME and IME reports, narrative reports, and the case documents that arrive with them. Scanned PDFs are read, including handwriting where it is legible. Every report states how many files were read, partially read, or not read.',
  },
  {
    q: 'How do I verify a citation?',
    a: 'Every fact names the document and page it came from, and opens that page beside it with the quoted text highlighted. Where a figure has no source in the record, the report says so rather than asserting it.',
  },
  {
    q: 'What happens when records are missing?',
    a: 'The gap is named rather than filled. A referral with no corresponding visit, a treatment window with no records, a bill from a provider whose chart is absent — each is listed as the document that is needed.',
  },
  {
    q: 'How long does a report take?',
    a: 'It depends on page count, and we would rather tell you on a call about your own file than publish an average that does not hold for an 1,800-page record.',
  },
  {
    q: 'Is a subscription required?',
    a: 'No. Credits are a one-time purchase and do not expire. The full platform is quoted to your firm separately.',
  },
  {
    q: 'How is confidential material handled?',
    a: 'Each firm’s data stays in its own workspace, and Autolaw trains no AI model on it. The Trust Center lists every subprocessor and sets out how AI processing works.',
  },
  {
    q: 'What can the firm do with a report?',
    a: 'It is your work product. Edit it, attach it to a demand, serve it, or build a mediation brief on it — the Word export keeps the citations so a reviewer can follow them back.',
  },
  {
    q: 'Does this replace attorney review?',
    a: 'No, and it is not built to. Autolaw produces a draft from the record with its sources attached. An attorney reads it, corrects it, and takes responsibility for it.',
  },
];

export function PricingPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Pricing"
        title="One report, or the whole practice."
        intro={
          <>
            Most firms start with the file that got away from them &mdash; six hundred pages,
            four providers, a mediation on Thursday. Order one report and it comes back with
            every fact cited to the page it came from. When that stops being the exception,
            the platform reads every matter the same way.
          </>
        }
      />

      <Section id="plans" heading="Which one is your firm">
        <ul className="al-price__plans" data-testid="plans">
          <li className="al-price__plan" data-testid="plan">
            <h3 className="al-price__planName">Reports</h3>
            <p className="al-price__planLine">
              One case, one report, cited to the page. Your team orders it themselves &mdash;
              nothing to subscribe to, nothing to cancel, nothing that expires.
            </p>
            <p className="al-price__planPrice">{packPriceLabel(REPORT_PACKS[0]) ?? 'Priced on a call'}</p>
            <p className="al-price__planMeta">per report</p>
            <ul className="al-price__planPoints">
              <li>{ORDERABLE_REPORTS.length} report types, by practice area</li>
              <li>Word export with the citations intact</li>
              <li>Ask AL on the case, scoped to reading and citing it</li>
              <li>No subscription, and credits that do not expire</li>
            </ul>
            <a className="al-price__planCta" href="#packs">See report packs</a>
          </li>

          <li className="al-price__plan al-price__plan--platform" data-testid="plan">
            <h3 className="al-price__planName">The platform</h3>
            <p className="al-price__planLine">
              Every matter the firm runs, read the same way &mdash; intake through demand,
              with the whole file answerable.
            </p>
            <p className="al-price__planPrice">Quoted to your firm</p>
            <p className="al-price__planMeta">tell us how it runs, we will tell you what it costs</p>
            <ul className="al-price__planPoints">
              <li>Everything in Reports, plus {PLATFORM_ADDS.length} more of the product</li>
              <li>Ask AL in full, not scoped to one read</li>
              {PLATFORM.map((item) => (
                <li key={item.id}>{item.name}</li>
              ))}
            </ul>
            <a className="al-price__planCta" href={CONTACT_SALES_URL}>Talk to sales</a>
            <a className="al-price__planLink" href={PLATFORM_URL}>What the platform includes</a>
          </li>
        </ul>
      </Section>

      <Section id="packs" heading="Report packs">
        <ul className="al-price__packs">
          {REPORT_PACKS.map((pack) => {
            const copy = PACK_COPY[pack.packId];
            const total = packPriceLabel(pack);
            const unit = pack.reports > 1 ? packPriceLabel(pack, 'per-report') : null;
            return (
              <li key={pack.packId} className="al-price__pack">
                <h3 className="al-price__packName">{packName(pack)}</h3>
                {copy && <p className="al-price__packBlurb">{copy.blurb}</p>}
                <p className="al-price__amount">{total ?? 'Priced on a call'}</p>
                <p className="al-price__credits">
                  {pack.reports} report {pack.reports === 1 ? 'credit' : 'credits'}
                  {unit && <> &middot; {unit} each</>}
                </p>
                {copy && (
                  <ul className="al-price__points">
                    {copy.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        <div className="al-price__note">
          <p className="al-price__noteLead">
            We add your pack to your firm&rsquo;s own Autolaw workspace.
          </p>
          <p>
            A short call sets the workspace up, verifies the firm, and runs your first report
            on a real matter. After that your team orders reports itself, and each one is released
            once we have checked it.
          </p>
          <Button href={SCHEDULE_URL} variant="primary" size="lg" withCaret>
            Schedule a call
          </Button>
        </div>
      </Section>

      <Section id="covers" heading="What one credit covers">
        <ul className="al-price__covers">
          {COVERS.map((item) => (
            <li key={item.figure}>
              <p className="al-price__figure">{item.figure}</p>
              <p className="al-price__figureBody">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="which"
        heading="Which reports you can order"
        intro="A credit is a credit. What you may spend it on depends on the practice area of the case."
      >
        {/*
          Focusable so keyboard users can scroll the table horizontally, which makes it an
          interactive control and so needs a role and a name of its own. Same WCAG 2.1.1
          technique as the comparison scroller in src/sections/Trust.tsx; the lint rule
          below does not know the pattern and treats "region" as always non-interactive.
        */}
        <div
          className="al-price__tableWrap"
          data-testid="pricing-table-scroller"
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          role="region"
          aria-label="Report availability table, scrollable"
        >
          <table className="al-price__table">
            <caption className="al-visually-hidden">Report availability by practice area</caption>
            <thead>
              <tr>
                <th scope="col">Report</th>
                <th scope="col">Personal injury</th>
                <th scope="col">Workers&rsquo; compensation</th>
                <th scope="col">Cost</th>
              </tr>
            </thead>
            <tbody>
              {ORDERABLE_REPORTS.map((report) => (
                <tr key={report.featureId}>
                  <th scope="row">
                    <a href={`/product/${report.feature.slug}/`}>{report.name ?? report.feature.name}</a>
                  </th>
                  <td>{report.practiceAreas.includes('PI') ? 'Available' : 'Not offered'}</td>
                  <td>{report.practiceAreas.includes('WC') ? 'Available' : 'Not offered'}</td>
                  <td>1 credit</td>
                </tr>
              ))}
              <tr>
                <th scope="row">Demand draft, lien exposure, lost earnings, benefits audit</th>
                <td colSpan={2}>In preview</td>
                <td>Ask on a call</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="al-price__tableNote">
          Preview reports are switched on per firm while their export format is finished.
          They are not part of the published packs, and we will say plainly whether yours is
          one of the firms that has them.
        </p>
      </Section>

      <Section
        id="platform"
        tone="navy"
        eyebrow="The full platform"
        heading="Or run case intelligence across the whole practice."
        intro="Intake, missing records, damages, demand packages, deadlines, the contradictions nobody caught — on every matter at once, and Ask AL across the whole file rather than scoped to a single read."
      >
        <div className="al-price__closingCtas">
          <Button href={CONTACT_SALES_URL} variant="inverse" size="lg" withCaret>
            Talk to sales
          </Button>
          <Button href={PLATFORM_URL} variant="inverse-secondary" size="lg">
            What the platform includes
          </Button>
        </div>
      </Section>

      <Section id="faq" heading="Questions firms ask first">
        <ul className="al-price__faq">
          {FAQ.map((item) => (
            <li key={item.q}>
              <h3>{item.q}</h3>
              <p>
                {item.a}
                {item.q.startsWith('How is confidential') && (
                  <>
                    {' '}
                    <a href={SECURITY_URL}>Read the Trust Center</a>.
                  </>
                )}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="pricing-cta" heading="See it on one of your own files.">
        <p className="al-price__closing">
          A thirty-minute call sets up the firm&rsquo;s workspace and runs the first report on
          a real matter, so the next thing you read is your own case rather than ours.
        </p>
        <div className="al-price__closingCtas">
          <Button href={SCHEDULE_URL} variant="primary" size="lg" withCaret>
            Schedule a call
          </Button>
          <Button href={SAMPLE_REPORTS_URL} variant="secondary" size="lg">
            View sample reports
          </Button>
        </div>
      </Section>
    </PageShell>
  );
}
