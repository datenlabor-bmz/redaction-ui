import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // Use relative paths for GitHub Pages deployment
  base: './',
  plugins: [react()],
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    exclude: ['mupdf'],
  },
  build: {
    target: 'esnext',
  },
  server: {
    fs: {
      // The demo runs from a subfolder but needs to access mupdf's WASM file
      // from the parent's node_modules. This setting allows Vite to serve
      // files outside the demo directory. Normal consumers of the library
      // won't need this since mupdf will be in their own node_modules.
      allow: ['..'],
    },
  },
})

