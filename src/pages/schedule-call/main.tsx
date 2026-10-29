import { createRoot } from 'react-dom/client';
import '../../styles/base.css';
import { ScheduleCallPage } from './ScheduleCallPage';
import { startPageAnalytics } from '../../measure';

startPageAnalytics('schedule_started');

createRoot(document.getElementById('root')!).render(<ScheduleCallPage />);
