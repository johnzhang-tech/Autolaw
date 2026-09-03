import { TERMS_TEXT } from '../../config';
import { LegalPage } from '../LegalPage';

export function TermsPage() {
  return <LegalPage title="Terms of service" eyebrow="Legal" sections={TERMS_TEXT} />;
}
