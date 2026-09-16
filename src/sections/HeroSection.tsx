import { Hero, HERO_HEADING_ID } from './Hero';
import { StatePanel } from './visuals/StatePanel';
import { Signals } from './visuals/Signals';
import './HeroSection.css';

/**
 * The hero used to live inside Story's grid so one stage could pin beside seven chapters.
 * With the chapters gone it owns its own landmark, and keeps the Signals panel beside it
 * so the composition above the fold does not change.
 *
 * Named by its own h1 rather than by an aria-label: "Autolaw" there would have a screen
 * reader announce the site name a second time, immediately after the banner, and say
 * nothing about what the section holds.
 */
export function HeroSection() {
  return (
    <section className="al-section al-herosec" aria-labelledby={HERO_HEADING_ID}>
      <div className="al-container al-herosec__grid">
        <Hero />
        <StatePanel className="al-herosec__stage"><Signals /></StatePanel>
      </div>
    </section>
  );
}
