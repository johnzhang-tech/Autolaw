import { createRoot } from 'react-dom/client';
import '../../styles/base.css';
import { SecurityPage } from './SecurityPage';
import { startPageAnalytics } from '../../measure';

startPageAnalytics();

createRoot(document.getElementById('root')!).render(<SecurityPage />);
