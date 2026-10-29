import { createRoot } from 'react-dom/client';
import '../../styles/base.css';
import { AboutPage } from './AboutPage';
import { startPageAnalytics } from '../../measure';

startPageAnalytics();

createRoot(document.getElementById('root')!).render(<AboutPage />);
