// IPT/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: 'mobile',
  server: {
    port: 5173,  // 👈 Add comma here!
    open: true,   // This will automatically open the browser
    },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      'expo-camera': '/stubs/expo-camera.js',
      'expo-av': '/stubs/expo-camera.js'
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom']
        }
      }
    },
    chunkSizeWarningLimit: 300,
    sourcemap: false,
    cssCodeSplit: true,
    reportCompressedSize: false,
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['node_modules']
  }
})