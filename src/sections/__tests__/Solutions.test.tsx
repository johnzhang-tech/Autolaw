import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Solutions } from '../Solutions';
import { PracticeProvider } from '../../practice/PracticeContext';
import { PI_PANEL, WC_PANEL } from '../../data/demoCase';

const renderIt = () => render(<PracticeProvider><Solutions /></PracticeProvider>);
const practiceTabs = () => within(screen.getByRole('tablist', { name: /practice area/i }));

/*
 * Each render below expects to start on the default PI practice. PracticeProvider
 * persists the visitor's choice to sessionStorage (by design — see PracticeContext.tsx),
 * which otherwise leaks a WC selection from one test into the next render in this file.
 * Task 2's own PracticeContext.test.tsx establishes the same beforeEach for the same
 * reason.
 */
beforeEach(() => window.sessionStorage.clear());

describe('Solutions', () => {
  it('defaults to personal injury and shows the PI Overview tabs', () => {
    renderIt();
    expect(practiceTabs().getByRole('tab', { name: /personal injury/i })).toHaveAttribute('aria-selected', 'true');
    const screens = within(screen.getByRole('tablist', { name: /PI screens/i }));
    expect(screens.getAllByRole('tab').map((t) => t.textContent)).toEqual(PI_PANEL.tabs.map((t) => t.label));
    // Scoped to the evidence-tier legend: two medical rows share the "Imaging-backed"
    // tier, so a page-wide screen.getByText(tier) would also match a row's own tier
    // badge and throw on finding more than one match.
    const tiers = within(screen.getByRole('list', { name: /evidence tiers/i }));
    PI_PANEL.evidenceTiers.forEach((tier) => expect(tiers.getByText(tier)).toBeInTheDocument());
  });

  it('shows the wage-loss derivation on the Damages tab', async () => {
    const user = userEvent.setup();
    renderIt();
    await user.click(screen.getByRole('tab', { name: /damages & demand/i }));
    expect(screen.getByText(PI_PANEL.wage[2].value)).toBeInTheDocument();
    expect(screen.getByText(/combined average weekly wage/i)).toBeInTheDocument();
  });

  it('swaps to the WC Intelligence tabs and the figure', async () => {
    const user = userEvent.setup();
    renderIt();
    await user.click(practiceTabs().getByRole('tab', { name: /workers/i }));
    const screens = within(screen.getByRole('tablist', { name: /WC screens/i }));
    expect(screens.getAllByRole('tab').map((t) => t.textContent)).toEqual(WC_PANEL.tabs.map((t) => t.label));
    WC_PANEL.readiness.forEach((c) => expect(screen.getByText(c.label)).toBeInTheDocument());
    await user.click(screen.getByRole('tab', { name: /injury & work status/i }));
    expect(screen.getByRole('group', { name: /body region selector/i })).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: /medical-legal & disputes/i }));
    expect(screen.getByText(WC_PANEL.conflict.title)).toBeInTheDocument();
    expect(screen.getByText(WC_PANEL.missing.needed)).toBeInTheDocument();
  });

  it('says workflows, never products', () => {
    const { container } = renderIt();
    expect(container.textContent).toMatch(/two workflows/i);
    expect(container.textContent).not.toMatch(/separate products|two products/i);
  });

  it('keeps one tab stop per tablist and moves with the arrow keys', async () => {
    const user = userEvent.setup();
    renderIt();
    practiceTabs().getByRole('tab', { name: /personal injury/i }).focus();
    await user.keyboard('{ArrowRight}');
    expect(practiceTabs().getByRole('tab', { name: /workers/i })).toHaveFocus();
    expect(practiceTabs().getAllByRole('tab').filter((t) => t.tabIndex === 0)).toHaveLength(1);
    const screens = within(screen.getByRole('tablist', { name: /WC screens/i }));
    expect(screens.getAllByRole('tab').filter((t) => t.tabIndex === 0)).toHaveLength(1);
  });
});
