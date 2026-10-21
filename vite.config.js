import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
export default defineConfig({
  plugins: [react()],
  cacheDir: fileURLToPath(new URL('./.vite-cache', import.meta.url)),
  server: {
    // GoTrue on the local Docker bridge fetches the OTP email template through this host.
    allowedHosts: ['host.docker.internal'],
    fs: { deny: ['.env', '.env.*', '**/.git/**', '**/*.db', '**/*.db-*', '**/.preview/**', '**/server/**'] },
    ...(process.env.POKETURISMO_PREVIEW === '1' ? { proxy: { '/api': process.env.POKETURISMO_API_TARGET || 'http://127.0.0.1:3002' } } : {}),
  },
})
