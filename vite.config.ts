import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Relativer Basispfad: Capacitor lädt die Dateien lokal aus dem App-Paket (offline).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    chunkSizeWarningLimit: 2500,
  },
  server: { port: 5173 },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
