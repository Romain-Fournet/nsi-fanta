import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import jsonStorage from './vite-plugin-json-storage.js'

export default defineConfig({
  plugins: [react(), jsonStorage({ dataDir: 'data' })],
  server: { port: 5173, open: false },
})
