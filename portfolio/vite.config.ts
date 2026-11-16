import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // The Three.js/R3F/drei chunk (~1 MB, ~280 kB gzip) is lazy-loaded after first paint
    // (see Background in App.tsx), so it's expected to be large. Anything else this big
    // should still trigger the warning.
    chunkSizeWarningLimit: 1100,
  },
})
