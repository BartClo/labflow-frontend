import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {

    // proxy para no pegarle directamente al backend todo se maneja llamando /api
        proxy: {
      '/api': {
        target: 'http://localhost:8080',   //backend Spring Boot
        changeOrigin: true,
        secure: false,
        // Preserve the `/api` prefix so requests like `/api/clientes` are
        // forwarded to `http://localhost:8080/api/clientes` (backend uses /api/*)
        rewrite: (path) => path
      }
    }

  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
}) 