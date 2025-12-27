import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'StudiePlanner',
        short_name: 'StudiePlan',
        description: 'Plan je studie slim en haal je deadlines',
        theme_color: '#4f46e5',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      // Use versioned filename to bypass old cached sw.js
      filename: 'sw-v2.js',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // Force new SW to take over immediately
        skipWaiting: true,
        clientsClaim: true,
        // Clean old caches on update
        cleanupOutdatedCaches: true,
        // Runtime caching for API calls (if needed later)
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'external-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          }
        ]
      },
      // Dev options for testing
      devOptions: {
        enabled: true
      }
    })
  ],
})
