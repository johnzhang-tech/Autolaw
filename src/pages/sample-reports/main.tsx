import { createRoot } from 'react-dom/client';
import '../../styles/base.css';
import { SampleReportsPage } from './SampleReportsPage';
import { startPageAnalytics } from '../../measure';

startPageAnalytics('sample_viewed');

createRoot(document.getElementById('root')!).render(<SampleReportsPage />);
