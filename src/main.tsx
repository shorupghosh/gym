import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
// @ts-ignore – next-themes types vary per version
import { ThemeProvider } from 'next-themes';
import { GymProvider } from './context/GymContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* @ts-ignore */}
    <ThemeProvider attribute="class" defaultTheme="light">
      <GymProvider>
        <App />
      </GymProvider>
    </ThemeProvider>
  </StrictMode>,
);
