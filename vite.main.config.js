import { defineConfig } from 'vite';
import nodeAddonLoader from './index.js';

export default defineConfig({
  plugins: [
    nodeAddonLoader({
      include: /\.node$/,
      hashLength: 8,
    }),
  ],

  // 构建配置
  build: {
    // 指定入口文件
    lib: {
      entry: 'example/main.js',
      name: 'main',
      fileName: 'main',
      formats: ['es'],
    },

    // 输出目录
    outDir: 'dist',

    // 清空输出目录
    emptyOutDir: false,

    // 最小化
    minify: false,

    // 外部依赖
    rollupOptions: {
      external: ['fs', 'path', 'crypto', 'module', 'url'],
      output: {
        format: 'es',
        entryFileNames: 'main.js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name][extname]',
      },
    },

    // 复制.node文件到dist
    copyPublicDir: false,
  },

  // 开发服务器配置（禁用）
  server: {
    open: false,
    host: false,
  },
});
