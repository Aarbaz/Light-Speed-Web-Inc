import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/contacts': {
        target: 'http://localhost/Arbaz_Task/backend',
        changeOrigin: true
      },
      '/store': {
        target: 'http://localhost/Arbaz_Task/backend',
        changeOrigin: true
      }
    }
  }
})
