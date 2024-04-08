module.exports = {
  root: true,

  env: {
    node: true,
  },

  extends: [
    // vue/recommended includes all higher levels (vue/strongly-recommended, vue/essential)
    'plugin:vue/vue3-recommended',
    '@vue/typescript/recommended',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier',
    // '@vue/prettier/@typescript-eslint',
  ],

  parser: 'vue-eslint-parser',

  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    ecmaVersion: 2020,
  },

  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'class-methods-use-this': 0,
    // disable eslint no-shadow as it's causing false positives on typescript enums
    'no-shadow': 'off',
    'prettier/prettier': ['error'],
    '@typescript-eslint/no-explicit-any': 'warn',
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

  overrides: [
    {
      files: ['**/__tests__/*.{j,t}s?(x)', '**/tests/unit/**/*.spec.{j,t}s?(x)'],
    },
  ],
};
