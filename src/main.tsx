import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
// @ts-ignore – next-themes types vary per version
import { ThemeProvider } from 'next-themes';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* @ts-ignore */}
    <ThemeProvider attribute="class" defaultTheme="light">
      <App />
    </ThemeProvider>
  </StrictMode>,
);
