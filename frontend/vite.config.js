import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/contacts': {
        target: 'https://backend-light-speed-web-inc.freedev.app/',
        changeOrigin: true
      },
      '/store': {
        target: 'https://backend-light-speed-web-inc.freedev.app/',
        changeOrigin: true
      }
    }
  }
})
