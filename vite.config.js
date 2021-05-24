import { defineConfig } from 'vite';
import { createVuePlugin } from 'vite-plugin-vue2';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [createVuePlugin()],
  server: {
    host: 'localhost',
    port: 8080,
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, 'src'),
        // replacement: './src/*',
      },
    ],
  },
  build: {
    chunkSizeWarningLimit: 700, // Default is 500
  },
  css: {
    preprocessorOptions: {
      scss: {
           additionalData: '@import "@/styles/_variables.scss";',
         },
       },
    }
});
