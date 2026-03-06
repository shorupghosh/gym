import { createRoot } from 'react-dom/client';
import './index.css';

// Step-by-step module loading to catch which import crashes
const loadApp = async () => {
  const rootEl = document.getElementById('root');
  if (!rootEl) {
    document.body.innerHTML = '<h1>Root not found</h1>';
    return;
  }

  try {
    console.log('[DIAG] Step 1: Loading React...');
    const { StrictMode, Component } = await import('react');
    console.log('[DIAG] Step 1: OK');

    console.log('[DIAG] Step 2: Loading react-dom...');
    // already loaded above
    console.log('[DIAG] Step 2: OK');

    console.log('[DIAG] Step 3: Loading next-themes...');
    const { ThemeProvider } = await import('next-themes');
    console.log('[DIAG] Step 3: OK');

    console.log('[DIAG] Step 4: Loading supabase client...');
    const supabaseMod = await import('./lib/supabase');
    console.log('[DIAG] Step 4: OK - supabase loaded');

    console.log('[DIAG] Step 5: Loading GymContext...');
    const { GymProvider } = await import('./context/GymContext.tsx');
    console.log('[DIAG] Step 5: OK');

    console.log('[DIAG] Step 6: Loading App...');
    const AppMod = await import('./App.tsx');
    const App = AppMod.default;
    console.log('[DIAG] Step 6: OK');

    // Error boundary class
    class ErrorBoundary extends Component<any, { hasError: boolean; error: Error | null }> {
      constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
      }
      static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
      }
      componentDidCatch(error: Error, errorInfo: any) {
        console.error('ErrorBoundary caught:', error, errorInfo);
      }
      render() {
        if (this.state.hasError) {
          return (
            <div style={{ padding: '2rem', fontFamily: 'sans-serif', color: '#fff', background: '#1a1a2e', minHeight: '100vh' }}>
              <h1 style={{ color: '#e94560' }}>App Crash</h1>
              <pre style={{ whiteSpace: 'pre-wrap', background: '#16213e', padding: '1rem', borderRadius: '8px' }}>
                {this.state.error?.message}{'\n\n'}{this.state.error?.stack}
              </pre>
            </div>
          );
        }
        return this.props.children;
      }
    }

    console.log('[DIAG] Step 7: Rendering...');
    createRoot(rootEl).render(
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
    console.log('[DIAG] Step 7: render() called successfully');

  } catch (e: any) {
    console.error('[DIAG] CRASH at module load:', e);
    rootEl.innerHTML = `<div style="padding:2rem;font-family:sans-serif;color:white;background:#1a1a2e;min-height:100vh">
      <h1 style="color:#e94560">Module Load Error</h1>
      <pre style="white-space:pre-wrap;background:#16213e;padding:1rem;border-radius:8px;margin-top:1rem">${e?.message}\n\n${e?.stack}</pre>
    </div>`;
  }
};

loadApp();
