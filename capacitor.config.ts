import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'fi.cword.app',
  appName: 'C-Word',
  webDir: 'dist',
  backgroundColor: '#102c3b',
  server: {
    androidScheme: 'https'
  }
}

export default config
