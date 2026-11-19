import { useEffect } from 'react';
import { PageShell } from '../PageShell';
import { PageHero } from '../PageHero';
import { Section } from '../../components/primitives/Section';
import { Button } from '../../components/primitives/Button';
import { PRICING_URL, SCHEDULE_URL } from '../../config';
import {
  FICTIONAL_NOTICE,
  HOW_MADE,
  REPORT_SAMPLES,
  samplePriceLine,
  type Practice,
  type SampleFile,
} from '../../data/sampleReports';
import { track } from '../../measure';
import './SampleReportsPage.css';

const PRACTICE_LABEL: Record<Practice, string> = {
  PI: 'Personal injury',
  WC: 'Workers’ compensation',
};

/** `report` is the FEATURES id, so a download joins the report_card_selected that led to it. */
function DownloadLink({ file, report }: { file: SampleFile; report: string }) {
  return (
    <a
      className="al-sample__download"
      href={file.href}
      download
      onClick={() => track('sample_downloaded', { report, practice: file.practice })}
    >
      Download the {PRACTICE_LABEL[file.practice].toLowerCase()} sample order, {file.caseName} (PDF, {file.pages} pages)
    </a>
  );
}

export function SampleReportsPage() {
  // The page renders in the browser, so on arrival from "/sample-reports/#qme" the browser looks
  // for #qme before it exists and stays at the top. Scroll once, after the first render.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) document.getElementById(id)?.scrollIntoView();
  }, []);

  return (
    <PageShell>
      <PageHero
        eyebrow="Sample reports"
        title="Read the work product before you talk to anyone."
        intro={
          <>
            These are the reports an order delivers, rendered from the Word files. Follow a
            citation to the record it came from, and see what each report says when something
            is missing.
          </>
        }
      >
        {/* Above the samples, not beneath them: a disclaimer met after the sample has done nothing. */}
        <div className="al-sample__notice" data-testid="fictional-notice">
          <p className="al-sample__noticeLead">{FICTIONAL_NOTICE.heading}</p>
          <p className="al-sample__noticeBody">{FICTIONAL_NOTICE.body}</p>
        </div>
      </PageHero>

      <Section id="samples" heading="What is on this page" intro={HOW_MADE}>
        <ul className="al-sample__cards">
          {REPORT_SAMPLES.map((report) => (
            <li key={report.id}>
              <article className="al-sample__card" aria-labelledby={`card-${report.anchor}`}>
                <div className="al-sample__cardHead">
                  <p className="al-sample__practice">
                    {report.practices.map((practice) => PRACTICE_LABEL[practice]).join(' · ')}
                  </p>
                </div>
                <div className="al-sample__cardBody">
                  <h3 id={`card-${report.anchor}`} className="al-sample__cardTitle">{report.title}</h3>
                  <dl className="al-sample__facts">
                    <div>
                      <dt>How it is bought</dt>
                      <dd>{report.howBought}</dd>
                    </div>
                    <div>
                      <dt>Price</dt>
                      <dd>{samplePriceLine(report.id)}</dd>
                    </div>
                  </dl>
                  <a className="al-sample__cardLink" href={`#${report.anchor}`}>
                    See the sample<span className="al-visually-hidden">: {report.title}</span>
                  </a>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Section>

      {REPORT_SAMPLES.map((report) => (
        <Section key={report.id} id={report.anchor} heading={report.title} intro={report.howBought}>
          <div className="al-sample__report">
            <ul className="al-sample__contains" aria-label={`What the ${report.title} contains`}>
              {report.contains.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <div className="al-sample__previews">
              {report.previews.map((preview) => (
                <img
                  key={preview.src}
                  className="al-sample__preview"
                  src={preview.src}
                  alt={preview.alt}
                  width={preview.width}
                  height={preview.height}
                  loading="lazy"
                />
              ))}
            </div>
            <div className="al-sample__downloads">
              {report.samples.map((file) => (
                <DownloadLink key={file.href} file={file} report={report.featureId} />
              ))}
            </div>
          </div>
        </Section>
      ))}

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
