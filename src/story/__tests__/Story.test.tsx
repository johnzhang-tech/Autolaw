import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, within, act } from '@testing-library/react';
import { Story } from '../Story';
import { CHAPTERS } from '../chapters';
import { mockMatchMedia, installFakeIntersectionObserver } from '../../test-utils/media';

afterEach(() => vi.unstubAllGlobals());

describe('Story — stacked (default in jsdom, and under reduced motion or a narrow viewport)', () => {
  it('renders the hero copy, the signal panel, and every chapter with its state inline', () => {
    vi.stubGlobal('matchMedia', undefined);
    render(<Story />);
    expect(screen.getByRole('heading', { level: 1, name: /know where every fact came from/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /3 missing records/i })).toBeInTheDocument();
    CHAPTERS.forEach((c) => {
      const block = document.getElementById(c.id)!;
      expect(block).toHaveAttribute('data-chapter', String(c.index));
      expect(within(block).getByRole('heading', { level: 3, name: c.heading })).toBeInTheDocument();
      expect(within(block).getAllByTestId('stage')).toHaveLength(1);
    });
    expect(screen.queryByRole('group', { name: /story chapters/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /demonstration/i })).not.toBeInTheDocument();
  });

  it('renders no pinned copy, so nothing on the page moves', () => {
    mockMatchMedia(false);
    render(<Story />);
    expect(document.querySelectorAll('.al-stage--live')).toHaveLength(0);
  });
});

describe('Story — pinned', () => {
  it('renders one live stage, the chapter list, and no inline states', () => {
    mockMatchMedia(true);
    installFakeIntersectionObserver();
    render(<Story />);
    expect(screen.getAllByTestId('stage')).toHaveLength(1);
    expect(screen.getByRole('region', { name: /demonstration/i })).toHaveClass('al-stage--live');
    const list = screen.getByRole('group', { name: /story chapters/i });
    const links = within(list).getAllByRole('link');
    expect(links).toHaveLength(8);
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['#story', ...CHAPTERS.map((c) => `#${c.id}`)]);
    expect(links[0]).toHaveAttribute('aria-current', 'step');
  });

  it('moves the stage and the current marker as chapters enter the band', () => {
    mockMatchMedia(true);
    const IO = installFakeIntersectionObserver();
    render(<Story />);
    const block = document.getElementById(CHAPTERS[2].id)!;
    act(() => IO.instances[0].fire([{ target: block, isIntersecting: true }]));
    expect(screen.getByTestId('stage')).toHaveAttribute('data-chapter', '3');
    const list = screen.getByRole('group', { name: /story chapters/i });
    expect(within(list).getAllByRole('link')[3]).toHaveAttribute('aria-current', 'step');
    expect(block).toHaveAttribute('data-active');
  });

  it('is a labelled section whose first heading after the h1 is the hidden h2', () => {
    mockMatchMedia(true);
    installFakeIntersectionObserver();
    render(<Story />);
    const section = screen.getByRole('region', { name: /how autolaw works/i });
    const headings = within(section).getAllByRole('heading');
    expect(headings[0].tagName).toBe('H1');
    expect(headings[1].tagName).toBe('H2');
  });
});
