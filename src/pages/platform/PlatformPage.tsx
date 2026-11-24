import { PageShell } from '../PageShell';
import { PageHero } from '../PageHero';
import { Section } from '../../components/primitives/Section';
import { Button } from '../../components/primitives/Button';
import { CONTACT_SALES_URL, PRICING_URL, SECURITY_URL } from '../../config';
import { PLATFORM, PLATFORM_ADDS } from '../../data/product';
import './PlatformPage.css';

/**
 * The page for a firm that wants Autolaw across every matter rather than a report at a
 * time.
 *
 * It exists because the site was selling the smaller half. In case-app, `reports_tier`
 * is a restriction — reports-tier-routes.ts is an allowlist and every route outside it
 * returns 403 — so reports are the cut-down tier and the whole product had one sentence
 * on the pricing page.
 *
 * No price and no pricing structure appears here, and that is not reticence: there is no
 * subscription billing in case-app, Stripe sells report packs and nothing else, and every
 * platform tenant is provisioned by hand. "We quote it against your practice" is the
 * literal mechanism. PlatformPage.test.tsx fails the build if a figure or a structure
 * claim ever reaches this page.
 */
export function PlatformPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="The platform"
        title="Run the whole practice on one case file."
        intro={
          <>
            One report answers one question. The platform answers the file. Every matter
            your firm runs, read end to end &mdash; intake through demand &mdash; every fact
            cited to the page it came from, and nothing counted until an attorney says so.
          </>
        }
      >
        <div className="al-platform__heroCtas">
          <Button href={CONTACT_SALES_URL} variant="primary" size="lg" withCaret>
            Talk to sales
          </Button>
          <Button href={PRICING_URL} variant="secondary" size="lg">
            Or buy reports per report
          </Button>
        </div>
      </PageHero>

      <Section
        id="adds"
        heading="What the platform adds"
        intro="The work the reports tier never reaches, all of it on the same case file, all of it cited the same way."
      >
        <ul className="al-platform__adds" data-testid="platform-adds">
          {PLATFORM_ADDS.map((feature) => (
            <li key={feature.id}>
              <a href={`/product/${feature.slug}/`}>{feature.name}</a>
              <p>{feature.line}</p>
            </li>
          ))}
        </ul>
        <p className="al-platform__note">
          Ask AL is in both tiers. Ordering reports, it reads and cites the case in front
          of it. On the platform it answers across the whole file &mdash; and still tells you
          when the record cannot support the question.
        </p>
      </Section>

      <Section
        id="firm"
        heading="And the floor it all stands on"
        intro="Not features you switch on. The things that have to be true before any of the above is worth having."
      >
        <ul className="al-platform__strip" data-testid="platform-strip">
          {PLATFORM.map((item) => (
            <li key={item.id}>
              <h3>{item.name}</h3>
              <p>{item.line}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="price"
        tone="navy"
        eyebrow="What it costs"
        heading="It depends on what you run, so we would rather ask."
        intro="Twenty open matters and two hundred are not the same firm. Rather than publish a number that is wrong for one of you, we would sooner hear how the practice actually runs and quote against that. And if you would rather try it one case at a time, the reports tier is sold by the report, and the pricing page explains how."
      >
        <div className="al-platform__heroCtas">
          <Button href={CONTACT_SALES_URL} variant="inverse" size="lg" withCaret>
            Talk to sales
          </Button>
          <Button href={SECURITY_URL} variant="inverse-secondary" size="lg">
            Read the Trust Center
          </Button>
        </div>
      </Section>
    </PageShell>
  );
}
