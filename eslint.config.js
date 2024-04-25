import Vue from 'eslint-plugin-vue';

import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...Vue.configs['flat/recommended'],
  js.configs.recommended,
  ...compat.extends('@vue/eslint-config-typescript/recommended'),
  ...compat.extends('@vue/eslint-config-prettier'),
  {
    languageOptions: {
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,tsx,vue}'],

    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'class-methods-use-this': 0,
      // disable eslint no-shadow as it's causing false positives on typescript enums
      'no-shadow': 'off',
      'prettier/prettier': ['error'],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // '@typescript-eslint/naming-convention': [
      //   'error',
      //   {
      //     selector: 'default',
      //     format: ['camelCase'],
      //   },
      //   {
      //     selector: 'variable',
      //     format: ['camelCase', 'UPPER_CASE'],
      //   },
      //   {
      //     selector: 'parameter',
      //     format: ['camelCase'],
      //     leadingUnderscore: 'allow',
      //   },
      //   {
      //     selector: 'memberLike',
      //     modifiers: ['private'],
      //     format: ['camelCase'],
      //     leadingUnderscore: 'require',
      //   },
      //   {
      //     selector: 'typeLike',
      //     format: ['PascalCase'],
      //   },
      //   {
      //     selector: 'class',
      //     format: ['PascalCase'],
      //   },
      // ],
    },
  },
];
