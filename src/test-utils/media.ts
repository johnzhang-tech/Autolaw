import { vi } from 'vitest';

/**
 * jsdom has no matchMedia. Components treat its absence as "stacked", which is the safe
 * default; tests that need the pinned layout install this with `matches: true`.
 */
export function mockMatchMedia(matches: boolean): void {
  const listeners = new Set<() => void>();
  const mql = {
    matches,
    media: '',
    onchange: null,
    addEventListener: (_: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
    addListener: (cb: () => void) => listeners.add(cb),
    removeListener: (cb: () => void) => listeners.delete(cb),
    dispatchEvent: () => true,
  };
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mql));
}

export interface FakeEntry {
  target: Element;
  isIntersecting: boolean;
  boundingClientRect?: { top: number };
}

/**
 * A stand-in for IntersectionObserver that records what it observes and lets a test fire
 * the callback with hand-built entries. `instances` is reset by each install.
 */
export class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  observed: Element[] = [];
  constructor(
    public cb: (entries: FakeEntry[]) => void,
    public options?: IntersectionObserverInit,
  ) {
    FakeIntersectionObserver.instances.push(this);
  }
  observe(el: Element) { this.observed.push(el); }
  unobserve() {}
  disconnect() { this.observed = []; }
  fire(entries: FakeEntry[]) {
    this.cb(entries.map((e) => ({ boundingClientRect: { top: 0 }, ...e })));
  }
}

export function installFakeIntersectionObserver(): typeof FakeIntersectionObserver {
  FakeIntersectionObserver.instances = [];
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  return FakeIntersectionObserver;
}
