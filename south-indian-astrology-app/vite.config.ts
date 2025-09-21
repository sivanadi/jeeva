import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5000,
    host: '0.0.0.0',
    allowedHosts: [
      'ca7f1eab-3d32-44b7-9323-cf5570d92331-00-27ruhtjsl07fo.spock.replit.dev',
      '.replit.dev', // Allow all Replit dev domains
    ],
  },
})
