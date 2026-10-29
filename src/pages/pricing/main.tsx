import { createRoot } from 'react-dom/client';
import '../../styles/base.css';
import { PricingPage } from './PricingPage';
import { startPageAnalytics } from '../../measure';

startPageAnalytics('pricing_viewed');

createRoot(document.getElementById('root')!).render(<PricingPage />);
