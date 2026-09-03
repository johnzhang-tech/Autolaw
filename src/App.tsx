import { PageShell } from './pages/PageShell';
import { Story } from './story/Story';
import { ProductExperience } from './sections/ProductExperience';
import { PracticeSolutions } from './sections/PracticeSolutions';
import { Trust } from './sections/Trust';
import { Conversion } from './sections/Conversion';

export default function App() {
  return (
    <PageShell>
      <Story />
      <ProductExperience />
      <PracticeSolutions />
      <Trust />
      <Conversion />
    </PageShell>
  );
}
