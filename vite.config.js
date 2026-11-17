import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// One JS file and one CSS file per build, so the demo build can be inlined
// into a single self-contained HTML page.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    assetsInlineLimit: 100000000,
    rolldownOptions: { output: { codeSplitting: false } },
  },
})
