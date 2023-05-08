import { defineConfig } from 'vite';
import createVuePlugin from '@vitejs/plugin-vue';
import { resolve } from 'path';
import Icons from 'unplugin-icons/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    createVuePlugin({}),
    Icons({
      compiler: 'vue3',
    }),
  ],
  resolve: {
    dedupe: ['vue'],
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 700, // Default is 500
    sourcemap: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/styles/_variables.scss";',
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
    host: '127.0.0.1',
    port: 3000,
  },
});
