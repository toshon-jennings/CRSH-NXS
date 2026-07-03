import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/CRSH-NXS/',
  plugins: [react()],
  server: {
    port: 5180,
    strictPort: false
  }
})
