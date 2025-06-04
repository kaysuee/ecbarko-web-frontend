import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isDevelopment = process.env.NODE_ENV === 'development'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: isDevelopment ? {
      '/api': {
        target: 'https://ecbarko-back.onrender.com',
        changeOrigin: true,
        secure: true
      }
    } : undefined
  },
})
