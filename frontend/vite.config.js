/**
 * frontend/vite.config.js
 *
 * Vite configuration.
 * Uses the React plugin + Tailwind Vite plugin and proxies `/api` (and `/uploads`)
 * to the backend during local development to avoid browser CORS issues.
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
