import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LegalPage } from '../LegalPage';
import { PrivacyPage } from '../privacy/PrivacyPage';
import { PRIVACY_TEXT, TERMS_TEXT, CONTACT_EMAIL } from '../../config';

describe('LegalPage', () => {
  it('renders an owner-supplied document as sections', () => {
    render(<LegalPage title="Privacy policy" eyebrow="Legal" sections={[{ heading: 'Scope', paragraphs: ['One.', 'Two.'] }]} />);
    expect(screen.getByRole('heading', { level: 1, name: /privacy policy/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Scope' })).toBeInTheDocument();
    expect(screen.getByText('Two.')).toBeInTheDocument();
    expect(screen.queryByText(/not yet published/i)).not.toBeInTheDocument();
  });

  it('says truthfully that an empty slot is not yet published, and where to ask', () => {
    render(<LegalPage title="Terms" eyebrow="Legal" sections={[]} />);
    expect(screen.getByText(/not yet published here/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: CONTACT_EMAIL })).toHaveAttribute('href', `mailto:${CONTACT_EMAIL}`);
  });

  it('ships both slots empty', () => {
    expect(PRIVACY_TEXT).toHaveLength(0);
    expect(TERMS_TEXT).toHaveLength(0);
    render(<PrivacyPage />);
    expect(screen.getByText(/not yet published here/i)).toBeInTheDocument();
  });
});
