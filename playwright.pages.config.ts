import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  testMatch: 'offline.spec.ts',
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4176/c-word/',
    ...devices['Pixel 7']
  },
  webServer: {
    command: 'npm exec vite -- preview --mode pages --outDir docs --host 127.0.0.1 --port 4176',
    url: 'http://127.0.0.1:4176/c-word/',
    reuseExistingServer: true
  }
})
