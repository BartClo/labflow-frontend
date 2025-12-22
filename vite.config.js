import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import {VitePWA } from 'vite-plugin-pwa'; 

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), 
    
    // Configuración del PWA
    VitePWA({
    strategies: "generateSW",
    registerType: 'autoUpdate',
    includeAssets: ['favicon.svg', 'robots.txt', 'icons/*.png', 'public/manifest.webmanifest'],
    manifestFilename: 'manifest.webmanifest',
    manifest: false,
    workbox: {
      runtimeCaching: [
        {
          //Esta configuración es para que no cachee llamadas de las API, vamos que necesite conexión
          urlPattern: /^\/api\/.*$/i,
          handler: 'NetworkOnly',
          options: {
            cacheName: 'api-cache',
          }
        },
        {
          //ahora esto de acá si va a pasar por cache
          urlPattern: /.*\.(js|css|png|jpg|jpeg|svg|gif|woff2?)$/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-cache',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 60 * 60 * 24 * 30 // 1 day
            }
          }
        }
      ]
    }
  })
  ],



  server: {

    // proxy para no pegarle directamente al backend todo se maneja llamando /api
        proxy: {
      '/api': {
        target: 'https://labflow-backend-x7by.onrender.com',   //backend Spring Boot
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