import { Hero } from './Hero';
import { Signals } from './visuals/Signals';
import './HeroSection.css';

/**
 * The hero used to live inside Story's grid so one stage could pin beside seven chapters.
 * With the chapters gone it owns its own landmark, and keeps the Signals panel beside it
 * so the composition above the fold does not change.
 *
 * `al-stage al-on-navy` on the panel is the same pair Stage.tsx put there: the navy
 * ground, the 440px floor, and the inverse focus ring the light-on-dark panel needs.
 * Every state in visuals/ paints inverse ink, so a panel without it renders white text on
 * the canvas — the classes are load-bearing, not decoration. Their rules moved into
 * visuals/states.css with the states themselves.
 */
export function HeroSection() {
  return (
    <section className="al-section al-herosec" aria-label="Autolaw">
      <div className="al-container al-herosec__grid">
        <Hero />
        <div className="al-herosec__stage al-stage al-on-navy"><Signals /></div>
      </div>
    </section>
  );
}
