import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['wise-logo.svg', 'wise-logo-192.png', 'wise-logo-512.png'],
      manifest: {
        name: 'Wise - إدارة المهام',
        short_name: 'Wise',
        description: 'نظام إدارة المهام لشركة Wise للمحاسبة',
        theme_color: '#1e40af',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/wise/',
        start_url: '/wise/',
        icons: [
          {
            src: 'wise-logo-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'wise-logo-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'wise-logo-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  base: '/wise/',
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
