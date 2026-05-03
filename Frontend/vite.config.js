import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  build: {
    // Target modern browsers — smaller output
    target: 'es2020',

    // Warn if any chunk exceeds 500KB
    chunkSizeWarningLimit: 500,

    rollupOptions: {
      output: {
        // Manual chunk splitting — keeps vendor code separate from app code
        // This means Firebase SDK is cached independently of app changes
        manualChunks: {
          // Firebase SDK — large, changes rarely
          'firebase-core': ['firebase/app', 'firebase/auth'],
          'firebase-db':   ['firebase/firestore', 'firebase/storage'],
          'firebase-analytics': ['firebase/analytics'],

          // React ecosystem — changes rarely
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },

    // Enable source maps for production debugging (optional — remove for smaller build)
    sourcemap: false,

    // Minify with esbuild (default, fastest)
    minify: 'esbuild',
  },

  // Optimise dev server — pre-bundle heavy dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
    ],
  },
});
