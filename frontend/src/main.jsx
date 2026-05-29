/**
 * frontend/src/main.jsx
 *
 * Frontend bootstrapping entrypoint.
 * Creates the React root, imports global CSS tokens, and renders <App />.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
