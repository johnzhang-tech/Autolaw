import { createRoot } from 'react-dom/client';
import '../../styles/base.css';
import { PlatformPage } from './PlatformPage';
import { startPageAnalytics } from '../../measure';

startPageAnalytics();

createRoot(document.getElementById('root')!).render(<PlatformPage />);
