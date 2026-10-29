import { createRoot } from 'react-dom/client';
import '../../styles/base.css';
import { PrivacyPage } from './PrivacyPage';
import { startPageAnalytics } from '../../measure';

startPageAnalytics();

createRoot(document.getElementById('root')!).render(<PrivacyPage />);
