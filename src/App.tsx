import { PageShell } from './pages/PageShell';
import { Story } from './story/Story';
import { AskAl } from './sections/AskAl';
import { ProductExperience } from './sections/ProductExperience';
import { PracticeSolutions } from './sections/PracticeSolutions';
import { Trust } from './sections/Trust';
import { Conversion } from './sections/Conversion';
import { ASK_AL_ENABLED } from './config';

export default function App() {
  return (
    <PageShell>
      <Story />
      {ASK_AL_ENABLED && <AskAl />}
      <ProductExperience />
      <PracticeSolutions />
      <Trust />
      <Conversion />
    </PageShell>
  );
}
