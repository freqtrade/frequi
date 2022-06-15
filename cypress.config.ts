import { defineConfig } from 'cypress';

export default defineConfig({
  video: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config);
    },
    specPattern: 'cypress/e2e/**/*.cy.ts',
    baseUrl: 'http://localhost:3000',
  },
  component: {
    devServer: {
      framework: 'vue',
      bundler: 'vite',
    },
    // setupNodeEvents(on, config) {},
    specPattern: 'src/**/*.cy.ts',
  },
});
