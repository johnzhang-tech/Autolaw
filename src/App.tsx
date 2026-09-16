import { PageShell } from './pages/PageShell';
import { PracticeProvider } from './practice/PracticeContext';
import { HeroSection } from './sections/HeroSection';
import { Product } from './sections/product/Product';
import { AskAl } from './sections/AskAl';
import { Solutions } from './sections/Solutions';
import { Trust } from './sections/Trust';
import { Conversion } from './sections/Conversion';
import { ASK_AL_ENABLED } from './config';

export default function App() {
  return (
    <PageShell>
      <PracticeProvider>
        <HeroSection />
        <Product />
        {ASK_AL_ENABLED && <AskAl />}
        <Solutions />
        <Trust />
        <Conversion />
      </PracticeProvider>
    </PageShell>
  );
}
