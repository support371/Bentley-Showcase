import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(import.meta.dirname, 'client'),
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'client', 'src')
    }
  },
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist', 'public'),
    emptyOutDir: true,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          charts: ['recharts'],
          three: ['three'],
          icons: ['lucide-react']
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  }
});
