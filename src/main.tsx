import { createRoot } from 'react-dom/client';
import './index.css';

// DIAGNOSTIC: Minimal render to find what's killing the app
const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#1A3263' }}>✅ React is working!</h1>
      <p>If you see this, React + Vite build is fine. The issue is in the app code.</p>
      <p>Timestamp: {new Date().toISOString()}</p>
    </div>
  );
} else {
  document.body.innerHTML = '<h1>Root not found</h1>';
}
