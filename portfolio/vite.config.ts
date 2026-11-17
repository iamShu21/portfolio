import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  // '/' for Vercel or a <user>.github.io repo. For a GitHub Pages *project* site
  // (https://<user>.github.io/<repo>/) build with BASE_PATH=/<repo>/.
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
  build: {
    // The Three.js/R3F/drei chunk (~1 MB, ~280 kB gzip) is lazy-loaded after first paint
    // (see Background in App.tsx), so it's expected to be large. Anything else this big
    // should still trigger the warning.
    chunkSizeWarningLimit: 1100,
  },
})
