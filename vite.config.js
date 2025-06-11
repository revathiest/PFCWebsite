import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // root is current dir
  publicDir: 'public', // serve public/ statically
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173
  },
  preview: {
    port: 4173
  },
  base: '/',
  appType: 'spa' // 👈 Important: this ensures index.html fallback
});
