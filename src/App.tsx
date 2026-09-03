import { PageShell } from './pages/PageShell';
import { Hero } from './sections/Hero';
import { Transformation } from './sections/Transformation';
import { ProductExperience } from './sections/ProductExperience';
import { PracticeSolutions } from './sections/PracticeSolutions';
import { Trust } from './sections/Trust';
import { Conversion } from './sections/Conversion';

/*
 * The same frame as every standalone page — skip link, announcement, banner, main, footer —
 * so the home page cannot drift from the others. It used to carry its own copy of that
 * frame, with the same Safari focus comment, which is how drift starts.
 */
export default function App() {
  return (
    <PageShell>
      <Hero />
      <Transformation />
      <ProductExperience />
      <PracticeSolutions />
      <Trust />
      <Conversion />
    </PageShell>
  );
}
