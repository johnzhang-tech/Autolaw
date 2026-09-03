import { Section } from '../components/primitives/Section';
import { BodyExplorer } from './BodyExplorer';
import './ProductExperience.css';

export function ProductExperience() {
  return (
    <Section
      id="products"
      eyebrow="Body parts"
      heading="Accepted, disputed, and undocumented — from the record"
      intro="Select a region. Every row cites the page it came from, and a region with no records says so."
    >
      <div className="al-px">
        <BodyExplorer />
      </div>
    </Section>
  );
}
