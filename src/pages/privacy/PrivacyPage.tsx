import { PRIVACY_TEXT } from '../../config';
import { LegalPage } from '../LegalPage';

export function PrivacyPage() {
  return <LegalPage title="Privacy policy" eyebrow="Legal" sections={PRIVACY_TEXT} />;
}
