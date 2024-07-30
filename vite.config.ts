import createVuePlugin from '@vitejs/plugin-vue';
import { BootstrapVueNextResolver } from 'bootstrap-vue-next';
import { execSync } from 'child_process';
import { resolve } from 'path';
import AutoImport from 'unplugin-auto-import/vite';
import IconsResolve from 'unplugin-icons/resolver';
import Icons from 'unplugin-icons/vite';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';

let commitHash: string = 'unknown';
try {
  commitHash = execSync('git rev-parse --short HEAD').toString();
} catch (error) {
  console.error('Failed to get commit hash. Running in this mode will not be supported.');
}

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
      dts: 'src/components.d.ts',
    }),
    Icons({
      compiler: 'vue3',
    }),
    AutoImport({
      imports: ['vue', 'vue-router', '@vueuse/core', 'pinia'],
      dts: 'src/auto-imports.d.ts',
      dirs: ['src/composables', 'src/stores', 'src/utils/**'],
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
  test: {
    environment: 'happy-dom',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
    ],
  },
});
