import pluginJs from '@eslint/js';
import prettierConfig from '@vue/eslint-config-prettier';
import vueEslintConfig from '@vue/eslint-config-typescript';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  ...vueEslintConfig({
    extends: [
      'recommended',
      // 'strict',
    ],
  }),
  prettierConfig,
  {
    languageOptions: {
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
    rules: {
      // // disable eslint no-shadow as it's causing false positives on typescript enums
      // 'no-shadow': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^err|^error',
        },
      ],
      // Custom vue rules

      'vue/block-lang': [
        'error',
        {
          script: {
            lang: 'ts',
          },
        },
      ],
    },
  },
  {
    rules: {
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
      'vue/enforce-style-attribute': ['error'],
      'vue/block-order': [
        'error',
        {
          order: ['script', 'template', 'style'],
        },
      ],
    },
  },
];
