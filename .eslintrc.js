module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    // vue/recommended includes all higher levels (vue/strongly-recommended, vue/essential)
    'plugin:vue/recommended',
    '@vue/airbnb',
    '@vue/typescript/recommended',
    '@vue/prettier',
    '@vue/prettier/@typescript-eslint',
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
  },
};
