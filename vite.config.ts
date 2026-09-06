import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/YuviTV/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: null,
      manifest: {
        name: 'YuviTV',
        short_name: 'YuviTV',
        description: 'A free, open web player for live IPTV channels from around the world.',
        theme_color: '#05070d',
        background_color: '#05070d',
        display: 'standalone',
        start_url: '/YuviTV/',
        scope: '/YuviTV/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff,woff2}'],
        // App shell is precached above; the catalog dataset itself lives in
        // IndexedDB (see src/data/db.ts) — this is just a network-resilience
        // safety net underneath that, not the primary cache.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/iptv-org\.github\.io\/api\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'yuvitv-catalog-api',
              expiration: { maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },
    }),
  ],
  build: {
    target: 'esnext',
    sourcemap: false,
  },
})
