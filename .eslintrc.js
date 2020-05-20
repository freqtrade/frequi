module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    // 'plugin:vue/recommended',
    '@vue/airbnb',
    'plugin:prettier-vue/recommended',
    'prettier/vue',
  ],
  parserOptions: {
    parser: 'babel-eslint',
  },
  plugins: ['vue'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  },
};
