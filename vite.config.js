import { defineConfig } from 'vite';
import createVuePlugin from '@vitejs/plugin-vue';
import { resolve } from 'path';
import Icons from 'unplugin-icons/vite';
import Components from 'unplugin-vue-components/vite';
import IconsResolve from 'unplugin-icons/resolver';
import AutoImport from 'unplugin-auto-import/vite';
import { BootstrapVueNextResolver } from 'unplugin-vue-components/resolvers';
import { execSync } from 'child_process';

const commitHash = execSync('git rev-parse --short HEAD').toString();

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash),
  },
  plugins: [
    createVuePlugin({
      script: {
        defineModel: true,
      },
    }),
    Components({
      resolvers: [IconsResolve(), BootstrapVueNextResolver()],
      // dirs: [],
      dts: true,
    }),
    Icons({
      compiler: 'vue3',
    }),
    AutoImport({
      imports: ['vue', 'vue-router', '@vueuse/core'],
      dts: 'src/auto-imports.d.ts',
      dirs: ['src/composables', 'src/stores'],
      vueTemplate: true,
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
