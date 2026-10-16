import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../src/styles/base.css';
import { BlogIndexPage } from '../src/pages/blog/BlogIndexPage';

createRoot(document.getElementById('root')!).render(
  <StrictMode><BlogIndexPage /></StrictMode>,
);
