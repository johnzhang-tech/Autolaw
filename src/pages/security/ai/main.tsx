import { createRoot } from 'react-dom/client';
import '../../../styles/base.css';
import { AiDataUsePage } from './AiDataUsePage';
import { startPageAnalytics } from '../../../measure';

startPageAnalytics();

createRoot(document.getElementById('root')!).render(<AiDataUsePage />);
