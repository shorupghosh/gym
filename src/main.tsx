import { StrictMode, Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
// @ts-ignore – next-themes types vary per version
import { ThemeProvider } from 'next-themes';
import { GymProvider } from './context/GymContext.tsx';

// Global error boundary to catch silent crashes
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif', color: '#fff', background: '#1a1a2e', minHeight: '100vh' }}>
          <h1 style={{ color: '#e94560' }}>Something went wrong</h1>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#16213e', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

try {
  const root = document.getElementById('root');
  if (!root) {
    document.body.innerHTML = '<h1>Root element not found</h1>';
  } else {
    createRoot(root).render(
      <StrictMode>
        <ErrorBoundary>
          {/* @ts-ignore */}
          <ThemeProvider attribute="class" defaultTheme="light">
            <GymProvider>
              <App />
            </GymProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </StrictMode>,
    );
  }
} catch (e: any) {
  console.error('Fatal mount error:', e);
  document.body.innerHTML = `<div style="padding:2rem;font-family:sans-serif;color:white;background:#1a1a2e;min-height:100vh">
    <h1 style="color:#e94560">Fatal Error During Mount</h1>
    <pre style="white-space:pre-wrap;background:#16213e;padding:1rem;border-radius:8px;margin-top:1rem">${e?.message}\n\n${e?.stack}</pre>
  </div>`;
}
