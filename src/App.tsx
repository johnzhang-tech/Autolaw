import { SiteNav } from './components/SiteNav';
import { SiteFooter } from './components/SiteFooter';
import { Hero } from './sections/Hero';
import { Transformation } from './sections/Transformation';
import { ProductExperience } from './sections/ProductExperience';
import { PracticeSolutions } from './sections/PracticeSolutions';
import { Trust } from './sections/Trust';
import { Conversion } from './sections/Conversion';

export default function App() {
  return (
    <>
      <a className="al-skip" href="#main">Skip to content</a>
      <div id="top" />
      <SiteNav />
      <main id="main">
        <Hero />
        <Transformation />
        <ProductExperience />
        <PracticeSolutions />
        <Trust />
        <Conversion />
      </main>
      <SiteFooter />
    </>
  );
}
