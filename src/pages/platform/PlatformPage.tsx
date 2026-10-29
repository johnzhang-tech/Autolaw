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
            Reports answer one question about one matter. The platform is Autolaw reading
            every case the firm runs — intake through demand — with the same rule
            underneath: every fact cites the document and page it came from, and an
            attorney confirms it before it counts.
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
        intro="Beyond the reports a firm can order one at a time. Every one of these is live today — this list is built from the product, not written beside it, so it cannot promise something that has been pulled."
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
          Ask AL is in both. A firm ordering reports gets it scoped to reading and citing
          that case; on the platform it answers across the whole file, and still declines
          what the record cannot support.
        </p>
      </Section>

      <Section
        id="firm"
        heading="And the parts that are not features"
        intro="These run under everything above rather than sitting beside it."
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
        heading="There is no published price, and we would rather say so."
        intro="A practice running two hundred open matters and one running twenty are not the same firm, and a number on a page would be wrong for one of them. Tell us how the practice actually runs and we will quote against that. The reports tier has a price per report, and it is on the pricing page."
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
