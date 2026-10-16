import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../src/styles/base.css';
import { PostPage } from '../../src/pages/blog/PostPage';

createRoot(document.getElementById('root')!).render(
  <StrictMode><PostPage slug="evaluating-ai-case-intelligence" /></StrictMode>,
);
