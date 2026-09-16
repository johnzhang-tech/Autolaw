import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../src/styles/base.css';
import { FeaturePage } from '../../src/pages/product/FeaturePage';

createRoot(document.getElementById('root')!).render(
  <StrictMode><FeaturePage id="conflicts" /></StrictMode>,
);
