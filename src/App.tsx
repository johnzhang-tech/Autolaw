import { AnnouncementBanner } from './components/AnnouncementBanner';
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
      {/* Above the sticky bar and outside it, so the bar's height — and therefore
          scroll-padding-top — is unchanged. Renders nothing while ANNOUNCEMENT is null. */}
      <AnnouncementBanner />
      <SiteNav />
      {/*
        tabIndex={-1} so the skip link actually moves focus. Chrome and Firefox set the
        sequential-focus starting point on a non-focusable fragment target; Safari does
        not, so without this the link scrolls the page and leaves focus in the nav — the
        next Tab drops the user back where they started.
      */}
      <main id="main" tabIndex={-1}>
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
