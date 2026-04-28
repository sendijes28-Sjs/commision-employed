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
          if (!id.includes('node_modules')) return
          if (id.includes('react-dom') || id.includes('react-router') || id.includes('react/')) return 'vendor-react'
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) return 'vendor-charts'
          if (id.includes('lucide-react')) return 'vendor-icons'
          if (id.includes('axios')) return 'vendor-http'
          if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) return 'vendor-form'
          if (id.includes('date-fns') || id.includes('dayjs') || id.includes('moment')) return 'vendor-date'
          if (id.includes('@radix-ui') || id.includes('cmdk') || id.includes('vaul')) return 'vendor-radix'
          return 'vendor-misc'
        }
      }
    },
    chunkSizeWarningLimit: 600,
  }
})