import { describe, it, expect } from 'vitest';
import { CHAPTERS } from '../chapters';

describe('chapters', () => {
  it('numbers seven chapters 1 through 7 with unique ids', () => {
    expect(CHAPTERS.map((c) => c.index)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(new Set(CHAPTERS.map((c) => c.id)).size).toBe(7);
    CHAPTERS.forEach((c) => expect(c.id).toMatch(/^story-[a-z]+$/));
  });

  it('gives every chapter a heading and one paragraph', () => {
    CHAPTERS.forEach((c) => {
      expect(c.heading.length).toBeGreaterThan(8);
      expect(c.body.length).toBeGreaterThan(40);
      expect(c.body).not.toMatch(/\n/);
    });
  });
});
