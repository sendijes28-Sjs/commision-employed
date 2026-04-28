import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react'
            }
            if (id.includes('recharts') || id.includes('lucide-react')) {
              return 'vendor-ui'
            }
            if (id.includes('axios') || id.includes('react-hook-form')) {
              return 'vendor-form'
            }
            return 'vendor'
          }
        }
      }
    },
    chunkSizeWarningLimit: 600,
  }
})