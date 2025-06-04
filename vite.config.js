import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const backendPort = process.env.VITE_BACKEND_PORT || '4000'
const isDevelopment = process.env.NODE_ENV === 'development'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: isDevelopment ? {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      }
    } : undefined
  },
})
