import { defineConfig } from 'vite';
import nodeAddonLoader from './index.js';

export default defineConfig({
  plugins: [
    nodeAddonLoader({
      include: /\.node$/,
      outputDir: 'dist',
      hashLength: 8
    })
  ],
  build: {
    rollupOptions: {
      external: ['fs', 'path', 'crypto', 'module', 'url']
    }
  }
});