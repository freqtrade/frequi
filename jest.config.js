module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  // testMatch: ['**/tests/unit/**/*.test.[jt]s?(x)'],
  globals: {
    'ts-jest': {
      tsConfig: 'tests/tsconfig.json',
    },
  },
};
