import type { ReactNode } from 'react';
import { Button } from '../../components/primitives/Button';
import { Section } from '../../components/primitives/Section';
import { AVAILABILITY_LABEL, FEATURE_BY_ID, PHASES, ROUTED_FEATURES } from '../../data/product';
import { CUSTOMER_LOGOS, SCHEDULE_URL } from '../../config';
import { PracticeProvider, usePractice, type Practice } from '../../practice/PracticeContext';
import { Arrival } from '../../sections/visuals/Arrival';
import { AskPreview } from '../../sections/visuals/AskPreview';
import { ChronologyState } from '../../sections/visuals/ChronologyState';
import { Output } from '../../sections/visuals/Output';
import { Review } from '../../sections/visuals/Review';
import { StatePanel } from '../../sections/visuals/StatePanel';
import { PageShell } from '../PageShell';
import { ProductIcon } from '../../components/ProductIcon';
import './FeaturePage.css';

const VISUALS: Partial<Record<string, ReactNode>> = {
  'ask-al': <StatePanel className="al-fpage__stage"><AskPreview animate={false} /></StatePanel>,
  'medical-chronologies': <StatePanel className="al-fpage__stage"><ChronologyState /></StatePanel>,
  'missing-records': <StatePanel className="al-fpage__stage"><Arrival animate={false} /></StatePanel>,
  'case-management-summary': <StatePanel className="al-fpage__stage"><Output /></StatePanel>,
  conflicts: <StatePanel className="al-fpage__stage"><Review /></StatePanel>,
};

const PRACTICE_LABEL = {
  PI: 'Personal injury',
  WC: 'Workers’ compensation',
  both: 'PI + Workers’ compensation',
} as const;

function FeaturePageContent({ id }: { id: string }) {
  const feature = FEATURE_BY_ID.get(id);
  const { practice } = usePractice();

  if (!feature?.slug || !feature.page) {
    throw new Error(`FeaturePage requires a routed feature id; received "${id}".`);
  }

  const line = practice === 'WC' && feature.wcLine ? feature.wcLine : feature.line;
  const scheduleUrl = `${SCHEDULE_URL}?practice=${practice.toLowerCase()}`;
  const availability = feature.availability === 'live'
    ? null
    : AVAILABILITY_LABEL[feature.availability];
  const visual = VISUALS[feature.id];

  return (
    <>
      <section className="al-fpage__hero al-on-navy" aria-labelledby="feature-title">
        <div className="al-container al-fpage__hero-inner">
          <div className="al-fpage__chips" aria-label="Feature context">
            {feature.phases.map((phase) => <span key={phase}>{PHASES[phase].heading}</span>)}
            <span>{PRACTICE_LABEL[feature.practice]}</span>
            {availability && <strong>{availability}</strong>}
          </div>
          <div className="al-fpage__hero-icon">
            <ProductIcon featureId={feature.id} icon={feature.icon} size="hero" />
          </div>
          <p className="al-fpage__name">{feature.name}</p>
          <h1 id="feature-title">{feature.page.promise}</h1>
          <p className="al-fpage__lead">{line}</p>
          {feature.availability === 'early-access' && (
            <p className="al-fpage__pilot">Our team runs the pilot with your firm on your case.</p>
          )}
          <Button href={scheduleUrl} variant="inverse" size="lg" withCaret>
            Schedule a call
          </Button>
        </div>
      </section>

      {CUSTOMER_LOGOS.length > 0 && (
        <div className="al-container al-fpage__logos" aria-label="Firms using Autolaw">
          {CUSTOMER_LOGOS.map((logo) => <img key={logo.name} src={logo.src} alt={logo.name} />)}
        </div>
      )}

      <Section id="what-it-does" eyebrow="The work" heading="What it does">
        <div className="al-fpage__does">
          <div className="al-fpage__body">
            {feature.page.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <ul className="al-fpage__details">
            {feature.detail.map((detail) => <li key={detail}>{detail}</li>)}
          </ul>
        </div>
      </Section>

      {visual && (
        <Section id="feature-visual" eyebrow="Inside the product" heading={`${feature.name}, in context`}>
          <div className="al-fpage__visual">{visual}</div>
        </Section>
      )}

      <Section id="how-it-works" eyebrow="The path" heading="How it works">
        <ol className="al-fpage__steps" aria-label="How it works">
          {feature.page.steps.map((step, index) => (
            <li key={step.heading}>
              <span className="al-fpage__step-no" aria-hidden="true">0{index + 1}</span>
              <h3>{step.heading}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        id="limits"
        tone="navy"
        eyebrow="The boundary"
        heading="What it will not do"
        intro="The fastest way to trust a product with a case is to know where it stops."
      >
        <ul className="al-fpage__limits">
          {feature.page.limits.map((limit) => <li key={limit}>{limit}</li>)}
        </ul>
      </Section>

      <Section id="output" eyebrow="The result" heading="What you get">
        <div className="al-fpage__output">
          <span>{feature.output}</span>
          <p>Made from the case record. Kept under attorney review.</p>
        </div>
      </Section>

      <Section id="related" eyebrow="Stay in the case" heading="Keep exploring">
        <ul className="al-fpage__related">
          {feature.page.related.map((relatedId) => {
            const related = ROUTED_FEATURES.find((candidate) => candidate.id === relatedId)!;
            return (
              <li key={related.id}>
                <a href={`/product/${related.slug}/`}>
                  <span>{related.name}</span>
                  <small>{related.line}</small>
                  <i aria-hidden="true">→</i>
                </a>
              </li>
            );
          })}
        </ul>
      </Section>

      <section className="al-section al-fpage__close al-on-navy" aria-labelledby="feature-close-heading">
        <div className="al-container al-fpage__close-inner">
          <p className="al-sec__eyebrow">Your matter, not a canned demo</p>
          <h2 id="feature-close-heading">See {feature.name} on the kind of case your firm handles.</h2>
          <Button href={scheduleUrl} variant="inverse" size="lg" withCaret>
            Schedule a call
          </Button>
        </div>
      </section>
    </>
  );
}

export function FeaturePage({ id, initialPractice = 'PI' }: { id: string; initialPractice?: Practice }) {
  const scheduleHref = `${SCHEDULE_URL}?practice=${initialPractice.toLowerCase()}`;

  return (
    <PageShell scheduleHref={scheduleHref}>
      <PracticeProvider initial={initialPractice}>
        <FeaturePageContent id={id} />
      </PracticeProvider>
    </PageShell>
  );
}
