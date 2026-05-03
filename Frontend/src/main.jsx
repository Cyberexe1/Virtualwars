import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Accessibility: run axe-core in development to catch a11y violations in browser console
async function initAxe() {
  if (import.meta.env.DEV) {
    const [{ default: axe }, React, ReactDOM] = await Promise.all([
      import('@axe-core/react'),
      import('react'),
      import('react-dom'),
    ]);
    axe(React, ReactDOM, 1000);
  }
}
initAxe().catch(() => {/* axe not critical */});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
