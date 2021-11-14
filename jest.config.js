module.exports = {
  // preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  // testMatch: ['**/tests/unit/**/*.test.[jt]s?(x)'],
  globals: {
    'ts-jest': {
      tsconfig: 'tests/tsconfig.json',
    },
  },
  testPathIgnorePatterns: ['/node_modules/', '/src/', '/cypress/'],
  // preset: 'vite-jest',
  // preset: 'ts-jest',
  moduleFileExtensions: ['js', 'ts', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
    //   '^.+\\.vue$': '@vue/vue2-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
