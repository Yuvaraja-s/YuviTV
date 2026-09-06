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
    rollupOptions: {
      output: {
        // hls.js and three.js/@react-three/fiber are already split out via
        // dynamic import (only loaded on /watch and inside BootLoader). This
        // separates the other big, rarely-changing vendor code from the app's
        // own (frequently-changing) code, so a redeploy doesn't force
        // visitors to re-download React/Router/Radix/motion every time.
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined
          if (/[\\/](react|react-dom|react-router-dom|scheduler)[\\/]/.test(id)) return 'react-vendor'
          if (/[\\/](framer-motion|motion-dom|motion-utils|gsap)[\\/]/.test(id)) return 'motion-vendor'
          if (/[\\/]@radix-ui[\\/]/.test(id)) return 'radix-vendor'
          return undefined
        },
      },
    },
  },
})
