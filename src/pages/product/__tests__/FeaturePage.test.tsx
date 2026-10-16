import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { FeaturePage } from '../FeaturePage';
import { APP_ORIGIN } from '../../../config';
import { ROUTED_FEATURES } from '../../../data/product';

describe('FeaturePage', () => {
  it.each(ROUTED_FEATURES)('renders the complete $name page from data', (feature) => {
    const { container } = render(<FeaturePage id={feature.id} />);
    const main = screen.getByRole('main');

    expect(within(main).getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(within(main).getByRole('heading', { level: 1 })).toHaveTextContent(feature.page.promise);
    expect(within(main).getByText(feature.line)).toBeInTheDocument();
    expect(within(main).getByTestId(`product-icon-${feature.id}`)).toBeInTheDocument();
    expect(within(main).getByRole('region', { name: 'What it does' })).toBeInTheDocument();
    expect(within(main).getByRole('region', { name: 'How it works' })).toBeInTheDocument();
    expect(within(main).getByRole('region', { name: 'What it will not do' })).toBeInTheDocument();
    expect(within(main).getByRole('region', { name: 'What you get' })).toHaveTextContent(feature.output);

    const steps = within(main).getByRole('list', { name: 'How it works' });
    expect(within(steps).getAllByRole('listitem')).toHaveLength(3);
    feature.page.limits.forEach((limit) => expect(within(main).getByText(limit)).toBeInTheDocument());
    feature.page.related.forEach((relatedId) => {
      const related = ROUTED_FEATURES.find((candidate) => candidate.id === relatedId)!;
      expect(within(main).getByRole('link', { name: new RegExp(related.name, 'i') })).toHaveAttribute(
        'href',
        `/product/${related.slug}/`,
      );
    });

    const appLinks = [...container.querySelectorAll<HTMLAnchorElement>('a[href]')]
      .filter((anchor) => anchor.href.startsWith(APP_ORIGIN));
    expect(appLinks).toEqual([]);
  });

  it.each([
    ['ask-al', 'state-ask'],
    ['medical-chronologies', 'state-chronology'],
    ['missing-records', 'state-arrival'],
    ['case-management-summary', 'state-output'],
    ['conflicts', 'state-review'],
  ])('mounts the %s demo on its navy ground and keeps the sample mark', (id, testId) => {
    render(<FeaturePage id={id} />);
    const visual = screen.getByTestId(testId);
    expect(visual.closest('.al-stage.al-on-navy')).toBeInTheDocument();
    expect(within(visual).getByText('Sample data')).toBeInTheDocument();
  });

  it('puts the early-access pilot boundary in the illustrations hero', () => {
    const { container } = render(<FeaturePage id="illustrations" />);
    const hero = container.querySelector<HTMLElement>('.al-fpage__hero')!;

    expect(within(hero).getByText('Early access')).toBeInTheDocument();
    expect(within(hero).getByRole('heading', { level: 1 })).toHaveTextContent(/pilot/i);
    expect(within(hero).getByText(/our team runs the pilot with your firm on your case/i)).toBeInTheDocument();
    expect(container.querySelector('[data-testid^="state-"]')).not.toBeInTheDocument();
  });

  it('carries the visitor’s practice into each scheduling link', () => {
    render(<FeaturePage id="damages-ledger" initialPractice="WC" />);
    screen.getAllByRole('link', { name: /schedule a call/i }).forEach((link) => {
      expect(link).toHaveAttribute('href', '/schedule-call/?practice=wc');
    });
  });

  it('uses the high-contrast inverse CTA on both navy panels', () => {
    const { container } = render(<FeaturePage id="ask-al" />);
    const panelLinks = container.querySelectorAll('.al-fpage__hero .al-btn, .al-fpage__close .al-btn');

    expect(panelLinks).toHaveLength(2);
    panelLinks.forEach((link) => expect(link).toHaveClass('al-btn--inverse'));
  });
});
