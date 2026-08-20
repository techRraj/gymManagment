import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // <-- MUST be a number
    proxy: {
      '/api': {
        target: 'https://gymmanagment-y1sx.onrender.com', // Your deployed backend
        changeOrigin: true,
      },
    },
  },
})