import { afterEach, describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { SubprocessorsPage } from '../subprocessors/SubprocessorsPage';
import { SUBPROCESSORS, SUBPROCESSOR_CHANGES, SUBPROCESSOR_NOTES, SUBPROCESSOR_NOTICE } from '../../../data/trust';
import { pageGuardHits } from './trustGuard';
import { renderedText } from '../../__tests__/renderedText';

describe('SubprocessorsPage', () => {
  it('has one page heading', () => {
    render(<SubprocessorsPage />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('lists every vendor with what it receives, where and its training terms', () => {
    render(<SubprocessorsPage />);
    const table = within(screen.getByRole('table', { name: /current subprocessors/i }));
    SUBPROCESSORS.forEach((s) => {
      const row = within(table.getByRole('rowheader', { name: s.vendor }).closest('tr')!);
      expect(row.getByText(s.purpose)).toBeInTheDocument();
      expect(row.getByText(s.receives)).toBeInTheDocument();
      expect(row.getByText(s.when)).toBeInTheDocument();
      expect(row.getByText(s.region)).toBeInTheDocument();
      expect(row.getByText(s.training)).toBeInTheDocument();
    });
  });

  it('says which providers are not used and gives the change notice with its quarter', () => {
    render(<SubprocessorsPage />);
    const main = within(screen.getByRole('main'));
    SUBPROCESSOR_NOTES.forEach((n) => expect(main.getByText(n.text)).toBeInTheDocument());
    expect(main.getByRole('region', { name: /current subprocessors, scrollable/i })).toHaveAttribute('tabindex', '0');
    expect(main.getByText(SUBPROCESSOR_NOTICE.text)).toBeInTheDocument();
    expect(main.getByText(`Planned · ${SUBPROCESSOR_NOTICE.quarter}`)).toBeInTheDocument();
    SUBPROCESSOR_CHANGES.forEach((c) => expect(main.getByText(c.change)).toBeInTheDocument());
  });

  it('uses no vocabulary that is not yet verified, and no NDA-only detail', () => {
    render(<SubprocessorsPage />);
    const text = renderedText(screen.getByRole('main'));
    expect(text.length).toBeGreaterThan(800);
    expect(pageGuardHits(screen.getByRole('main'))).toEqual([]);
  });
});

describe('SubprocessorsPage with website analytics on', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('lists Umami in the table and the change in the versions', async () => {
    vi.stubEnv('VITE_UMAMI_WEBSITE_ID', '0b5e2f8c-1d3a-4c6e-9f70-2a4b6c8d0e1f');
    vi.resetModules();
    const { SubprocessorsPage: Page } = await import('../subprocessors/SubprocessorsPage');
    render(<Page />);
    const table = within(screen.getByRole('table', { name: /current subprocessors/i }));
    expect(table.getByRole('rowheader', { name: /umami/i })).toBeInTheDocument();
    expect(screen.getByText('Version 1.1')).toBeInTheDocument();
    expect(pageGuardHits(screen.getByRole('main'))).toEqual([]);
  });
});
