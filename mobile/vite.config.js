import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    open: true,
  },
  build: {
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 300,
    sourcemap: false,
    cssCodeSplit: true,
    reportCompressedSize: false,
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})
