import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
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

      
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
          configure: (proxy) => {
            proxy.on('error', (err, req, res) => {
              const backendUrl = env.VITE_API_BASE_URL || 'http://localhost:8080';
              console.warn(`\x1b[33m[proxy] Backend no disponible en ${backendUrl} → ${req.url}\x1b[0m`);
              if (!res.headersSent) {
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  status: 503,
                  error: 'Backend no disponible',
                  message: `No se puede conectar al backend en ${backendUrl}. Asegúrate de que el servidor esté corriendo.`,
                  path: req.url
                }));
              }
            });
          }
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
  }
}) 