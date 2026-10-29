import { createRoot } from 'react-dom/client';
import '../../../styles/base.css';
import { SubprocessorsPage } from './SubprocessorsPage';
import { startPageAnalytics } from '../../../measure';

startPageAnalytics();

createRoot(document.getElementById('root')!).render(<SubprocessorsPage />);
