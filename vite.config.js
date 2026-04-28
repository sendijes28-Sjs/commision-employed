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

          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) return 'vendor-react'
          if (id.includes('react-router')) return 'vendor-router'

          if (id.includes('@mui/icons-material')) return 'vendor-mui-icons'
          if (id.includes('@mui/material') || id.includes('@emotion') || id.includes('@popperjs')) return 'vendor-mui'
          if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts'
          if (id.includes('lucide-react')) return 'vendor-icons'
          if (id.includes('axios')) return 'vendor-http'
          if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) return 'vendor-form'
          if (id.includes('date-fns') || id.includes('react-day-picker')) return 'vendor-date'
          if (id.includes('@radix-ui') || id.includes('cmdk') || id.includes('vaul') || id.includes('sonner')) return 'vendor-radix'
          if (id.includes('xlsx') || id.includes('motion') || id.includes('embla') || id.includes('react-slick') || id.includes('react-dnd')) return 'vendor-extras'

          return 'vendor-misc'
        }
      }
    },
    chunkSizeWarningLimit: 600,
  }
})