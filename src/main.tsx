import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safety guard against internal Firebase Auth popup assertion bugs in sandboxed iframes
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const msg = reason?.message || String(reason || '');
  const code = reason?.code;

  if (
    code === 'auth/popup-blocked' ||
    msg.includes('popup-blocked') ||
    msg.includes('Pending promise was never set') ||
    code === 'auth/cancelled-popup-request' ||
    code === 'auth/popup-closed-by-user'
  ) {
    // Prevent unhandled error from crashing the runtime
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(<App />);
