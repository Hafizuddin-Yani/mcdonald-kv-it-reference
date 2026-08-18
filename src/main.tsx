import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { reportDiagnostic } from './utils/diagnostics'

// Register the service worker (best-effort - the app works fine without it).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .catch(() => {
        // SW registration failed or is unavailable - continue without offline.
      })
  })
}

// Capture uncaught errors and unhandled rejections for the App Health page.
window.addEventListener('error', (e) => {
  reportDiagnostic({
    type: 'error',
    message: e.message || 'Unknown window error',
    source: e.filename,
    stack: e.error instanceof Error ? e.error.stack : undefined,
    url: location.href,
  })
})

window.addEventListener('unhandledrejection', (e) => {
  reportDiagnostic({
    type: 'rejection',
    message:
      typeof e.reason === 'string'
        ? e.reason
        : e.reason instanceof Error
          ? e.reason.message
          : 'Unhandled promise rejection',
    stack: e.reason instanceof Error ? e.reason.stack : undefined,
    url: location.href,
  })
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
