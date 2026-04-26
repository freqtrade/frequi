import pluginJs from '@eslint/js';
import prettierConfig from '@vue/eslint-config-prettier';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';

export default defineConfigWithVueTs(
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  prettierConfig,
  {
    rules: {
      // // disable eslint no-shadow as it's causing false positives on typescript enums
      // 'no-shadow': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^err|^error',
        },
      ],
    },
  },
  {
    files: ['src/**/*.vue'],
    rules: {
      // Custom vue rules
      'vue/component-api-style': ['error'],
      'vue/component-name-in-template-casing': [
        'error',
        'PascalCase',
        { registeredComponentsOnly: false, ignores: ['/i-mdi-.*/'] },
      ],
      'vue/block-lang': [
        'error',
        {
          script: {
            lang: 'ts',
          },
        },
      ],
      'vue/define-emits-declaration': ['error'],
      'vue/define-props-declaration': ['error'],
      'vue/enforce-style-attribute': ['error'],
      // TODO: should be activated
      // 'vue/prefer-use-template-ref': ['error'],
      // 'vue/no-useless-v-bind': ['error'],
      'vue/no-undef-directives': ['error'],
      'vue/no-ref-object-reactivity-loss': ['error'],
      'vue/no-use-v-else-with-v-for': ['error'],
      'vue/no-useless-mustaches': ['error'],
      'vue/no-import-compiler-macros': ['error'],
      'vue/eqeqeq': ['error'],
      'vue/block-order': [
        'error',
        {
          order: ['script', 'template', 'style'],
        },
      ],
    },
  },
);
