import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const base = mode === 'pages' ? '/c-word/' : '/'

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'prompt',
        includeAssets: ['icons/icon.svg', 'icons/icon-maskable.svg'],
        manifest: {
          name: 'C-Word – suomalainen sanapeli',
          short_name: 'C-Word',
          description: 'Rauhallinen, kokonaan offline-toimiva suomalainen sanaristikkopeli.',
          theme_color: '#102c3b',
          background_color: '#f3eee2',
          display: 'standalone',
          orientation: 'any',
          start_url: base,
          lang: 'fi',
          categories: ['games', 'education'],
          icons: [
            {
              src: `${base}icons/icon.svg`,
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any'
            },
            {
              src: `${base}icons/icon-maskable.svg`,
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'maskable'
            }
          ]
        },
        workbox: {
          navigateFallback: `${base}index.html`,
          globPatterns: ['**/*.{js,css,html,svg,webmanifest}'],
          cleanupOutdatedCaches: true
        }
      })
    ],
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx']
    }
  }
})
