import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Vercel serves the app at the domain root; GitHub Pages serves this
  // project under /portfolio/, so its workflow sets GH_PAGES to switch base.
  base: process.env.GH_PAGES ? '/portfolio/' : '/',
})
