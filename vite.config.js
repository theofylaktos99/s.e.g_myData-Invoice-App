import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// If deploying to GitHub Pages project site, set base to the repo name
// Using dynamic env to avoid breaking non-GitHub hosting
const repoBase = process.env.GHPAGES_BASE || '';

export default defineConfig({
  base: repoBase || '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  server: {
    port: 8080,
    host: true
  }
})