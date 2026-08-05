import { Section } from '../components/primitives/Section';
import { Chronology } from './Chronology';
import { BodyExplorer } from './BodyExplorer';
import './ProductExperience.css';

export function ProductExperience() {
  return (
    <Section
      id="products"
      eyebrow="The product"
      heading="See what Autolaw finds — and where it found it"
      intro="Every fact traces to a document, a page, and the sentence it came from. Where two records disagree, the disagreement is surfaced rather than averaged away."
    >
      <div className="al-px">
        <Chronology />
        <BodyExplorer />
      </div>
    </Section>
  );
}
